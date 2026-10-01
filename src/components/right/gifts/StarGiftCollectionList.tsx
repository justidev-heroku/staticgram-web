import { memo, useMemo } from '../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../global';

import type { ApiStarGiftCollection } from '../../../api/types';
import type { ProfileCollectionKey } from '../../../global/selectors/payments';
import type { AnimationLevel } from '../../../types';
import type { TabItem } from '../../common/AnimatedTabList';

import { selectActiveGiftsCollectionId, selectCanUseGiftProfileAdminFilter } from '../../../global/selectors';
import { selectSharedSettings } from '../../../global/selectors/sharedState';
import buildClassName from '../../../util/buildClassName';

import useLang from '../../../hooks/useLang';
import useLastCallback from '../../../hooks/useLastCallback';

import AnimatedTabList from '../../common/AnimatedTabList';

import styles from './StarGiftCollectionList.module.scss';
type OwnProps = {
  peerId: string;
  className?: string;
};

type StateProps = {
  collections?: ApiStarGiftCollection[];
  activeCollectionId: ProfileCollectionKey;
  animationLevel: AnimationLevel;
  canManage: boolean;
};

const NEW_COLLECTION_TAB_ID = 'new';

const StarGiftCollectionList = ({
  peerId,
  className,
  collections,
  activeCollectionId,
  animationLevel,
  canManage,
}: StateProps & OwnProps) => {
  const { updateSelectedGiftCollection, resetSelectedGiftCollection, openGiftCollectionModal } = getActions();
  const lang = useLang();

  const handleItemSelect = useLastCallback((itemId: string) => {
    if (itemId === NEW_COLLECTION_TAB_ID) {
      openGiftCollectionModal({ peerId, mode: 'create' });
    } else if (itemId === 'all') {
      resetSelectedGiftCollection({ peerId });
    } else {
      const collectionId = Number(itemId);
      updateSelectedGiftCollection({ peerId, collectionId });
    }
  });

  const items: TabItem[] = useMemo(() => [
    {
      id: 'all',
      title: lang('AllGiftsCategory'),
    },
    ...(collections || []).map((collection) => ({
      id: String(collection.collectionId),
      title: collection.title,
      sticker: collection.icon,
    })),
    ...(canManage ? [{
      id: NEW_COLLECTION_TAB_ID,
      title: `+ ${lang('GiftCollectionNewTab')}`,
    }] : []),
  ], [collections, lang, canManage]);

  if (!collections || (collections.length === 0 && !canManage)) {
    return undefined;
  }

  const selectedItemId = activeCollectionId ? String(activeCollectionId) : 'all';

  return (
    <AnimatedTabList
      items={items}
      selectedItemId={selectedItemId}
      animationLevel={animationLevel}
      onItemSelect={handleItemSelect}
      className={buildClassName(styles.tabList, className)}
    />
  );
};

export default memo(withGlobal<OwnProps>(
  (global, { peerId }): Complete<StateProps> => {
    const { starGiftCollections } = global;
    const collections = starGiftCollections?.byPeerId?.[peerId];
    const activeCollectionId = selectActiveGiftsCollectionId(global, peerId);

    return {
      collections,
      activeCollectionId,
      animationLevel: selectSharedSettings(global).animationLevel,
      canManage: Boolean(selectCanUseGiftProfileAdminFilter(global, peerId)),
    };
  },
)(StarGiftCollectionList));
