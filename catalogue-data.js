(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./catalogues/hoya/catalogue-data.js'), require('./catalogues/zeiss/catalogue-data.js'));
  } else root.MyopiaHubData = factory(root.HoyaCatalogueData, root.MyoActiveData);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (Hoya, Zeiss) {
  'use strict';
  if (!Hoya || !Zeiss) throw new Error('Load the source HOYA and ZEISS catalogue data before the hub data.');
  // Exact product/coating records extracted from Stellest R1.33; tests compare these with the bundled source.
  var stellestProducts = {
      stellest:{
        key:"stellest",
        name:"STELLEST",
        tech:"H.A.L.T.",
        lenslets:"1,021",
        rings:"11",
        extra:"",
        efficacy:"67% less prescription progression on average over two years versus single-vision lenses, in children wearing the lenses at least 12 hours a day.",
        outcome:"Prescription progression study",
        studyContext:"Study ages 8–13, China. Spherical-equivalent prescription change.",
        study:"https://jamanetwork.com/journals/jamaophthalmology/fullarticle/2790589",
        design:"Highly aspherical lenslets arranged across 11 concentric rings.",
        prices:{rock:1300,prevencia:1400}
      },
      stellest2:{
        key:"stellest2",
        name:"STELLEST 2.0",
        tech:"H.A.L.T. MAX",
        lenslets:"1,190",
        rings:"12",
        extra:"169 additional lenslets",
        lensletNote:"Lenslet count pending source confirmation",
        efficacy:"About 47% less estimated cumulative eye-length growth versus original Stellest in a separate one-year crossover study.",
        outcome:"Eye-length growth study",
        studyContext:"50 children aged 6–10 in Singapore. Each eye switched lens design after six months.",
        design:"Higher mean lenslet power and asphericity create a deeper treatment-light region farther in front of the retina.",
        prices:{rock:1700,prevencia:1800},
        study:"https://doi.org/10.1167/tvst.14.11.9"
      }
    };
  var stellestCoatings = {
      rock:{name:"Crizal Rock",copy:"Durable scratch and smudge resistance for active everyday wear."},
      prevencia:{name:"Crizal Prevencia",copy:"Blue-violet light filtering with long-lasting lens protection."}
    };
  var paths = {
    stellest: 'catalogues/stellest/assets/stellest-brochure.pdf',
    hoya: 'catalogues/hoya/assets/hoya-original-brochure.pdf',
    zeiss: 'catalogues/zeiss/assets/myoactive-brochure.pdf'
  };
  var missing = 'Not specified';
  var rows = [
    {key:'lensDesign',label:'Lens family',section:'practical'},
    {key:'lensStyle',label:'Lens option',section:'practical'},
    {key:'coating',label:'Lens coating',section:'practical'},
    {key:'coatingBenefit',label:'Coating features',section:'practical'},
    {key:'index',label:'Material and index',section:'practical'},
    {key:'warrantyDuration',label:'Complimentary replacement period',section:'practical'},
    {key:'warrantyBasis',label:'Replacement based on',section:'practical'},
    {key:'warrantyThreshold',label:'Prescription change condition',section:'practical'},
    {key:'price',label:'Lens price · per pair',section:'practical'},
    {key:'technology',label:'Optical technology',section:'design'},
    {key:'lensletDesign',label:'How the lens is designed',section:'design'},
    {key:'lenslets',label:'Lenslets',section:'design'},
    {key:'rings',label:'Concentric rings',section:'design'},
    {key:'clearZone',label:'Clear central zone',section:'design'},
    {key:'treatmentZone',label:'Treatment zone',section:'design'},
    {key:'defocusPower',label:'Treatment element power',section:'design'},
    {key:'sphereRange',label:'Prescription · sphere',section:'design'},
    {key:'cylinderRange',label:'Prescription · cylinder',section:'design'},
    {key:'combinedRange',label:'Combined prescription limit',section:'design'},
    {key:'studyOutcome',label:'Measured outcome',section:'evidence'},
    {key:'reportedResult',label:'Reported study result',section:'evidence'},
    {key:'studyDuration',label:'Study duration',section:'evidence'},
    {key:'studyComparator',label:'Compared with',section:'evidence'},
    {key:'studyAges',label:'Study ages',section:'evidence'},
    {key:'wearCondition',label:'Wearing condition for the reported result',section:'evidence'},
    {key:'studyContext',label:'Study context',section:'evidence'},
    {key:'evidenceStatus',label:'Evidence source',section:'evidence'}
  ];
  function money(value) { return 'RM' + Math.round(Number(value) || 0).toLocaleString('en-MY'); }
  function normalizeShared(input) {
    input = input && typeof input === 'object' ? input : {};
    var amount = input.frame == null || input.frame === '' ? null :
      ((typeof input.frame === 'number' || typeof input.frame === 'string') ? Number(input.frame) : null);
    if (amount !== null && (!Number.isFinite(amount) || amount < 0 || amount > 99999)) amount = null;
    if (amount !== null) amount = Math.round(amount);
    return {
      frame: amount,
      frameComplimentary: amount !== null && input.frameComplimentary === true,
      followups: {one: !input.followups || input.followups.one !== false, two: !input.followups || input.followups.two !== false},
      complimentary: input.complimentary === true
    };
  }
  function fillFields(fields) {
    var result = {};
    rows.forEach(function (row) { result[row.key] = fields[row.key] == null || fields[row.key] === '' ? missing : String(fields[row.key]); });
    return result;
  }
  function warrantyRecord(source, basis) {
    return {months:source.months,progressionD:source.progressionD,basis:basis || source.basis,
      period:source.period,condition:source.condition,wording:source.wording};
  }
  var options = [];
  Object.keys(stellestProducts).forEach(function (productKey) {
    var p=stellestProducts[productKey], next=productKey==='stellest2';
    Object.keys(p.prices).forEach(function (coatingKey) {
      var c=stellestCoatings[coatingKey], price=p.prices[coatingKey];
      var w={months:6,progressionD:0.75,basis:'prescription',period:'6 months',
        condition:'If prescription power becomes at least 0.75 D more short-sighted within 6 months.',
        wording:'Complimentary replacement if prescription power becomes at least 0.75 D more short-sighted within 6 months.'};
      options.push({id:'essilor-'+productKey+'-'+coatingKey,brand:'stellest',productKey:productKey,styleId:'clear',coatingId:coatingKey,
        name:'Essilor '+p.name+' · '+c.name,shortName:p.name+' · '+c.name,price:price,warranty:w,
        brochurePath:paths.stellest,selection:{product:productKey,coating:coatingKey},
        fields:fillFields({lensDesign:p.name,lensStyle:'Clear',coating:c.name,coatingBenefit:c.copy,index:'1.59 · Airwear',
          warrantyDuration:w.period,warrantyBasis:'Prescription power',warrantyThreshold:w.condition,price:money(price),
          technology:p.tech,lensletDesign:p.design,lenslets:p.lenslets+(next?' (+169 versus STELLEST)':''),
          rings:p.rings+(next?' · wider diameter supports broader frame choice':''),
          sphereRange:'+2.00 D to −12.00 D',cylinderRange:'Up to −4.00 D',
          studyOutcome:p.outcome,reportedResult:p.efficacy,studyDuration:next?'1 year':'2 years',
          studyComparator:next?'Original STELLEST':'Single-vision lenses',studyAges:next?'6–10 years':'8–13 years',
          wearCondition:next?missing:'At least 12 hours per day in the reported wear group',
          studyContext:p.studyContext+(next?' Both trial designs had 11 rings.':''),
          evidenceStatus:next?'H.A.L.T. MAX crossover study, TVST 2025':'Original Stellest two-year study, JAMA Ophthalmology 2022'})});
    });
  });
  Hoya.allOptions().forEach(function (native) {
    var p=Hoya.products[native.productKey], c=Hoya.coatings[native.coatingId], w=warrantyRecord(p.warranty), f=native.fields;
    options.push({id:native.id,brand:'hoya',productKey:native.productKey,styleId:native.styleId,coatingId:native.coatingId,
      name:native.fullName,shortName:native.name,price:native.price,warranty:w,brochurePath:paths.hoya,
      selection:{product:native.productKey,style:native.styleId,coating:native.coatingId},
      fields:fillFields({lensDesign:p.name,lensStyle:Hoya.styles[native.styleId].name,coating:c.name,coatingBenefit:c.copy,index:f.index,
        warrantyDuration:w.period,warrantyBasis:'Sphere power',warrantyThreshold:w.condition,price:money(native.price),
        technology:p.technology,lensletDesign:p.design,clearZone:f.clearZone,treatmentZone:f.treatmentZone,defocusPower:f.defocusPower,
        sphereRange:f.sphereRange,cylinderRange:f.cylinderRange,combinedRange:f.combinedRange,
        studyOutcome:'Prescription progression (spherical equivalent) and eye-length growth',
        reportedResult:p.clinical.refractionDifferenceD.toFixed(2)+' D less prescription progression and '+p.clinical.axialDifferenceMm.toFixed(2)+' mm less eye-length growth on average'+(native.productKey==='miyosmart'?' (calculated from the supplied trial chart).':'.'),
        studyDuration:f.studyDuration,studyComparator:p.clinical.comparator,studyAges:p.clinical.studyAges,
        studyContext:'12-month results from the supplied HOYA trial chart.',evidenceStatus:p.clinical.status})});
  });
  Zeiss.comparisonOptions().forEach(function (native) {
    var p=Zeiss.product, c=Zeiss.coatings[native.coatingId], w=warrantyRecord(p.warranty,'prescription'), f=native.fields;
    options.push({id:native.id,brand:'zeiss',productKey:'myoactive',styleId:'clear',coatingId:native.coatingId,
      name:p.name+' · '+c.name,shortName:'MyoActive · '+c.shortName,price:c.price,warranty:w,brochurePath:paths.zeiss,
      selection:{coating:native.coatingId},
      fields:fillFields({lensDesign:p.name,lensStyle:'Clear',coating:c.name,coatingBenefit:c.copy,index:f.index,
        warrantyDuration:w.period,warrantyBasis:'Prescription power',warrantyThreshold:w.condition,price:money(c.price),
        technology:p.technology,lensletDesign:'Variable positive powers with a deliberately non-repeating arrangement.',
        clearZone:p.clearZoneMm+' mm',defocusPower:p.elementPower,
        sphereRange:f.sphereRange,cylinderRange:f.cylinderRange,combinedRange:f.combinedRange,
        studyOutcome:'Prescription progression (spherical equivalent) and eye-length growth',
        reportedResult:p.clinical.refractionDifferenceD.toFixed(2)+' D less prescription progression and '+p.clinical.axialDifferenceMm.toFixed(2)+' mm less eye-length growth on average.',
        studyDuration:f.studyDuration,studyComparator:p.clinical.comparator,studyAges:p.clinical.studyAges,
        studyContext:p.clinical.country+' · trial '+p.clinical.trial,evidenceStatus:p.clinical.status})});
  });
  var lookup=Object.create(null);
  options.forEach(function(option){lookup[option.id]=option;});
  var brands=[
    {id:'stellest',name:'Essilor',defaultOptionId:'essilor-stellest-rock',brochurePath:paths.stellest},
    {id:'hoya',name:'HOYA',defaultOptionId:'hoya-miyosmart-iq-clear-spark',brochurePath:paths.hoya},
    {id:'zeiss',name:'ZEISS',defaultOptionId:'zeiss-myoactive-platinum',brochurePath:paths.zeiss}
  ];
  var defaults=brands.map(function(brand){return brand.defaultOptionId;});
  function getOption(id){return typeof id==='string' && Object.prototype.hasOwnProperty.call(lookup,id)?lookup[id]:null;}
  function total(optionOrId,input){
    var option=getOption(typeof optionOrId==='string'?optionOrId:optionOrId && optionOrId.id);
    if(!option)throw new RangeError('Unknown lens option');
    var state=normalizeShared(input),count=Number(state.followups.one)+Number(state.followups.two),frame=state.frameComplimentary?0:(state.frame||0),followups=state.complimentary?0:count*120;
    return {lens:option.price,frame:frame,followups:followups,followupCount:count,grand:option.price+frame+followups};
  }
  function normalizeComparison(ids){
    var selected=[],seen=Object.create(null);
    (Array.isArray(ids)?ids:[]).some(function(id){if(getOption(id)&&!seen[id]){selected.push(id);seen[id]=true;}return selected.length===3;});
    return selected;
  }
  function optionForState(brand,state){
    state=state||{};
    if(brand==='hoya')return getOption(Hoya.optionForState(state).id);
    if(brand==='zeiss')return getOption('zeiss-myoactive-'+Zeiss.normalizeState(state).coating);
    if(brand==='stellest'){
      var p=Object.prototype.hasOwnProperty.call(stellestProducts,state.product)?state.product:'stellest';
      var c=Object.prototype.hasOwnProperty.call(stellestProducts[p].prices,state.coating)?state.coating:'rock';
      return getOption('essilor-'+p+'-'+c);
    }
    return null;
  }
  function selectionForOption(id){var option=getOption(id);return option?Object.assign({},option.selection):null;}
  function freeze(value){if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.keys(value).forEach(function(key){freeze(value[key]);});Object.freeze(value);}return value;}
  freeze(options);freeze(brands);freeze(defaults);freeze(rows);
  return {schemaVersion:1,sourceVersions:{stellest:'R1.33',hoya:'R1.6',zeiss:'R1.6'},options:options,brands:brands,defaults:defaults,rows:rows,
    missingValue:missing,money:money,getOption:getOption,normalizeShared:normalizeShared,total:total,normalizeComparison:normalizeComparison,
    optionForState:optionForState,selectionForOption:selectionForOption};
});
