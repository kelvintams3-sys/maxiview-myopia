(function (root, factory) {
  var copy = factory();
  if (typeof module === 'object' && module.exports) module.exports = copy;
  else root.HubCopy = copy;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  return {
    title: 'Maxiview Myopia Management',
    subtitle: 'Explore the lenses and compare your choices.',
    compareTitle: 'Compare lenses',
    compareIntro: 'Compare your current lens selections.',
    practicalTitle: 'Lens comparison',
    designTitle: 'Technical specifications',
    evidenceTitle: 'Clinical study details',
    practicalIntro: 'Compare the lens design, coating and replacement terms.',
    evidenceIntro: '',
    useLensLabel: 'Review summary',
    compareButtonLabel: 'Compare lenses',
    addLensLabel: 'Add lens',
    packageButtonLabel: 'Frame',
    packageTitle: 'Frame',
    packageIntro: 'Add the optional frame to this comparison.',
    frameTitle: 'Frame',
    frameIntro: 'Add the frame amount to compare the lens and frame together.',
    frameButtonLabel: 'Frame',
    frameAmountLabel: 'Frame amount',
    frameApplyLabel: 'Apply frame',
    chooserAddTitle: 'Add lens',
    chooserChangeTitle: 'Change lens',
    chooserHelp: 'Choose a model, lens style and coating. Cancel keeps your selection unchanged.',
    chooserOptionLabel: 'Lens, style and coating',
    chooserAddLabel: 'Add lens',
    chooserChangeLabel: 'Change lens',
    chooserCancelLabel: 'Cancel',
    currentCatalogueLabel: 'Current in catalogue',
    emptyComparison: 'Select lenses in the brand catalogues to compare them.',
    selectionAddedMessage: 'Added to comparison.',
    duplicateMessage: 'This lens option is already in your comparison.',
    maxCompareMessage: 'Compare up to three options. Remove one to add another.',
    printBusyMessage: 'Printing is in progress. Please wait before switching catalogues.',
    recommendationIntro: 'Choose a lens to review the complete quotation.',
    brandNotes: {
      stellest: 'Compare STELLEST and STELLEST 2.0, then choose Crizal Rock or Crizal Prevencia.',
      hoya: 'Choose MiYOSMART or MiYOSMART iQ, then select the available lens style and coating.',
      zeiss: 'Both MyoActive coating choices use the same lens design. Choose Platinum UV or BlueProtect UV.'
    },
    explanations: {
      stellest: 'H.A.L.T. uses highly aspherical lenslets arranged across 11 concentric rings.',
      stellest2: 'H.A.L.T. MAX uses higher mean lenslet power and asphericity to create a deeper treatment-light region in front of the retina.',
      miyosmart: 'D.I.M.S. combines a clear central zone with surrounding defocus segments.',
      iq: 'Triple Enhanced Design brings treatment closer to the centre, increases defocus power and widens treatment coverage compared with MiYOSMART.',
      myoactive: 'M.O.V.E. combines variable positive element powers with a deliberately non-repeating arrangement. ClearFocus is a separate back-surface design.'
    }
  };
});
