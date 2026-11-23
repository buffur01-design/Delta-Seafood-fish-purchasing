const pageTranslations = [
  // Translation catalogue (ordered by page):
  // links.html, jobs.html, index.html, markets.html, shared site text,
  // certifications.html, delta-seafood.html, lmt.html, products.html,
  // contact.html, about-our-facilities.html and defa.html.
  // ============================================================
  // LINKS PAGE — links.html
  // ============================================================
  { match: "Links - Delta Seafood", en: "Links - Delta Seafood", fo: "Leinkjur – Delta Seafood" },
  { match: "Resources", en: "Resources", fo: "Tilfar" },
  { match: "Useful links", en: "Useful links", fo: "Gagnligar leinkjur" },
  { match: "A selection of relevant seafood industry, certification and public authority resources.", en: "A selection of relevant seafood industry, certification and public authority resources.", fo: "Eitt úrval av viðkomandi leinkjum til fiskivinnuna, góðkenningar og almennar myndugleikar." },
  { match: "Faroese Food and Veterinary Authority", en: "Faroese Food and Veterinary Authority", fo: "Heilsufrøðiliga starvsstovan" },
  { match: "Official information about food safety, approvals and veterinary matters in the Faroe Islands.", en: "Official information about food safety, approvals and veterinary matters in the Faroe Islands.", fo: "Almennar upplýsingar um matvørutrygd, góðkenningar og djóralæknamál í Føroyum." },
  { match: "Marine Stewardship Council", en: "Marine Stewardship Council", fo: "Marine Stewardship Council" },
  { match: "Information about the MSC standard and certified sustainable fisheries.", en: "Information about the MSC standard and certified sustainable fisheries.", fo: "Upplýsingar um MSC-standardin og góðkendan burðardyggan fiskiskap." },
  { match: "Official information about the Faroe Islands, their people, economy and society.", en: "Official information about the Faroe Islands, their people, economy and society.", fo: "Almennar upplýsingar um Føroyar, fólkið, búskapin og samfelagið." },
  { match: "Visit hfs.fo", en: "Visit hfs.fo", fo: "Vitja hfs.fo" },
  { match: "Visit msc.org", en: "Visit msc.org", fo: "Vitja msc.org" },
  { match: "Visit faroeislands.fo", en: "Visit faroeislands.fo", fo: "Vitja faroeislands.fo" },
  { match: "Faroes fisheries ministery data base", en: "Faroes fisheries ministery data base", fo: "Dátugrunnur hjá Fiskimálaráðnum" },
  { match: "Official information about boat registration and fisheries..", en: "Official information about boat registration and fisheries..", fo: "Almennar upplýsingar um skipaskráseting og fiskivinnu." },
  { match: "Visit teyggjan.fo", en: "Visit teyggjan.fo", fo: "Vitja teyggjan.fo" },
  { match: "Fish Market Faroe Islands", en: "Fish Market Faroe Islands", fo: "Fiskamarknaður Føroya" },
  { match: "How fishermen are working on the fish.", en: "How fishermen are working on the fish.", fo: "Hvussu fiskimenn hagreiða fiskin." },
  { match: "Visit fmf.fo", en: "Visit fmf.fo", fo: "Vitja fmf.fo" },
  { match: "A selection of relevant seafood industry, certifications and public authority resources.", en: "A selection of relevant seafood industry, certifications and public authority resources.", fo: "Eitt úrval av viðkomandi leinkjum til fiskivinnuna, góðkenningar og almennar myndugleikar." },
  { match: "Thoroughness on board", en: "Thoroughness on board", fo: "Nærlagni umborð" },
  { match: "Video about the thoroughness assuring quality onboard.", en: "Video about the thoroughness assuring quality onboard.", fo: "Filmur um nærlagni, sum tryggjar góðskuna umborð." },
  { match: "National institute of marine research", en: "National institute of marine research", fo: "Havstovan" },
  { match: "Our national institute for marine research which we collaborate with.", en: "Our national institute for marine research which we collaborate with.", fo: "Okkara tjóðskaparliga havrannsóknarstova, sum vit samstarva við." },
  { match: "Visit havstovan.fo", en: "Visit havstovan.fo", fo: "Vitja havstovan.fo" },
  { match: "Visit certifications", en: "Visit certifications", fo: "Vitja Góðkenningar" },
  { match: "Visit Teyggjan", en: "Visit Teyggjan", fo: "Vitja Teyggjan" },
  { match: "Visit Fiskamarknaður Føroya", en: "Visit Fiskamarknaður Føroya", fo: "Vitja Fiskamarknaður Føroya" },
  { match: "Visit Havstovan", en: "Visit Havstovan", fo: "Vitja Havstovan" },
  { match: "Visit Heilsufrøðiligastarvstovan", en: "Visit Heilsufrøðiligastarvstovan", fo: "Vitja Heilsufrøðiligastarvstovan" },

  // ============================================================
  // JOBS PAGE — jobs.html
  // ============================================================
  { match: "Jobs - Delta Seafood", en: "Jobs - Delta Seafood", fo: "Størv – Delta Seafood" },
  { match: "Jobs", en: "Jobs", fo: "Størv" },
  { match: "Careers", en: "Careers", fo: "Starvsmøguleikar" },
  { match: "Join a Faroese seafood company working across landing, processing, cold storage and international markets.", en: "Join a Faroese seafood company working across landing, processing, cold storage and international markets.", fo: "Gerst partur av einari føroyskari fiskivinnufyritøku, sum arbeiðir við landing, framleiðslu, frystigoymslu og á altjóða marknaðum." },
  { match: "Open applications", en: "Open applications", fo: "Óumbidnar umsóknir" },
  { match: "We are always interested in hearing from dependable people who want to become part of our team.", en: "We are always interested in hearing from dependable people who want to become part of our team.", fo: "Vit vilja altíð frætta frá álítandi fólki, sum hava hug at gerast partur av okkara toymi." },
  { match: "Production", en: "Production", fo: "Framleiðsla" },
  { match: "Frozen Storage", en: "Frozen Storage", fo: "Frystigoymsla" },
  { match: "Landing", en: "Landing", fo: "Landing" },
  { match: "Send your application", en: "Send your application", fo: "Send tína umsókn" },
  { match: "Tell us about your experience and the type of work you are interested in. Please include your CV and contact details.", en: "Tell us about your experience and the type of work you are interested in. Please include your CV and contact details.", fo: "Sig okkum frá tínum royndum og hvørjum arbeiði tú hevur áhuga í. Legg lívsrensl og sambandsupplýsingar við." },
  { match: "Apply by email", en: "Apply by email", fo: "Søk við telduposti" },
  { match: "Complete the form below and attach your CV. Required fields are marked with an asterisk.", en: "Complete the form below and attach your CV. Required fields are marked with an asterisk.", fo: "Fyll út oyðublaðið niðanfyri og legg lívsrenslið við. Kravdir teigar eru merktir við stjørnu." },
  { match: "Full name", en: "Full name", fo: "Fulla navn" },
  { match: "Address", en: "Address", fo: "Bústaður" },
  { match: "Postcode", en: "Postcode", fo: "Postnummar" },
  { match: "Town or village", en: "Town or village", fo: "Bygd ella býur" },
  { match: "Mobile phone", en: "Mobile phone", fo: "Fartelefon" },
  { match: "Other phone", en: "Other phone", fo: "Onnur telefon" },
  { match: "Email", en: "Email", fo: "Teldupostur" },
  { match: "Date of birth", en: "Date of birth", fo: "Føðingardagur" },
  { match: "Position applied for", en: "Position applied for", fo: "Starv, sum søkt verður um" },
  { match: "Choose a position", en: "Choose a position", fo: "Vel eitt starv" },
  { match: "Production – TG Seafood", en: "Production – TG Seafood", fo: "Framleiðsla – TG Seafood" },
  { match: "Production – Delta Seafood", en: "Production – Delta Seafood", fo: "Framleiðsla – Delta Seafood" },
  { match: "Frozen Storage Warehouse", en: "Frozen Storage Warehouse", fo: "Frystigoymsla" },
  { match: "Are you authorised to work in the Faroe Islands?", en: "Are you authorised to work in the Faroe Islands?", fo: "Hevur tú loyvi at arbeiða í Føroyum?" },
  { match: "Can you communicate in English?", en: "Can you communicate in English?", fo: "Dugir tú at samskifta á enskum?" },
  { match: "Choose an answer", en: "Choose an answer", fo: "Vel eitt svar" },
  { match: "Yes", en: "Yes", fo: "Ja" },
  { match: "No", en: "No", fo: "Nei" },
  { match: "Beginner", en: "Beginner", fo: "Byrjari" },
  { match: "A bit", en: "A bit", fo: "Eitt sindur" },
  { match: "Advanced", en: "Advanced", fo: "Framkomi" },
  { match: "Fluent", en: "Fluent", fo: "Flótandi" },
  { match: "Preferred area of work", en: "Preferred area of work", fo: "Vel arbeiðsøki" },
  { match: "Choose an area", en: "Choose an area", fo: "Vel arbeiðsøki" },
  { match: "Quality control", en: "Quality control", fo: "Góðskueftirlit" },
  { match: "Other", en: "Other", fo: "Annað" },
  { match: "Employment type", en: "Employment type", fo: "Starvsslag" },
  { match: "Permanent position", en: "Permanent position", fo: "Fast starv" },
  { match: "Temporary position", en: "Temporary position", fo: "Tíðaravmarkað starv" },
  { match: "Available from", en: "Available from", fo: "Tøk ella tøkur frá" },
  { match: "Available until", en: "Available until", fo: "Tøk ella tøkur til" },
  { match: "Only needed when applying for temporary work.", en: "Only needed when applying for temporary work.", fo: "Skal bert fyllast út, um søkt verður um tíðaravmarkað starv." },
  { match: "Education and qualifications", en: "Education and qualifications", fo: "Útbúgvingar og førleikar" },
  { match: "Work experience", en: "Work experience", fo: "Starvsroyndir" },
  { match: "Additional comments", en: "Additional comments", fo: "Viðmerkingar" },
  { match: "Attach CV", en: "Attach CV", fo: "Viðheft CV" },
  { match: "Accepted files: PDF, DOC, DOCX, RTF, PNG and JPG. Maximum total upload: 10 MB.", en: "Accepted files: PDF, DOC, DOCX, RTF, PNG and JPG. Maximum total upload: 10 MB.", fo: "Loyvd fílsløg: PDF, DOC, DOCX, RTF, PNG og JPG. Í mesta lagi 10 MB tilsamans." },
  { match: "I consent to Delta Seafood using the information in this application for recruitment purposes.", en: "I consent to Delta Seafood using the information in this application for recruitment purposes.", fo: "Eg gevi Delta Seafood loyvi at nýta upplýsingarnar í umsóknini í sambandi við starvssetan." },
  { match: "Your application is sent securely to Delta Seafood through an external form-delivery provider.", en: "Your application is sent securely to Delta Seafood through an external form-delivery provider.", fo: "Umsóknin verður send trygt til Delta Seafood umvegis ein uttanhýsis oyðublaðstænastuveitara." },
  { match: "Send application", en: "Send application", fo: "Send umsókn" },
  // ============================================================
  // HOME PAGE — index.html
  // ============================================================
  { match: "Home - Delta Seafood", en: "Home - Delta Seafood", fo: "Heim – Delta Seafood" },
  { match: "Product catalogue", en: "Product catalogue", fo: "Vøruskrá" },
  { match: "Explore our selection of fresh, frozen and salted seafood products.", en: "Explore our selection of fresh, frozen and salted seafood products.", fo: "Kanna úrval okkara av feskum, frystum og saltaðum fiskavørum." },
  { match: "View catalogue", en: "View catalogue", fo: "Sí vøruskránna" },
  { match: "Latest updates", en: "Latest updates", fo: "Nýggjastu tíðindi" },
  { match: "More news", en: "More news", fo: "Fleiri tíðindi" },

  // ============================================================
  // MARKETS PAGE — markets.html
  // Dashboard-generated labels are maintained in fisheries-dashboard.js.
  // ============================================================
  { match: "Markets - Delta Seafood", en: "Markets - Delta Seafood", fo: "Marknaðir – Delta Seafood" },
  { match: "These are the countries which we have exported fish to", en: "These are the countries which we have exported fish to", fo: "Hesi eru londini, sum vit hava útflutt fisk til" },
  { match: "Skip to markets", en: "Skip to markets", fo: "Far til marknaðir" },
  { match: "From the Faroe Islands", en: "From the Faroe Islands", fo: "Úr Føroyum" },
  { match: "Markets", en: "Markets", fo: "Marknaðir" },
  { match: "Purchasing", en: "Purchasing", fo: "Keyp" },
  { match: "Sales", en: "Sales", fo: "Søla" },
  { match: "Where we buy fish", en: "Where we buy fish", fo: "Her keypa vit fisk" },
  { match: "Fisheries landings dashboard in the Faroe Islands", en: "Fisheries landings dashboard in the Faroe Islands", fo: "Yvirlit yvir fiskalandingar í Føroyum" },
  { match: "We are interested in buying both fresh and frozen fish. We produce high-quality seafood products from trawl, long liners, and gillnets. For more information, contact", en: "We are interested in buying both fresh and frozen fish. We produce high-quality seafood products from trawl, long liners, and gillnets. For more information, contact", fo: "Vit hava áhuga í at keypa bæði feskan og frystan fisk. Vit framleiða hágóðsku fiskavørur úr rávøru frá troli, línu og gørnum. Fyri fleiri upplýsingar, set teg í samband við" },
  { match: "Reliable seafood, prepared for customers across international markets.", en: "Reliable seafood, prepared for customers across international markets.", fo: "Álítandi fiskavørur, framleiddar til kundar á altjóða marknaðum." },
  { match: "Seafood supply shaped around your market", en: "Seafood supply shaped around your market", fo: "Fiskaveiting lagað til tín marknað" },
  { match: "We combine experienced people, modern processing and flexible product specifications to serve seafood customers around the world.", en: "We combine experienced people, modern processing and flexible product specifications to serve seafood customers around the world.", fo: "Vit sameina roynd starvsfólk, nútímans framleiðslu og smidligar vørulýsingar fyri at veita fiskavørukundum kring heimin." },
  { match: "Salted seafood", en: "Salted seafood", fo: "Saltaðar fiskavørur" },
  { match: "Traditional know-how and consistent processing for salted and light-salted products.", en: "Traditional know-how and consistent processing for salted and light-salted products.", fo: "Siðbundin vitan og støðug framleiðsla av saltaðum og lættsaltaðum vørum." },
  { match: "Frozen & IQF", en: "Frozen & IQF", fo: "Fryst & IQF" },
  { match: "Flexible frozen formats, portioning and packaging for different customer needs.", en: "Flexible frozen formats, portioning and packaging for different customer needs.", fo: "Smidligar frystar vørur, portiónir og pakkiloysnir til ymisk kundakrøv." },
  { match: "Quality & traceability", en: "Quality & traceability", fo: "Góðska & sporbarleiki" },
  { match: "Responsible sourcing, certified operations and close attention to quality throughout the value chain.", en: "Responsible sourcing, certified operations and close attention to quality throughout the value chain.", fo: "Ábyrgdarfull útvegan, góðkent virksemi og stórur dentur á góðsku í allari virðisketuni." },
  { match: "From our facilities to your market", en: "From our facilities to your market", fo: "Frá virkjum okkara til tín marknað" },
  { match: "A clear supply path built around quality, specification and dependable service.", en: "A clear supply path built around quality, specification and dependable service.", fo: "Ein greið veitingarleið bygd á góðsku, vørulýsing og álítandi tænastu." },
  { match: "Faroe Islands", en: "Faroe Islands", fo: "Føroyar" },
  { match: "Wild-caught seafood from Faroese and international waters.", en: "Wild-caught seafood from Faroese and international waters.", fo: "Villur fiskur úr føroyskum og altjóða sjógvi." },
  { match: "Salted, light-salted, frozen and IQF product formats.", en: "Salted, light-salted, frozen and IQF product formats.", fo: "Saltað, lættsaltað, fryst og IQF-vøruúrval." },
  { match: "Specification", en: "Specification", fo: "Vørulýsing" },
  { match: "Product sizes and packaging selected around customer requirements.", en: "Product sizes and packaging selected around customer requirements.", fo: "Vørustøddir og pakking vald eftir kundakrøvum." },
  { match: "Delivery", en: "Delivery", fo: "Veiting" },
  { match: "Export-ready seafood for customers in international markets.", en: "Export-ready seafood for customers in international markets.", fo: "Útflutningsklárar fiskavørur til kundar á altjóða marknaðum." },
  { match: "Talk to our sales team", en: "Talk to our sales team", fo: "Tosa við sølutoymið" },
  { match: "Tell us which products, sizes and formats you need. Our team will help you find the right fit for your market.", en: "Tell us which products, sizes and formats you need. Our team will help you find the right fit for your market.", fo: "Sig okkum, hvørjar vørur, støddir og sløg tú hevur tørv á. Toymið hjálpir tær at finna røttu loysnina til tín marknað." },
  { match: "Contact sales", en: "Contact sales", fo: "Set teg í samband við søluna" },
  { match: "Explore products", en: "Explore products", fo: "Sí vørur" },
  // ============================================================
  // SHARED PAGE TITLES, CONTACT DETAILS AND FOOTER TEXT
  // ============================================================
  { match: "About us - Delta Seafood", en: "About us - Delta Seafood", fo: "Um okkum – Delta Seafood" },
  { match: "About Us", en: "About Us", fo: "Um okkum" },
  { match: "ABOUT US", en: "ABOUT US", fo: "UM OKKUM" },
  { match: "Contact - Delta Seafood", en: "Contact - Delta Seafood", fo: "Samband – Delta Seafood" },
  { match: "Facilities - Delta Seafood", en: "Facilities - Delta Seafood", fo: "Virkir – Delta Seafood" },
  { match: "Contact", en: "Contact", fo: "Samband" },
  { match: "CONTACT", en: "CONTACT", fo: "SAMBAND" },
  { match: "Telephone +298 208800", en: "Telephone +298 208800", fo: "Telefon +298 208800" },
  { match: "Address", en: "Address", fo: "Bústaður" },
  { match: "Registration Delta Seafood", en: "Registration Delta Seafood", fo: "Skráseting Delta Seafood" },
  { match: "Registration TG Seafood", en: "Registration TG Seafood", fo: "Skráseting TG Seafood" },
  { match: "Registration no: 2468", en: "Registration no: 2468", fo: "Skrásetingarnr.: 2468" },
  { match: "VAT no.: 448486", en: "VAT no.: 448486", fo: "VAT no.: 448486" },
  { match: "Registration no: 3670", en: "Registration no: 3670", fo: "Skrásetingarnr.: 3670" },
  { match: "VAT no.: 532908", en: "VAT no.: 532908", fo: "VAT no.: 532908" },
  // ============================================================
  // CERTIFICATIONS PAGE — certifications.html
  // ============================================================
  { match: "Certified sustainable by MSC for responsible seafood sourcing.", en: "Certified sustainable by MSC for responsible seafood sourcing.", fo: "MSC-góðkening fyri burðardyga fiskaframleiðsu." },
  { match: "Certifications", en: "Certifications", fo: "Góðkenningar" },
  { match: "Certifications - Delta Seafood", en: "Certifications - Delta Seafood", fo: "Góðkenningar – Delta Seafood" },
  { match: "Our certifications reflect our commitment to responsible seafood sourcing, quality and sustainable operations.", en: "Our certifications reflect our commitment to responsible seafood sourcing, quality and sustainable operations.", fo: "Okkara góðkenningar vísa okkara ágrýtni fyri ábyrgdarfullari útvegan av fiski, góðsku og burðardyggum rakstri." },
  { match: "MSC Certification", en: "MSC Certification", fo: "MSC-góðkenning" },
  { match: "Production equipment", en: "Production equipment", fo: "Framleiðsluútgerð" },
  { match: "Fish sorting machine – east", en: "Fish sorting machine – east", fo: "Flokkari – eystur" },
  { match: "Fish sorting machine – west", en: "Fish sorting machine – west", fo: "Flokkari – vestur" },
  { match: "Fish sorting machine – door", en: "Fish sorting machine – door", fo: "Flokkari – hurð" },
  { match: "Thawing tank", en: "Thawing tank", fo: "Upptiðningarkar" },
  { match: "HFS Certification", en: "HFS Certification", fo: "HFS-góðkenning" },
  { match: "HFS Certification for Delta Seafood", en: "HFS Certification for Delta Seafood", fo: "HFS-góðkenning hjá Delta Seafood" },
  { match: "HFS Certification for TG Seafood", en: "HFS Certification for TG Seafood", fo: "HFS-góðkenning hjá TG Seafood" },
  { match: "Certified by Heilsufrodiliga Starvstovan for production of fish.", en: "Certified by Heilsufrodiliga Starvstovan for production of fish.", fo: "Góðkent av Heilsufrøðiligu starvsstovuni til fiskaframleiðslu." },
  { match: "Certified by Heilsufrodiliga Starvstovan for production of fish", en: "Certified by Heilsufrodiliga Starvstovan for production of fish", fo: "Góðkent av Heilsufrøðiligu starvsstovuni til fiskaframleiðslu" },
  { match: "Certified by Heilsufrodiliga Starvstovan for own check program", en: "Certified by Heilsufrodiliga Starvstovan for own check program", fo: "Eftirlitsskipanin er góðkend av Heilsufrøðiligu starvsstovuni" },
  { match: "Certified by Heilsufrodiliga Starvstovan for production of demershal/pelagic fish.", en: "Certified by Heilsufrodiliga Starvstovan for production of demershal/pelagic fish.", fo: "Góðkent av Heilsufrøðiligu starvsstovuni til framleiðslu av botnfiski og uppsjóvarfiski." },
  { match: "Approved for export to these countries by Heilsufrodiliga Starvstovan", en: "Approved for export to these countries by Heilsufrodiliga Starvstovan", fo: "Góðkent av Heilsufrøðiligu starvsstovuni til útflutnings til hesi lond." },
  { match: "View certification", en: "View certification", fo: "Sí góðkenning" },
  { match: "Reg no: 2468", en: "Reg no: 2468", fo: "Skrásetingarnr.: 2468" },
  { match: "Reg no: 3670", en: "Reg no: 3670", fo: "Skrásetingarnr.: 3670" },
  { match: "VAT no.: 448486", en: "VAT no.: 448486", fo: "VAT no.: 448486" },
  { match: "VAT no.: 532908", en: "VAT no.: 532908", fo: "VAT no.: 532908" },
  // ============================================================
  // LMT PAGE — lmt.html
  // ============================================================
  { match: "Landingarmiðstøðin", en: "Landingarmiðstøðin", fo: "Landingarmiðstøðin" },
  { match: "Equipment", en: "Equipment", fo: "Útgerð" },
  { match: "Grader", en: "Grader", fo: "Flokkari" },
  { match: "Delta Seafood © 2026. All rights reserved.", en: "Delta Seafood © 2026. All rights reserved.", fo: "Delta Seafood © 2026. Øll rættindi vard." },
  // ============================================================
  // PRODUCTS PAGE — products.html
  // ============================================================
  { match: "Products - Delta Seafood", en: "Products - Delta Seafood", fo: "Vørur – Delta Seafood" },
  { match: "Back bone in", en: "Back bone in", fo: "Við ryggbeini" },
  { match: "All interleaved frozen products are packaged in 6,81 kilo blocks and packaged in 20,43 kilo boxes", en: "All interleaved frozen products are packaged in 6,81 kilo blocks and packaged in 20,43 kilo boxes", fo: "Allar frystar interleave-vørur verða pakkaðar í 6,81 kg blokkir og 20,43 kg kassar." },
  { match: "All frozen interleaved products are packaged in 6,81 kilo boxes", en: "All frozen interleaved products are packaged in 6,81 kilo boxes", fo: "Allar frystar interleave-vørur verða pakkaðar í 6,81 kg kassar." },
  { match: "All wet salted products are packaged in 20 kilo and 500 kilo boxes", en: "All wet salted products are packaged in 20 kilo and 500 kilo boxes", fo: "Allar saltaðar vørur verða pakkaðar í 20 kg og 500 kg kassar." },
  { match: "All wetsalted products are packaged in 20 kilo boxes", en: "All wetsalted products are packaged in 20 kilo boxes", fo: "Allar saltaðar vørur verða pakkaðar í 20 kg kassar." },
  { match: "All light salted products are packaged in 11 kilo boxes", en: "All light salted products are packaged in 11 kilo boxes", fo: "Allar lættsaltaðar vørur verða pakkaðar í 11 kg kassar." },
  { match: "PRODUCTS", en: "PRODUCTS", fo: "VØRUR" },
  { match: "Skip to products", en: "Skip to products", fo: "Far til vørur" },
  { match: "From the Faroe Islands", en: "From the Faroe Islands", fo: "Úr Føroyum" },
  { match: "Explore our seafood range", en: "Explore our seafood range", fo: "Kanna vøruúrval okkara" },
  { match: "Explore our range of wild-caught seafood, available in salted, light-salted, frozen and IQF formats. Select a species to view cuts, sizes, grades and packaging.", en: "Explore our range of wild-caught seafood, available in salted, light-salted, frozen and IQF formats. Select a species to view cuts, sizes, grades and packaging.", fo: "Kanna úrval okkara av villum fiski, sum fæst saltaður, lættsaltaður, frystur og sum IQF-vørur. Vel eitt fiskaslag fyri at síggja skurðir, støddir, góðskuflokkar og pakking." },
  { match: "Send an inquiry", en: "Send an inquiry", fo: "Send fyrispurning" },
  { match: "View certifications", en: "View certifications", fo: "Sí góðkenningar" },
  { match: "Browse by species", en: "Browse by species", fo: "Kanna eftir fiskaslagi" },
  { match: "Browse products", en: "Browse products", fo: "Okkara vørur" },
  { match: "Filter the catalogue by processing format.", en: "Filter the catalogue by processing format.", fo: "Vøruskrá eftir framleiðsluhátti." },
  { match: "All products", en: "All products", fo: "Allar vørur" },
  { match: "Salted", en: "Salted", fo: "Saltað" },
  { match: "Frozen", en: "Frozen", fo: "Fryst" },
  { match: "IQF", en: "IQF", fo: "IQF" },
  { match: "Wet salted", en: "Wet salted", fo: "Saltaðar vørur" },
  { match: "Light salted", en: "Light salted", fo: "Lættsaltaðar vørur" },
  { match: "Interleaved frozen", en: "Interleaved frozen", fo: "Frystar interleave-vørur" },
  { match: "J-cut", en: "J-cut", fo: "J-cut" },
  { match: "View specifications", en: "View specifications", fo: "Sí vørulýsing" },
  { match: "Certifications and approvals", en: "Certifications and approvals", fo: "Góðkenningar og loyvi" },
  { match: "Learn about our certifications", en: "Learn about our certifications", fo: "Les um góðkenningar okkara" },
  { match: "Details about availability", en: "Details about availability", fo: "Nágreiniligar upplýsingar um atkomuligleika" },
  { match: "Contact the sales team", en: "Contact the sales team", fo: "Set teg í samband við sølutoymið" },
  { match: "Interested in this product?", en: "Interested in this product?", fo: "Hevur henda vøran tín áhuga?" },
  { match: "Contact our sales team for availability and specifications.", en: "Contact our sales team for availability and specifications.", fo: "Set teg í samband við sølutoymið fyri upplýsingar um tøki og vørulýsingar." },
  { match: "Send product inquiry", en: "Send product inquiry", fo: "Send vørufyrispurning" },
  { match: "See products", en: "See products", fo: "Sí vørur" },
  { match: "Products:", en: "Products:", fo: "Vørur:" },
  { match: "1. Wet salted", en: "1. Wet salted", fo: "1. Saltaðar vørur" },
  { match: "2. Light salted", en: "2. Light salted", fo: "2. Lættsaltaðar vørur" },
  { match: "3. Frozen interleaved", en: "3. Frozen interleaved", fo: "3. Frystar interleave-vørur" },
  { match: "4. Other products", en: "4. Other products", fo: "4. Aðrar vørur" },
  { match: "Wet salted:", en: "Wet salted:", fo: "Saltaðar vørur:" },
  { match: "Wetsalted products:", en: "Wetsalted products:", fo: "Saltaðar vørur:" },
  { match: "Light salted:", en: "Light salted:", fo: "Lættsaltaðar vørur:" },
  { match: "Light salted products:", en: "Light salted products:", fo: "Lættsaltaðar vørur:" },
  { match: "IQF products:", en: "IQF products:", fo: "IQF-vørur:" },
  { match: "IQF Products:", en: "IQF Products:", fo: "IQF-vørur:" },
  { match: "Interleaved frozen products:", en: "Interleaved frozen products:", fo: "Frystar interleave-vørur:" },
  { match: "Other products:", en: "Other products:", fo: "Aðrar vørur:" },
  { match: "Other products", en: "Other products", fo: "Aðrar vørur" },
  { match: "Packaging:", en: "Packaging:", fo: "Pakking:" },
  { match: "Cod", en: "Cod", fo: "Toskur" },
  { match: "Ling", en: "Ling", fo: "Longa" },
  { match: "Tusk", en: "Tusk", fo: "Brosma" },
  { match: "Greenland Halibut", en: "Greenland Halibut", fo: "Svartkalvi" },
  { match: "Saithe", en: "Saithe", fo: "Upsi" },
  { match: "Haddock", en: "Haddock", fo: "Hýsa" },
  { match: "Blue Ling", en: "Blue Ling", fo: "Blálonga" },
  { match: "Whiting", en: "Whiting", fo: "Hvítingur" },
  { match: "Fillets", en: "Fillets", fo: "Fløk" },
  { match: "Splitted", en: "Splitted", fo: "Flaktur fiskur" },
  { match: "Splited", en: "Splited", fo: "Flaktur fiskur" },
  { match: "Loins", en: "Loins", fo: "Ryggstykki" },
  { match: "Tail", en: "Tail", fo: "Hali" },
  { match: "Tails ungraded", en: "Tails ungraded", fo: "Óflokkaðir halar" },
  { match: "Wings", en: "Wings", fo: "Uggar" },
  { match: "Fillet", en: "Fillet", fo: "Flak" },
  { match: "Bits and pieces", en: "Bits and pieces", fo: "Smálutir" },
  { match: "Mince", en: "Mince", fo: "Fiskafars" },
  { match: "Skin", en: "Skin", fo: "Skræða" },
  { match: "Heads", en: "Heads", fo: "Høvd" },
  { match: "Roe", en: "Roe", fo: "Rogn" },
  { match: "Tongue", en: "Tongue", fo: "Lippur" },
  { match: "Size ungraded", en: "Size ungraded", fo: "Óflokkað eftir stødd" },
  { match: "200-500 gr, 500-1000 gr and 1000-1500 gr light salted products are packaged in 10 kilo boxes", en: "200-500 gr, 500-1000 gr and 1000-1500 gr light salted products are packaged in 10 kilo boxes", fo: "Lættsaltaðar vørur í støddunum 200–500 g, 500–1.000 g og 1.000–1.500 g verða pakkaðar í 10 kg kassar." },
  { match: "1500-2000 gr, 2000-2500 gr and 2500 gr+ light salted products are packaged in 500 kilo boxes", en: "1500-2000 gr, 2000-2500 gr and 2500 gr+ light salted products are packaged in 500 kilo boxes", fo: "Lættsaltaðar vørur í støddunum 1.500–2.000 g, 2.000–2.500 g og 2.500 g+ verða pakkaðar í 500 kg kassar." },
  { match: "All light salted products are packaged in 10 kilo boxes", en: "All light salted products are packaged in 10 kilo boxes", fo: "Allar lættsaltaðar vørur verða pakkaðar í 10 kg kassar" },
  { match: "All light salted products are packaged in 500 kilo boxes", en: "All light salted products are packaged in 500 kilo boxes", fo: "Allar lættsaltaðar vørur verða pakkaðar í 500 kg kassar" },
  { match: "IQF greenland halibut is packaged in 20 kilo boxes", en: "IQF greenland halibut is packaged in 20 kilo boxes", fo: "IQF-svartkalvi verður pakkaður í 20 kg kassar" },
  { match: "IQF greenland halibut are packaged in 20 kilo boxes", en: "IQF greenland halibut are packaged in 20 kilo boxes", fo: "IQF-svartkalvi verður pakkaður í 20 kg kassar" },
  { match: "J-cut products are frozen in 20 kilo boxes", en: "J-cut products are frozen in 20 kilo boxes", fo: "J-cut-vørur verða frystar í 20 kg kassum" },
  { match: "J-cut products are frozen and packaged in 20 kilo boxes", en: "J-cut products are frozen and packaged in 20 kilo boxes", fo: "J-cut-vørur verða frystar og pakkaðar í 20 kg kassar" },
  { match: "All other products are frozen in 12 kilo blocks and packaged in 24 kilo boxes", en: "All other products are frozen in 12 kilo blocks and packaged in 24 kilo boxes", fo: "Allar aðrar vørur verða frystar í 12 kg blokkum og pakkaðar í 24 kg kassar" },
  { match: "All other products are packaged in 20 kilo boxes", en: "All other products are packaged in 20 kilo boxes", fo: "Allar aðrar vørur verða pakkaðar í 20 kg kassar" },
  { match: "All other products are packaged in 7,5 kilo blocks", en: "All other products are packaged in 7,5 kilo blocks", fo: "Allar aðrar vørur verða pakkaðar í 7,5 kg blokkir" },
  { match: "IQF products have a glazing of 5% and are available in comp and non comp", en: "IQF products have a glazing of 5% and are available in comp and non comp", fo: "IQF-vørurnar hava 5% glasering og fáast bæði sum comp og non-comp" },
  { match: "IQF products are packaged in 5 kilo boxes", en: "IQF products are packaged in 5 kilo boxes", fo: "IQF-vørur verða pakkaðar í 5 kg kassar" },
  { match: "Quality grades 1-2 (A), and 3 (B)", en: "Quality grades 1-2 (A), and 3 (B)", fo: "Góðskuflokkar 1–2 (A) og 3 (B)" },
  { match: "Quality grades 1-2 (A), 3 (B)", en: "Quality grades 1-2 (A), 3 (B)", fo: "Góðskuflokkar 1–2 (A) og 3 (B)" },
  { match: "Quality grades 1-2 (A)", en: "Quality grades 1-2 (A)", fo: "Góðskuflokkar 1–2 (A)" },
  { match: "Fillets sizes from 100 gr to 200 gr", en: "Fillets sizes from 100 gr to 200 gr", fo: "Fløk í støddum frá 100 g til 200 g" },
  { match: "Spillted sizes from 200 gr to 400 gr", en: "Spillted sizes from 200 gr to 400 gr", fo: "Kloyvdur fiskur í støddum frá 200 g til 400 g" },
  // ============================================================
  // CONTACT PAGE — contact.html
  // ============================================================
  { match: "Sales Team", en: "Sales Team", fo: "Søludeild" },
  { match: "All", en: "All", fo: "Øll" },
  { match: "Filter our team by department.", en: "Filter our team by department.", fo: "Starvsfólk okkara eftir deild." },
  { match: "Send", en: "Send", fo: "Send" },
  { match: "Inquiry", en: "Inquiry", fo: "fyrispurning" },
  { match: "Our team is here to help with sales, transportation, marketing and customer support.", en: "Our team is here to help with sales, transportation, marketing and customer support.", fo: "Starvsfólk okkara hjálpa við sølu, flutningi, marknaðarføring og kundatænastu." },
  { match: "Head of Sales", en: "Head of Sales", fo: "Søluleiðari" },
  { match: "Agents", en: "Agents", fo: "Umboð" },
  { match: "Sales agents", en: "Sales agents", fo: "Søluumboð" },
  { match: "Sales Agents", en: "Sales Agents", fo: "Søluumboð" },
  { match: "Our agents handle salted fish sales coordination.", en: "Our agents handle salted fish sales coordination.", fo: "Umboð, sum samskipa søluna av saltfiski." },
  { match: "Our sales agents handle salted fish sales coordination.", en: "Our sales agents handle salted fish sales coordination.", fo: "Søluumboð, sum samskipa søluna av saltfiski." },
  { match: "Salted fish", en: "Salted fish", fo: "Saltfiskur" },
  { match: "Administration", en: "Administration", fo: "Fyrisiting" },
  { match: "Board", en: "Board", fo: "Nevnd" },
  { match: "Leadership and production management across Delta Seafood and TG Seafood.", en: "Leadership and production management across Delta Seafood and TG Seafood.", fo: "Leiðsla og framleiðslustýring hjá Delta Seafood og TG Seafood." },
  { match: "Managing and purchasing director", en: "Managing and purchasing director", fo: "Dagligur leiðari og innkeypsstjóri" },
  { match: "CFO", en: "CFO", fo: "Fíggjarleiðari" },
  { match: "Production Manager Delta Seafood and frozen storage warehouse", en: "Production Manager Delta Seafood and frozen storage warehouse", fo: "Framleiðsluleiðari Delta Seafood og frystigoymlsuni" },
  { match: "Foreman Delta Seafood", en: "Foreman Delta Seafood", fo: "Formaður Delta Seafood" },
  { match: "Production Manager TG Seafood", en: "Production Manager TG Seafood", fo: "Framleiðsluleiðari TG Seafood" },
  { match: "Foreman TG Seafood", en: "Foreman TG Seafood", fo: "Formaður TG Seafood" },
  { match: "Chief Engineer Delta Seafood", en: "Chief Engineer Delta Seafood", fo: "Tekniskur leiðari Delta Seafood" },
  { match: "Mechanic TG Seafood", en: "Mechanic TG Seafood", fo: "Maskinsmiður TG Seafood" },
  { match: "GHTU Manager", en: "GHTU Manager", fo: "GHTU leiðari" },
  { match: "IT Director", en: "IT Director", fo: "KT-leiðari" },
  { match: "Board of Delta Seafood", en: "Board of Delta Seafood", fo: "Nevnd Delta Seafood" },
  { match: "Board of TG Seafood", en: "Board of TG Seafood", fo: "Nevnd TG Seafood" },
  { match: "Information about the board of TG Seafood.", en: "Information about the board of TG Seafood.", fo: "Upplýsingar um nevndina í TG Seafood." },
  { match: "From the left: Egil Olsen, Gudmund Mortensen, Ólavur Bjarkhamar (Director), Marner Lisberg, Magnus Jespersen (CEO)", en: "From the left: Egil Olsen, Gudmund Mortensen, Ólavur Bjarkhamar (Director), Marner Lisberg, Magnus Jespersen (CEO)", fo: "Frá vinstru: Egil Olsen, Gudmund Mortensen, Ólavur Bjarkhamar (nevndarformaður), Marner Lisberg og Magnus Jespersen (stjóri)" },
  { match: "Magnus Jespersen (CEO),Ólavur Bjarkhamar (Director), Jacob Pauli Djurhuus Hammer, Niels Olaf Eyvindsson, Paula Marianna Poulsen and Øssur Thomsen", en: "Magnus Jespersen (CEO),Ólavur Bjarkhamar (Director), Jacob Pauli Djurhuus Hammer, Niels Olaf Eyvindsson, Paula Marianna Poulsen and Øssur Thomsen", fo: "Magnus Jespersen (stjóri), Ólavur Bjarkhamar (nevndarformaður), Jacob Pauli Djurhuus Hammer, Niels Olaf Eyvindsson, Paula Marianna Poulsen og Øssur Thomsen" },
  // ============================================================
  // FACILITY DETAIL PAGES — delta / tg / lmt
  // ============================================================
  { match: "Our Locations", en: "Our Locations", fo: "Okkara bústaðir" },
  { match: "Delta Seafood Facility", en: "Delta Seafood Facility", fo: "Virkið hjá Delta Seafood" },
  { match: "Key points", en: "Key points", fo: "Høvuðspunkt" },
  { match: "Delta Seafood produces high quality salted products. The prodcution started in 1995. Today the production capasity has reach 100 tons a week", en: "Delta Seafood produces high quality salted products. The prodcution started in 1995. Today the production capasity has reach 100 tons a week", fo: "Delta Seafood framleiðir saltaðar vørur í høgari góðsku. Framleiðslan byrjaði í 1995, og í dag er framleiðsluorkan komin upp á 100 tons um vikuna." },
  { match: "Write first key point here", en: "Write first key point here", fo: "Skriva fyrsta høvuðspunktið her" },
  { match: "Write second key point here", en: "Write second key point here", fo: "Skriva annað høvuðspunktið her" },
  { match: "Write third key point here", en: "Write third key point here", fo: "Skriva triðja høvuðspunktið her" },
  { match: "TG Seafood Facility", en: "TG Seafood Facility", fo: "Virkið hjá TG Seafood" },
  { match: "All our firms are part of the same conglomerate.", en: "All our firms are part of the same conglomerate.", fo: "Allar fyritøkur okkara eru partur av sama samtaki." },
  { match: "Vertical integration", en: "Vertical integration", fo: "Lóðrætt samskipað virki" },
  { match: "TG Seafood is a vertically integrated firm. TG Fish owns and operates the trawlers Hamranes and Breiðanes, which are pair trawlers that allow for optimal coordination between catching and processing. Steintór is also part of the supply chain and the stakeholders in TG Seafood, allowing for diversification of catch and further coordination between catch and production.", en: "TG Seafood is a vertically integrated firm. TG Fish owns and operates the trawlers Hamranes and Breiðanes, which are pair trawlers that allow for optimal coordination between catching and processing. Steintór is also part of the supply chain and the stakeholders in TG Seafood, allowing for diversification of catch and further coordination between catch and production.", fo: "TG Seafood er eitt lóðrætt samskipað virki. TG Fish eigur og rekur partrolararnar Hamranes og Breiðanes, sum gera tað møguligt at samskipa veiðu og framleiðslu væl. Steintór er eisini partur av veitingarketuni og eigaraskaranum í TG Seafood, og gevur hetta fjølbroyttari veiðu og betri samskipan millum veiðu og framleiðslu." },
  { match: "About", en: "About", fo: "Um virkið" },
  { match: "TG Seafood produces high-quality frozen products. The facility started producing fish in the 1980s. Due to financial hardship, it went under, but in 2005 it started up again under the management of Delta Seafood.", en: "TG Seafood produces high-quality frozen products. The facility started producing fish in the 1980s. Due to financial hardship, it went under, but in 2005 it started up again under the management of Delta Seafood.", fo: "TG Seafood framleiðir frystar vørur í høgari góðsku. Virkið byrjaði fiskaframleiðslu í 1980-árunum. Eftir fíggjarligar trupulleikar steðgaði virksemið, men í 2005 byrjaði tað aftur undir leiðslu av Delta Seafood." },
  { match: "We have a freezing capacity of over 100 tons a week. This is achieved with modern technology from Baader and employees who have worked in the facility for over 30 years.", en: "We have a freezing capacity of over 100 tons a week. This is achieved with modern technology from Baader and employees who have worked in the facility for over 30 years.", fo: "Vit hava frystiorku á meira enn 100 tons um vikuna. Hetta verður rokkið við nútímans tøkni frá Baader og starvsfólkum, sum hava arbeitt á virkinum í meira enn 30 ár." },
  { match: "LMT Facility", en: "LMT Facility", fo: "LMT-virkið" },
  { match: "Write your text about the LMT facility here. You can describe where the facility is located, what kind of production takes place there, and what makes the facility important for the company.", en: "Write your text about the LMT facility here. You can describe where the facility is located, what kind of production takes place there, and what makes the facility important for the company.", fo: "Skriva tekstin um LMT-virkið her. Tú kanst lýsa, hvar virkið liggur, hvør framleiðsla fer fram har, og hví virkið hevur týdning fyri fyritøkuna." },
  { match: "Production", en: "Production", fo: "Framleiðsla" },
  { match: "Write about the production here. For example, you can describe salted fish production, frozen fish production, capacity, equipment, and quality control.", en: "Write about the production here. For example, you can describe salted fish production, frozen fish production, capacity, equipment, and quality control.", fo: "Skriva um framleiðsluna her. Tú kanst til dømis lýsa saltfiskaframleiðslu, frystiframleiðslu, framleiðsluorku, útgerð og góðskueftirlit." },
  { match: "Facilities", en: "Facilities", fo: "Virkir" },
  { match: "Write about the building, equipment, storage areas, freezing capacity, salting areas, and other important parts of the facility.", en: "Write about the building, equipment, storage areas, freezing capacity, salting areas, and other important parts of the facility.", fo: "Skriva um bygningin, útgerðina, goymslurnar, frystiorkuna, saltiøkini og aðrar týðandi partar av virkinum." },
  // ============================================================
  // FACILITIES OVERVIEW PAGE — about-our-facilities.html
  // ============================================================
  { match: "FACILITIES", en: "FACILITIES", fo: "VIRKIR" },
  { match: "Our Facilities", en: "Our Facilities", fo: "Okkara virkir" },
  { match: "Our four firms", en: "Our four firms", fo: "Okkara fýra virkir" },
  { match: "More about Delta Seafood", en: "More about Delta Seafood", fo: "Les meira um Delta Seafood" },
  { match: "More about TG Seafood", en: "More about TG Seafood", fo: "Les meira um TG Seafood" },
  { match: "More about Landingarmiðstøðin", en: "More about Landingarmiðstøðin", fo: "Les meira um Landingarmiðstøðina" },
  { match: "More about Freezing Hotel", en: "More about Freezing Hotel", fo: "Les meira um Frystihotelið" },
  // ============================================================
  // DEFA PAGE — defa.html
  // ============================================================
  { match: "Freezing Hotel", en: "Freezing Hotel", fo: "Frystihotel" },
  { match: "Defa Facility", en: "Defa Facility", fo: "Virkið hjá Defa" },
  { match: "Defa frozen storage", en: "Defa frozen storage", fo: "Defa frystigoymsla" },
  { match: "Defa frozen storage 1", en: "Defa frozen storage 1", fo: "Defa frystigoymsla 1" },
  { match: "Defa cold storage 1", en: "Defa cold storage 1", fo: "Defa frystigoymsla 1" },
  { match: "Defa cold storage 2", en: "Defa cold storage 2", fo: "Defa frystigoymsla 2" },
  { match: "Defa is our facility located at Bryggjan 13 in Vágur, Faroe Islands. As part of the Delta Seafood group, the facility strengthens our processing and handling capacity on Suðuroy.", en: "Defa is our facility located at Bryggjan 13 in Vágur, Faroe Islands. As part of the Delta Seafood group, the facility strengthens our processing and handling capacity on Suðuroy.", fo: "Defa er virki okkara á Bryggjuni 13 í Vági. Sum partur av samtakinum hjá Delta Seafood styrkir virkið framleiðslu- og handfaringarorkuna í Suðuroy." },
  { match: "Working in close coordination with Delta Seafood, TG Seafood and LMT, Defa supports our vertically integrated value chain from landing to processing and international export.", en: "Working in close coordination with Delta Seafood, TG Seafood and LMT, Defa supports our vertically integrated value chain from landing to processing and international export.", fo: "Í tøttum samstarvi við Delta Seafood, TG Seafood og LMT stuðlar Defa okkara lóðrætt samskipaðu virðisketu frá landing til framleiðslu og altjóða útflutning." },
  // ============================================================
  // SHARED FACILITIES LINKS AND GENERAL FACILITIES TEXT
  // ============================================================
  { match: "Visit Delta Seafood", en: "Visit Delta Seafood", fo: "Vitja Delta Seafood" },
  { match: "Visit TG Seafood", en: "Visit TG Seafood", fo: "Vitja TG Seafood" },
  { match: "Visit Landingarmiðstøðin", en: "Visit Landingarmiðstøðin", fo: "Vitja Landingarmiðstøðina" },
  { match: "Visit Freezing Hotel", en: "Visit Freezing Hotel", fo: "Vitja Frystihotellið" },
  { match: "Delta Seafood operates modern landing, sorting, and packaging facilities in the Faroe Islands. Our sites are designed for efficient operations, high hygiene standards, and full export compliance.", en: "Delta Seafood operates modern landing, sorting, and packaging facilities in the Faroe Islands. Our sites are designed for efficient operations, high hygiene standards, and full export compliance.", fo: "Delta Seafood rekur nútímans móttøku-, skilji- og pakkivirkir í Føroyum. Virkini eru skipað til effektivan rakstur, høg reinføriskrøv og fulla samsvaran við útflutningskrøv." },
  { match: "Whether you need chilled or frozen handling, or quality control for international shipments, our facilities are equipped to support the full seafood supply chain.", en: "Whether you need chilled or frozen handling, or quality control for international shipments, our facilities are equipped to support the full seafood supply chain.", fo: "Hvørt tørvurin er køld ella fryst handfaring ella góðskueftirlit til altjóða flutning, hava virki okkara útgerð til at stuðla allari veitingarketuni fyri sjófeingi." },
  { match: "At Delta Seafood, we provide reliable landing, sorting, and packaging services for a wide range of seafood products. Our facilities are designed to ensure efficient handling from vessel arrival to final shipment, while maintaining high standards of quality, hygiene, and traceability throughout the entire process.", en: "At Delta Seafood, we provide reliable landing, sorting, and packaging services for a wide range of seafood products. Our facilities are designed to ensure efficient handling from vessel arrival to final shipment, while maintaining high standards of quality, hygiene, and traceability throughout the entire process.", fo: "Hjá Delta Seafood veita vit álítandi móttøku-, skilji- og pakkingartænastur fyri eitt breitt úrval av fiskavørum. Virkini tryggja effektiva handfaring frá komu skipsins til endaliga avskiping, við høgum krøvum til góðsku, reinføri og sporbarleika alla tíðina." },
  { match: "Upon landing, all raw materials are carefully inspected and handled by experienced personnel to ensure freshness and product integrity. The seafood is then sorted according to species, size, and quality requirements, allowing us to meet the specific demands of customers and international markets.", en: "Upon landing, all raw materials are carefully inspected and handled by experienced personnel to ensure freshness and product integrity. The seafood is then sorted according to species, size, and quality requirements, allowing us to meet the specific demands of customers and international markets.", fo: "Við landing verður øll rávøra væl kannað og handfarin av royndum starvsfólkum fyri at tryggja feskleika og vørugóðsku. Fiskurin verður síðan skildur eftir slagi, stødd og góðskukrøvum, so vit kunnu lúka serligu krøvini hjá kundum og altjóða marknaðum." },
  { match: "Our packaging services are tailored to customer specifications and export standards. We offer flexible packaging solutions designed to preserve product quality during transportation and storage, ensuring that products arrive in optimal condition. With a strong focus on efficiency, food safety, and sustainable operations, Delta Seafood delivers dependable seafood processing services for partners worldwide.", en: "Our packaging services are tailored to customer specifications and export standards. We offer flexible packaging solutions designed to preserve product quality during transportation and storage, ensuring that products arrive in optimal condition. With a strong focus on efficiency, food safety, and sustainable operations, Delta Seafood delivers dependable seafood processing services for partners worldwide.", fo: "Pakkitænastur okkara verða lagaðar til ynskini hjá kundanum og útflutningskrøv. Vit bjóða smidligar pakkiloysnir, sum varðveita vørugóðskuna undir flutningi og goymslu, so vørurnar koma fram í besta standi. Við stórum denti á virkni, matvørutrygd og burðardyggan rakstur veitir Delta Seafood álítandi fiskaframleiðslutænastur til samstarvsfelagar kring heimin." },
  { match: "For landing services call +298 208800", en: "For landing services call +298 208800", fo: "Ring +298 208800 fyri landingartænastur" },
  { match: "The fleet we typically service", en: "The fleet we typically service", fo: "Skipini, sum vit vanliga veita tænastu" },
  { match: "ABOUT US", en: "ABOUT US", fo: "Um okkum" },
  // Landingarmiðstøðin services
  { match: "Services", en: "Services", fo: "Tænastur" },
  { match: "Landing, sorting and labelling fish so that it can be sold at the Fish Market, if the boat owner wishes.", en: "Landing, sorting and labelling fish so that it can be sold at the Fish Market, if the boat owner wishes.", fo: "Landing, skiljing og merking av fiskinum, soleiðis at hann kann seljast á Fiskamarknaðinum, um bátaeigarin ynskir tað." },
  { match: "Supplying ice to small fishing boats (this is a requirement for landing at Landingarmiðstøðin).", en: "Supplying ice to small fishing boats (this is a requirement for landing at Landingarmiðstøðin).", fo: "Veiting av ísi til útróðrarbátarnar (hetta er ein treyt fyri at avreiða til Landingarmiðstøðina)." },
  { match: "Sorting, packing and labelling whole fish for exporters.", en: "Sorting, packing and labelling whole fish for exporters.", fo: "Skiljing, pakking og merking av heilum fiski fyri útflytarar." },
  { match: "Thawing frozen raw material for production at the processing plants.", en: "Thawing frozen raw material for production at the processing plants.", fo: "Upptíðning av frystari rávøru til framleiðslu á virkjunum." },
];

