import type { OwnProps } from './GiftOfferSendModal';

import { Bundles } from '../../../../util/moduleLoader';

import useModuleLoader from '../../../../hooks/useModuleLoader';

const GiftOfferSendModalAsync = (props: OwnProps) => {
  const { modal } = props;
  const GiftOfferSendModal = useModuleLoader(Bundles.Stars, 'GiftOfferSendModal', !modal);

  return GiftOfferSendModal ? <GiftOfferSendModal {...props} /> : undefined;
};

export default GiftOfferSendModalAsync;
