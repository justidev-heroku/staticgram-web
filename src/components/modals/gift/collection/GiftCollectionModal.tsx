import { memo, useEffect, useState } from '../../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../../global';

import type { ApiStarGiftCollection } from '../../../../api/types';
import type { TabState } from '../../../../global/types';

import { selectPeerStarGiftCollections } from '../../../../global/selectors';

import useCurrentOrPrev from '../../../../hooks/useCurrentOrPrev';
import useLang from '../../../../hooks/useLang';
import useLastCallback from '../../../../hooks/useLastCallback';

import Button from '../../../ui/Button';
import Checkbox from '../../../ui/Checkbox';
import InputText from '../../../ui/InputText';
import Modal from '../../../ui/Modal';

import styles from './GiftCollectionModal.module.scss';

// Matches the server limit for star gift collection titles (runes)
const MAX_TITLE_LENGTH = 12;

export type OwnProps = {
  modal: TabState['giftCollectionModal'];
};

type StateProps = {
  collections?: ApiStarGiftCollection[];
};

type Mode = NonNullable<TabState['giftCollectionModal']>['mode'];

const GiftCollectionModal = ({ modal, collections }: OwnProps & StateProps) => {
  const {
    closeGiftCollectionModal,
    createStarGiftCollection,
    updateStarGiftCollection,
  } = getActions();
  const lang = useLang();

  const isOpen = Boolean(modal);
  const renderingModal = useCurrentOrPrev(modal);
  const peerId = renderingModal?.peerId;
  const gift = renderingModal?.gift;
  const inputGift = gift?.inputGift;

  const [mode, setMode] = useState<Mode>('create');
  const [title, setTitle] = useState('');
  const [memberIds, setMemberIds] = useState<number[]>([]);

  const editingCollection = renderingModal?.collectionId !== undefined
    ? collections?.find((c) => c.collectionId === renderingModal.collectionId)
    : undefined;

  useEffect(() => {
    if (!modal) return;
    setMode(modal.mode);
    setTitle(modal.mode === 'rename' ? (editingCollection?.title || '') : '');
    setMemberIds(modal.gift?.collectionIds || []);
    // eslint-disable-next-line react-hooks-static-deps/exhaustive-deps
  }, [modal]);

  const handleClose = useLastCallback(() => {
    closeGiftCollectionModal();
  });

  const handleTitleChange = useLastCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value.slice(0, MAX_TITLE_LENGTH));
  });

  const trimmedTitle = title.trim();

  const handleSubmitTitle = useLastCallback(() => {
    if (!peerId || !trimmedTitle) return;

    if (mode === 'rename' && renderingModal?.collectionId !== undefined) {
      updateStarGiftCollection({ peerId, collectionId: renderingModal.collectionId, title: trimmedTitle });
    } else {
      createStarGiftCollection({
        peerId,
        title: trimmedTitle,
        gifts: inputGift ? [inputGift] : undefined,
      });
    }
    closeGiftCollectionModal();
  });

  const handleKeyDown = useLastCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmitTitle();
    }
  });

  const handleToggleCollection = useLastCallback((collectionId: number, isChecked: boolean) => {
    if (!peerId || !inputGift) return;

    setMemberIds((ids) => (isChecked ? [...ids, collectionId] : ids.filter((id) => id !== collectionId)));
    updateStarGiftCollection({
      peerId,
      collectionId,
      addGifts: isChecked ? [inputGift] : undefined,
      removeGifts: isChecked ? undefined : [inputGift],
    });
  });

  const handleNewCollection = useLastCallback(() => {
    setTitle('');
    setMode('create');
  });

  function renderTitleForm() {
    const isRename = mode === 'rename';

    return (
      <>
        {!isRename && (
          <div className={styles.description}>
            {lang(inputGift ? 'GiftCollectionCreateWithGiftHint' : 'GiftCollectionCreateHint')}
          </div>
        )}
        <InputText
          className={styles.input}
          label={lang('GiftCollectionNameLabel')}
          value={title}
          maxLength={MAX_TITLE_LENGTH}
          hasLengthIndicator
          autoFocus
          teactExperimentControlled
          onChange={handleTitleChange}
          onKeyDown={handleKeyDown}
        />
        <Button noForcedUpperCase disabled={!trimmedTitle} onClick={handleSubmitTitle}>
          {lang(isRename ? 'GiftCollectionSave' : 'GiftCollectionCreateButton')}
        </Button>
      </>
    );
  }

  function renderPicker() {
    return (
      <>
        {collections?.length ? (
          <div className={styles.list}>
            {collections.map((collection) => (
              <Checkbox
                key={collection.collectionId}
                label={collection.title}
                subLabel={lang('GiftCollectionGiftsCount', {
                  count: collection.giftsCount,
                }, { pluralValue: collection.giftsCount })}
                checked={memberIds.includes(collection.collectionId)}
                onCheck={(isChecked) => handleToggleCollection(collection.collectionId, isChecked)}
              />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>{lang('GiftCollectionEmptyList')}</div>
        )}
        <div className={styles.buttons}>
          <Button noForcedUpperCase isText onClick={handleNewCollection}>
            {`+ ${lang('GiftCollectionNewTab')}`}
          </Button>
          <Button noForcedUpperCase onClick={handleClose}>
            {lang('GiftCollectionDone')}
          </Button>
        </div>
      </>
    );
  }

  const modalTitle = mode === 'pick'
    ? lang('GiftCollectionAddTo')
    : lang(mode === 'rename' ? 'GiftCollectionRename' : 'GiftCollectionNewTitle');

  return (
    <Modal
      isOpen={isOpen}
      title={modalTitle}
      hasCloseButton
      isSlim
      onClose={handleClose}
    >
      {mode === 'pick' ? renderPicker() : renderTitleForm()}
    </Modal>
  );
};

export default memo(withGlobal<OwnProps>(
  (global, { modal }): Complete<StateProps> => {
    const collections = modal ? selectPeerStarGiftCollections(global, modal.peerId) : undefined;

    return {
      collections,
    };
  },
)(GiftCollectionModal));
