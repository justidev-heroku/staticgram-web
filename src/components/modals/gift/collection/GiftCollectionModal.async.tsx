import type { OwnProps } from './GiftCollectionModal';

import { Bundles } from '../../../../util/moduleLoader';

import useModuleLoader from '../../../../hooks/useModuleLoader';

const GiftCollectionModalAsync = (props: OwnProps) => {
  const { modal } = props;
  const GiftCollectionModal = useModuleLoader(Bundles.Stars, 'GiftCollectionModal', !modal);

  return GiftCollectionModal ? <GiftCollectionModal {...props} /> : undefined;
};

export default GiftCollectionModalAsync;
