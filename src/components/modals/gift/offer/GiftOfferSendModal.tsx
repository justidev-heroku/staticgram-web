import { memo, useEffect, useMemo, useState } from '../../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../../global';

import type { ApiPeer } from '../../../../api/types';
import type { TabState } from '../../../../global/types';

import { STARS_CURRENCY_CODE } from '../../../../config';
import { getPeerTitle } from '../../../../global/helpers/peers';
import { selectPeer } from '../../../../global/selectors';
import { formatStarsAsIcon, formatStarsAsText } from '../../../../util/localization/format';

import useCurrentOrPrev from '../../../../hooks/useCurrentOrPrev';
import useLang from '../../../../hooks/useLang';
import useLastCallback from '../../../../hooks/useLastCallback';

import Button from '../../../ui/Button';
import InputText from '../../../ui/InputText';
import Modal from '../../../ui/Modal';
import RadioGroup from '../../../ui/RadioGroup';

import styles from './GiftOfferSendModal.module.scss';

// Offer lifetimes accepted by payments.sendStarGiftOffer (hours).
const OFFER_DURATION_HOURS = [6, 12, 24, 36, 48, 72];
const DEFAULT_DURATION_HOURS = 24;
const MAX_OFFER_STARS = 1_000_000_000;

export type OwnProps = {
  modal: TabState['giftOfferSendModal'];
};

type StateProps = {
  ownerPeer?: ApiPeer;
  starsBalance?: number;
};

const GiftOfferSendModal = ({ modal, ownerPeer, starsBalance }: OwnProps & StateProps) => {
  const { closeGiftOfferSendModal, sendStarGiftOffer } = getActions();
  const lang = useLang();

  const isOpen = Boolean(modal);
  const renderingModal = useCurrentOrPrev(modal);
  const renderingOwnerPeer = useCurrentOrPrev(ownerPeer);
  const gift = renderingModal?.gift;
  const minStars = gift?.offerMinStars || 1;

  const [price, setPrice] = useState<number | undefined>(undefined);
  const [durationHours, setDurationHours] = useState(String(DEFAULT_DURATION_HOURS));

  useEffect(() => {
    if (isOpen) {
      setPrice(undefined);
      setDurationHours(String(DEFAULT_DURATION_HOURS));
    }
  }, [isOpen]);

  const durationOptions = useMemo(() => OFFER_DURATION_HOURS.map((hours) => ({
    value: String(hours),
    label: lang('Hours', { count: hours }, { pluralValue: hours }),
  })), [lang]);

  const handleChangePrice = useLastCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const number = parseInt(value, 10);
    setPrice(value === '' || Number.isNaN(number) ? undefined : Math.min(number, MAX_OFFER_STARS));
  });

  const handleClose = useLastCallback(() => {
    closeGiftOfferSendModal();
  });

  const isPriceCorrect = Boolean(price) && price >= minStars;
  const isBalanceEnough = starsBalance === undefined || !price || price <= starsBalance;

  const handleSend = useLastCallback(() => {
    if (!renderingModal || !gift || !isPriceCorrect) return;
    closeGiftOfferSendModal();
    sendStarGiftOffer({
      peerId: renderingModal.peerId,
      gift,
      price: { currency: STARS_CURRENCY_CODE, amount: price, nanos: 0 },
      duration: Number(durationHours) * 60 * 60,
    });
  });

  const ownerTitle = renderingOwnerPeer ? getPeerTitle(lang, renderingOwnerPeer) : gift?.ownerName;
  const giftTitle = gift ? lang('GiftUnique', { title: gift.title, number: gift.number }) : '';

  return (
    <Modal
      isOpen={isOpen}
      title={lang('GiftOfferSendTitle')}
      hasCloseButton
      isSlim
      onClose={handleClose}
    >
      <div className={styles.description}>
        {lang('GiftOfferSendText', {
          user: ownerTitle || '',
          gift: giftTitle,
        }, { withNodes: true, withMarkdown: true })}
      </div>

      <div className={styles.inputPrice}>
        <InputText
          label={lang('GiftOfferEnterPrice')}
          onChange={handleChangePrice}
          value={price?.toString() || ''}
          inputMode="numeric"
          tabIndex={0}
          teactExperimentControlled
        />
      </div>

      <div className={styles.hint}>
        <span>
          {lang('GiftOfferMinPrice', {
            amount: formatStarsAsText(lang, minStars),
          }, { withNodes: true, withMarkdown: true })}
        </span>
        {starsBalance !== undefined && (
          <span className={styles.balance}>
            {lang('GiftOfferBalance', {
              amount: formatStarsAsIcon(lang, starsBalance, { asFont: true }),
            }, { withNodes: true })}
          </span>
        )}
      </div>

      <div className={styles.sectionTitle}>{lang('GiftOfferDuration')}</div>
      <RadioGroup
        className={styles.durations}
        name="gift-offer-duration"
        options={durationOptions}
        selected={durationHours}
        onChange={setDurationHours}
      />

      {!isBalanceEnough && (
        <div className={styles.error}>{lang('GiftOfferNotEnoughStars')}</div>
      )}

      <Button
        noForcedUpperCase
        disabled={!isPriceCorrect || !isBalanceEnough}
        onClick={handleSend}
      >
        {isPriceCorrect
          ? lang('ButtonOfferAmount', {
            amount: formatStarsAsIcon(lang, price, { asFont: true }),
          }, { withNodes: true })
          : lang('GiftOfferMakeButton')}
      </Button>
    </Modal>
  );
};

export default memo(withGlobal<OwnProps>(
  (global, { modal }): Complete<StateProps> => {
    const ownerPeer = modal ? selectPeer(global, modal.peerId) : undefined;
    const starsBalance = global.stars?.balance?.amount;

    return {
      ownerPeer,
      starsBalance,
    };
  },
)(GiftOfferSendModal));