// Complete page sections live here as single translation blocks. Keeping the
// full section together makes grammar review easier and prevents mixed-language
// paragraphs when the wording on a page is adjusted.
const pageTranslationBlocks = [
  // ============================================================
  // DELTA SEAFOOD PAGE — delta-seafood.html
  // ============================================================
  {
    key: "delta-seafood-overview",
    fo: `
      <p>Delta Seafood varð stovnað í 1995 av fólki, sum høvdu royndir úr fiskivinnuni. Virksemið byrjaði í einum kjallara sum bleiv leigaður frá NJM á Tvøroyri og var 200 fermetrar til støddar.</p>
      <p>Í 2000 flutti Delta Seafood í egnan bygning, sum var 800 fermetrar til støddar. Bygningurin er útbygdur nakrar ferðir gjøgnum árini, í dag er bygningurin 4200 fermetrar til støddar.</p>
      <div class="facility-comparison" aria-label="Menningin av virkinum hjá Delta Seafood">
        <figure><img src="Delta Seafood reist.png" alt="Virkið hjá Delta Seafood undir bygging" loading="lazy"></figure>
        <figure><img src="Delta Seafood ferdigt.png" alt="Liðugt virki hjá Delta Seafood" loading="lazy"></figure>
      </div>
      <p>Delta Seafood er eitt saltfiskavirkið, sum framleiður saltfisk úr feskum og frystum fiski. Feski fiskurin verður veiddur í føroyskum sjógvi meðan frystifiskurin verður veiddur føroyskum sjógvi og aðrastaðni. Delta Seafood keypir frysta rávøru frá føroysum skipum sum frysta umborð, eisini innflytur Delta Seafood frysta rávøru úr grannalondunum, talan er bæði um línufisk og trolfisk.</p>
      <p>Delta Seafood hevur útgerð til at upptiðna frysta rávøru til virkingar við.</p>
      <p>Síðan Delta Seafood byrjaði at virkað burturúr frystari rávøru er tað munandi lættari at tilrættaleggja framleiðsluna og ger at tað støðugt arbeiði á virkinum.</p>
      <p>Delta Seafood framleiður saltfløk, flaktan saltfisk og fryst lættsaltaði fløk.</p>
      <p>Fiskasløgini sum Delta Seafood virkar eru:</p>
      <ul class="species-list">
        <li><img src="delta-bumerki%20%20uttan%20tekst.png" alt="" aria-hidden="true"><span>Toskur</span></li>
        <li><img src="delta-bumerki%20%20uttan%20tekst.png" alt="" aria-hidden="true"><span>Longa</span></li>
        <li><img src="delta-bumerki%20%20uttan%20tekst.png" alt="" aria-hidden="true"><span>Brosma</span></li>
        <li><img src="delta-bumerki%20%20uttan%20tekst.png" alt="" aria-hidden="true"><span>Upsi</span></li>
        <li><img src="delta-bumerki%20%20uttan%20tekst.png" alt="" aria-hidden="true"><span>Blálonga</span></li>
      </ul>
      <p>Vit sameina siðbundið handverk og nútímans framleiðslutøkni fyri at veita kundum kring heimin dygdargóðar saltfiskavørur.</p>
      <p>Framleiðslan av teimum ymisku vørunum er í tøttum samstarvið við søluliði, sum til dagligt er hjá kundunum í Suðureuropa.</p>
      <p>Okkara starvsfólk tryggja høga góðsku í øllum liðum í virðisketuni.</p>
      <p>Umleið 45 fólk arbeiða fulla tíð hjá okkum, og summi teirra hava verið við frá fyrsta degi.</p>
      <p>Við at sameina roynd starvsfólk og nútímans tøkni kunnu vit varðveita okkara høgu góðskukrøv og áhaldandi betra arbeiðsgongdirnar.</p>
      <p>Í dag kunnu vit framleiða umleið 65 tons av saltfiski og 40 tons av lættsaltaðum frystum fløkum um vikuna.</p>
    `
  },
  // ============================================================
  // TG SEAFOOD PAGE — tg-seafood.html
  // ============================================================
  {
    key: "tg-seafood-overview",
    fo: `
      <p>TG Seafood er flakavirki í Hvalba, sum varð stovnað í 2005. Virkið er eitt samstarv millum lokal feløg í Hvalba og Delta Seafood.</p>
      <p>Á flakavirkinum verða interleaved-vørur, einkultfrystar vørur (IQF), portiónir og blokkvørur framleiddar úr upsa, svartkalva og toski.</p>
      <p>TG Seafood hevur orku at virka umleið 120 tons av rávøru um vikuna. Dugnaligu starvsfólkini gera sítt til, at fiskavørurnar eru av høgari góðsku.</p>
      <p><strong>Starsvfólk og samband</strong></p>
      <p>Á TG Seafood starvast umleið 65 fólk. Flestu teirra hava arbeitt á virkinum í nógv ár.</p>
      <p>Hevur tú spurningar, ert tú vælkomin at seta teg í samband við <a href="contact.html#jonbjorg-hentze">Jónbjørg Hentze</a>.</p>
    `
  },
  // ============================================================
  // LMT PAGE — lmt.html
  // ============================================================
  {
    key: "lmt-overview",
    fo: `
      <p>Landingarmiðstøðin á Tvøroyri er eitt nútímans landingar-, móttøku-, skilji- og pakkivirki, har tikið verður ímóti frystum og feskum fiski. Á Landingarmiðstøðini verður tikið ímóti fiski frá  størri skipum, ið landa feskan fisk á Tvøroyri og í Hvalba. Frystur fiskur verður landaður til Frystigoymsluna í Vági.</p>

      <p>Landingarmiðstøðin á Tvøroyri er einasta landingarstað fyri útróðrarbátur í Suðuroy.</p>

      <h3>Nútímans umstøður</h3>

      <p>Nýggi bygningurin varð tikin í nýtslu í 2016. Nýggju umstøðurnar gjørdu tað møguligt at víðka virksemið og effektivisera arbeiðsgongdirnar. Virkið er útgjørt við nútímans tøkni og útgerð, sum tryggjar, at allar fiskavørur verða handfarnar sambært høgu krøvunum til góðsku og matvørutrygd.</p>

      <h3>Samstarv</h3>

      <p>Landingarmiðstøðin samstarvar við Fiskamarknað Føroya um sølu av fiski, sum verður landaður til Landingarmiðstøðina.</p>

      <p>Landingarmiðstøðin er umboð fyri Kassamiðstøðina í Suðuroy. Her ber til at keypa alt tað, sum Kassamiðstøðin bjóðar av kassum, kørum og plattum.</p>

      <h3>Tænastur</h3>

      <ul class="services-list">
        <li><img src="delta-bumerki%20%20uttan%20tekst.png" alt="" aria-hidden="true"><span>Landing, skiljing og merking av fiskinum, soleiðis at hann kann seljast á Fiskamarknaðinum, um bátaeigarin ynskir tað.</span></li>
        <li><img src="delta-bumerki%20%20uttan%20tekst.png" alt="" aria-hidden="true"><span>Veiting av ísi til útróðrarbátarnar (hetta er ein treyt fyri at avreiða til Landingarmiðstøðina).</span></li>
        <li><img src="delta-bumerki%20%20uttan%20tekst.png" alt="" aria-hidden="true"><span>Skiljing, pakking og merking av heilum fiski fyri útflytarar.</span></li>
        <li><img src="delta-bumerki%20%20uttan%20tekst.png" alt="" aria-hidden="true"><span>Upptíðning av frystari rávøru til framleiðslu á virkjunum.</span></li>
      </ul>

      <p>Harumframt verður øll rávøra, sum verður framleidd á Delta Seafood og partvís á TG Seafood, støddarskild á Landingarmiðstøðini.</p>

      <h3>Starvsfólk og samband</h3>

      <p>Á Landingarmiðstøðini starvast umleið fimm fólk.</p>

      <p>Hevur tú spurningar, ert tú vælkomin at seta teg í samband við <a href="contact.html#pol-olaf-vesturgaard">Pól Olaf Vesturgaard</a>.</p>


    `
  },
  // ============================================================
  // FREEZING HOTEL PAGE — defa.html
  // ============================================================
  {
    key: "freezing-hotel-overview",
    fo: `
      <p>Frystigoymslan liggur á havnalagnum í Vági og hevur goymslupláss fyri umleið 4.000 tonsum.</p>
      <p>Skip og bátar kunnu landa beinleiðis til frystigoymsluna.</p>
      <p>Frystigoymslan virkar sum eitt frystihotell við dagligari móttøku og útflýggjan av vøru. Vørurnar koma frá virkjum og frá skipum, sum hava selt vøru til virkir í nærumhvørvinum.</p>
      <p>Harumframt verður avskipað fyri kundar. Avskipingin kann bæði vera at lasta skip og at fylla bingjur og trailarar.</p>
      <p>Frystigoymslan er Russlandsgóðkend.</p>
      <p><strong>Starvsfólk og samband</strong></p>
      <p>Á frystigoymsluni starvast eitt fólk.</p>
      <p>Hevur tú spurningar, ert tú vælkomin at seta teg í samband við <a href="contact.html#jon-eli-nolsoe">Jón Eli Nolsøe</a>.</p>
    `
  },
  // ============================================================
  // FACILITIES OVERVIEW PAGE — about-our-facilities.html
  // ============================================================
  {
    key: "facilities-overview",
    en: `
      <p>Delta Seafood Group consists of four firms: Delta Seafood, TG Seafood, Landingarmiðstøðin and Frystigoymslan. Together, the four firms give us control of the value chain from landing and processing to storage and distribution. We are committed to responsible fishing practices and high-quality seafood products made from excellent raw materials.</p>
    `,
    fo: `
      <p>Delta Seafood samtakið fevnir um fýra virkir: Delta Seafood, TG Seafood, Landingarmiðstøðina og Frystigoymslan. Saman geva tey fýra virkini okkum tamarhald á virðisketuni frá landing og framleiðslu til goymslu og útbreiðslu. Vit leggja stóran dent á ábyrgdarfulla veiðu og dygdargóðar fiskavørur úr góðari rávøru.</p>
    `
  }
];
