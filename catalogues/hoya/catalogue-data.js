(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HoyaCatalogueData=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
var products={
 miyosmart:{id:'hoya-miyosmart',key:'miyosmart',name:'MiYOSMART',technology:'D.I.M.S.',clearZoneMm:9.4,treatmentZoneMm:33,defocusPowerD:3.5,index:'1.59',material:'Polycarbonate',
  design:'Clear central vision with defocus segments designed to help slow eye growth.',
  warranty:{months:6,progressionD:0.75,basis:'sphere',period:'6 months',title:'6-Month Prescription Change Guarantee',shortTitle:'6-MONTH RX GUARANTEE',condition:'If sphere power becomes at least 0.75 D more short-sighted within 6 months.',wording:'Complimentary replacement if sphere power becomes at least 0.75 D more short-sighted within 6 months.'},
  clinical:{months:12,refractionDifferenceD:0.28,axialDifferenceMm:0.14,comparator:'Ordinary single-vision spectacles',status:'Calculated from the 12-month trial chart in the supplied HOYA brochure',source:'HOYA data on file, April 2026; ARVO 2026',studyAges:'4–12 years'},
  prices:{clear:{stx:1300,fullcontrol:1400},chameleon:{stx:1500,fullcontrol:1500},sunbird:{stx:1600}}},
 iq:{id:'hoya-miyosmart-iq',key:'iq',name:'MiYOSMART iQ',technology:'D.I.M.S. with Triple Enhanced Design',clearZoneMm:6.9,treatmentZoneMm:41,defocusPowerD:4.5,index:'1.59',material:'Polycarbonate',
  design:'Treatment closer to the centre, stronger defocus power and wider treatment coverage.',
  warranty:{months:12,progressionD:0.50,basis:'sphere',period:'1 year',title:'1-Year Prescription Change Guarantee',shortTitle:'1-YEAR RX GUARANTEE',condition:'If sphere power becomes at least 0.50 D more short-sighted within 1 year.',wording:'Complimentary replacement if sphere power becomes at least 0.50 D more short-sighted within 1 year.'},
  clinical:{months:12,refractionDifferenceD:0.58,axialDifferenceMm:0.27,comparator:'Ordinary single-vision spectacles',status:'ARVO 2026 presentation and HOYA data on file, April 2026',source:'HOYA data on file, April 2026; ARVO 2026',studyAges:'4–12 years'},
  prices:{clear:{spark:1700,fullcontrol:1800},chameleon:{spark:1800,fullcontrol:1900}}}
};
var coatings={
 stx:{id:'stx',name:'MiYOSMART Coating STX',shortName:'MiYOSMART STX',copy:'Everyday protective coating.'},
 spark:{id:'spark',name:'S.P.A.R.K. Coating',shortName:'S.P.A.R.K.',copy:'Improved scratch resistance and lasting easy cleaning versus the previous MiYOSMART generation.'},
 fullcontrol:{id:'fullcontrol',name:'Full Control Coating STX',shortName:'Full Control',copy:'Includes BlueControl, UV Control and Bacterial Control.'}
};
var styles={clear:{id:'clear',name:'Clear',copy:'Clear lenses for everyday wear.'},chameleon:{id:'chameleon',name:'Chameleon',badge:'Photochromic',copy:'Light-adaptive tint for changing indoor and outdoor conditions.'},sunbird:{id:'sunbird',name:'Sunbird',copy:'Sunwear option.'}};
var comparisonRows=[
 {key:'lensDesign',label:'Lens design'},{key:'technology',label:'Optical technology'},
 {key:'lensStyle',label:'Lens option'},{key:'coating',label:'Coating'},{key:'index',label:'Lens index'},
 {key:'clearZone',label:'Clear central zone'},{key:'treatmentZone',label:'Treatment zone'},{key:'defocusPower',label:'Defocus power'},
 {key:'sphereRange',label:'Prescription · sphere'},{key:'cylinderRange',label:'Prescription · cylinder'},{key:'combinedRange',label:'Combined prescription limit'},
 {key:'refractionEffect',label:'Less prescription progression'},{key:'axialEffect',label:'Less eye-length growth'},
 {key:'studyDuration',label:'Study duration'},{key:'studyComparator',label:'Study comparator'},{key:'evidenceStatus',label:'Evidence source'},
 {key:'warrantyDuration',label:'Replacement warranty · period'},{key:'warrantyThreshold',label:'Replacement warranty · sphere change'},
 {key:'price',label:'Lens price · per pair'}
];
function own(o,k){return Object.prototype.hasOwnProperty.call(o,k);}
function money(value){return 'RM'+Number(value).toLocaleString('en-MY',{maximumFractionDigits:0});}
function normalizeState(input){
 input=input||{};var product=own(products,input.product)?input.product:'iq';var p=products[product];
 var style=own(p.prices,input.style)?input.style:'clear';var allowed=p.prices[style];var coating=own(allowed,input.coating)?input.coating:Object.keys(allowed)[0];
 var frame=input.frame==null||input.frame===''?null:Number(input.frame);if(frame!==null&&(!Number.isFinite(frame)||frame<0||frame>99999))frame=null;if(frame!==null)frame=Math.round(frame);
 return {product:product,style:style,coating:coating,frame:frame,frameComplimentary:frame!==null&&input.frameComplimentary===true,
 followups:{one:!input.followups||input.followups.one!==false,two:!input.followups||input.followups.two!==false},complimentary:input.complimentary===true};
}
function price(input){var s=normalizeState(input);return products[s.product].prices[s.style][s.coating];}
function totals(input){var s=normalizeState(input),lens=price(s),count=Number(s.followups.one)+Number(s.followups.two),frame=s.frameComplimentary?0:s.frame||0,followups=s.complimentary?0:count*120;
 return {lens:lens,frame:frame,followups:followups,followupCount:count,grand:lens+frame+followups};}
function prescription(product,style){
 var iq=product==='iq',max=(!iq&&style!=='clear')?10:13;
 return {sphereMin:-max,sphereMax:iq?4:0,cylinderMin:-4,combinedMin:-max,positiveSphereMin:iq?0.25:null,positiveSphereMax:iq?4:null,positiveMaxSE:iq?2:null,
 sphereText:iq?'0.00 D to −13.00 D; +0.25 D to +4.00 D*':'0.00 D to −'+max.toFixed(2)+' D',
 combinedText:iq?'Minus Rx: −13.00 D maximum; plus Rx: SE ≤ +2.00 D':'Up to −'+max.toFixed(2)+' D'};
}
function availableCoatings(product,style){if(!own(products,product)||!own(products[product].prices,style))return [];return Object.keys(products[product].prices[style]);}
function styleLabel(style){return style.badge?style.name+' ('+style.badge+')':style.name;}
function optionForState(input){
 var s=normalizeState(input),p=products[s.product],c=coatings[s.coating],style=styles[s.style],rx=prescription(s.product,s.style),w=p.warranty;
 return {id:p.id+'-'+s.style+'-'+s.coating,productId:p.id,productKey:s.product,styleId:s.style,coatingId:s.coating,name:p.name+' · '+styleLabel(style)+' · '+c.shortName,
 fullName:'HOYA '+p.name+' '+styleLabel(style)+' · '+c.name,price:price(s),currency:'MYR',priceBasis:'pair',warranty:{months:w.months,progressionD:w.progressionD,basis:w.basis},prescription:rx,
 fields:{lensDesign:p.name,technology:p.technology,lensStyle:styleLabel(style),coating:c.name,index:'1.59 · Polycarbonate',
 clearZone:p.clearZoneMm.toFixed(1)+' mm',treatmentZone:p.treatmentZoneMm+' mm',defocusPower:'+'+p.defocusPowerD.toFixed(1)+' D',sphereRange:rx.sphereText,cylinderRange:'Up to −4.00 D',combinedRange:rx.combinedText,
 refractionEffect:p.clinical.refractionDifferenceD.toFixed(2)+' D on average'+(s.product==='miyosmart'?' (calculated from trial chart)':''),axialEffect:p.clinical.axialDifferenceMm.toFixed(2)+' mm on average'+(s.product==='miyosmart'?' (calculated from trial chart)':''),
 studyDuration:'12 months',studyComparator:p.clinical.comparator,evidenceStatus:p.clinical.status,
 warrantyDuration:w.period,warrantyThreshold:'Sphere power at least '+w.progressionD.toFixed(2)+' D more short-sighted (additional −'+w.progressionD.toFixed(2)+' D or more)',price:money(price(s))}};
}
function allOptions(){var out=[];Object.keys(products).forEach(function(product){Object.keys(products[product].prices).forEach(function(style){availableCoatings(product,style).forEach(function(coating){out.push(optionForState({product:product,style:style,coating:coating}));});});});return out;}
function comparisonOptions(keys){var options=allOptions(),seen=Object.create(null);if(!Array.isArray(keys))return options;return keys.map(function(key){return options.find(function(o){return o.id===key;});}).filter(function(o){if(!o||seen[o.id])return false;seen[o.id]=true;return true;});}
return {schemaVersion:1,styleLabel:styleLabel,products:products,coatings:coatings,styles:styles,comparisonRows:comparisonRows,money:money,normalizeState:normalizeState,totals:totals,price:price,prescription:prescription,availableCoatings:availableCoatings,optionForState:optionForState,allOptions:allOptions,comparisonOptions:comparisonOptions};
});
