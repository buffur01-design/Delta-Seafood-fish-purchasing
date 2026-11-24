(function(){
  const navbar = document.querySelector(".navbar");
  if(!navbar) return;

  let switcher = navbar.querySelector(".site-language-switcher");
  if(!switcher){
    switcher = document.createElement("div");
    switcher.className = "site-language-switcher";
    switcher.setAttribute("aria-label", "Choose language");
    switcher.dataset.ariaLabelEn = "Choose language";
    switcher.dataset.ariaLabelFo = "Vel mál";
    switcher.innerHTML = `
      <button type="button" data-lang="en">EN</button>
      <button type="button" data-lang="fo">FO</button>
    `;
    navbar.appendChild(switcher);
  }

  let language = localStorage.getItem("deltaLanguage") === "fo" ? "fo" : "en";
  document.documentElement.lang = language;

  const menuRight = navbar.querySelector(".menu-right");
  if(menuRight){
    const jobsLink = menuRight.querySelector('a[href="jobs.html"]');
    const ensurePrimaryLink = (href, label) => {
      let link = menuRight.querySelector(`a[href="${href}"]`);
      if(!link){
        link = document.createElement("a");
        link.href = href;
        link.textContent = label;
        menuRight.insertBefore(link, jobsLink || null);
      }
      return link;
    };
    ensurePrimaryLink("links.html", "Links");
    ensurePrimaryLink("esg.html", "ESG");
  }

  switcher.querySelectorAll("button").forEach(button => {
    const active = button.dataset.lang === language;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active);

    button.addEventListener("click", () => {
      const nextLanguage = button.dataset.lang === "fo" ? "fo" : "en";
      if(nextLanguage === language) return;
      language = nextLanguage;
      localStorage.setItem("deltaLanguage", language);
      document.documentElement.lang = language;
      switcher.querySelectorAll("button").forEach(option => {
        const isActive = option.dataset.lang === language;
        option.classList.toggle("active", isActive);
        option.setAttribute("aria-pressed", isActive);
      });
      applyLanguage(language);
      window.dispatchEvent(new CustomEvent("delta-language-change", { detail:{ language } }));
    });
  });

  function applyLanguage(language){
  const commonLabels = {
    en:{home:"Home", products:"Products", markets:"Markets", facilities:"Facilities", contact:"Contact", links:"Links", esg:"ESG", jobs:"Jobs"},
    fo:{home:"Heim", products:"Vørur", markets:"Marknaðir", facilities:"Virkir", contact:"Samband", links:"Leinkjur", esg:"ESG", jobs:"Størv"}
  }[language];

  document.querySelectorAll('.navbar a[href="./"], .navbar a[href="index.html"]').forEach(link => {
    if(!link.classList.contains("logo")) link.textContent = commonLabels.home;
  });
  document.querySelectorAll('.navbar a[href="products.html"]').forEach(link => link.textContent = commonLabels.products);
  document.querySelectorAll('.navbar a[href="markets.html"]').forEach(link => {
    if(link.closest(".dropdown")) return;
    link.textContent = commonLabels.markets;
  });
  document.querySelectorAll('.navbar a[href="about-our-facilities.html"], .navbar a[href="facilities.html"]').forEach(link => {
    if(link.closest(".dropdown")) return;
    link.textContent = commonLabels.facilities;
  });
  document.querySelectorAll('.navbar a[href="contact.html"]').forEach(link => link.textContent = commonLabels.contact);
  document.querySelectorAll('.navbar a[href="links.html"]').forEach(link => link.textContent = commonLabels.links);
  document.querySelectorAll('.navbar a[href="esg.html"]').forEach(link => link.textContent = commonLabels.esg);
  document.querySelectorAll('.navbar a[href="jobs.html"]').forEach(link => link.textContent = commonLabels.jobs);

  {
    const translationByMatch = new Map();
    pageTranslations.forEach(item => {
      [item.match, item.en, item.fo].forEach(value => {
        if(value) translationByMatch.set(value.trim().replace(/\s+/g, " "), item);
      });
    });
    const translationBlocksByKey = new Map(
      (typeof pageTranslationBlocks === "undefined" ? [] : pageTranslationBlocks)
        .map(item => [item.key, item])
    );

    document.querySelectorAll("[data-text-en][data-text-fo]").forEach(element => {
      element.textContent = language === "fo" ? element.dataset.textFo : element.dataset.textEn;
    });

    document.querySelectorAll("[data-translation-block]").forEach(block => {
      const translation = translationBlocksByKey.get(block.dataset.translationBlock);
      if(!translation) return;

      if(block.hasAttribute("data-translation-source-en")){
        if(typeof block._deltaEnglishHtml === "undefined"){
          block._deltaEnglishHtml = block.innerHTML;
        }
        block.innerHTML = language === "fo" ? translation.fo : block._deltaEnglishHtml;
        return;
      }

      block.innerHTML = translation[language];
    });

    const translateSubtree = root => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const textNodes = [];
      while(walker.nextNode()) textNodes.push(walker.currentNode);
      textNodes.forEach(node => {
        if(node.parentElement?.closest("script, style")) return;
        const original = node.nodeValue.trim().replace(/\s+/g, " ");
        const translation = translationByMatch.get(original);
        if(translation){
          node.nodeValue = node.nodeValue.replace(node.nodeValue.trim(), translation[language]);
          return;
        }

        if(language === "fo" && node.parentElement?.closest(".modal-description, #modalText")){
        const productPhrases = [
          [/Fillets/g, "Fløk"],
          [/Splitted|Spillted|Splited/g, "Flaktur fiskur"],
          [/Headed and gutted without tail/g, "Avhøvdaður og kruvdur uttan hala"],
          [/Headed and gutted with tail/g, "Avhøvdaður og kruvdur við hala"],
          [/Headed on gutted with tail/g, "Við høvdi, kruvdur og við hala"],
          [/Frozen interleaved/gi, "Frystar interleave-vørur"],
          [/Interleaved frozen products/gi, "Frystar interleave-vørur"],
          [/interleaved/gi, "interleave"],
          [/Other products/g, "Aðrar vørur"],
          [/Packaging/g, "Pakking"],
          [/Quality grades/g, "Góðskuflokkar"],
          [/Quality grade/g, "Góðskuflokkur"],
          [/Wet salted/g, "Saltaðar vørur"],
          [/Light salted/g, "Lættsaltaðar vørur"],
          [/Frozen/g, "Fryst"],
          [/IQF/g, "IQF"],
          [/Block frozen/g, "Blokkfrystur"],
          [/Skinless/g, "Uttan skræðu"],
          [/Skin on/g, "Við skræðu"],
          [/Skin off/g, "Uttan skræðu"],
          [/ungraded/gi, "Óflokkaður"],
          [/Heads/g, "Høvd"],
          [/Roe/g, "Rogn"],
          [/Tongue/g, "Tungur"],
          [/Portions/g, "Portiónir"],
          [/Loins/g, "Ryggstykki"],
          [/Tails/g, "Halar"],
          [/skinless/g, "uttan skræðu"],
          [/skin on/g, "við skræðu"],
          [/skin off/g, "uttan skræðu"],
          [/sizes from/g, "støddir frá"],
          [/sizes/g, "støddir"],
          [/size/g, "stødd"],
          [/ up to /g, " upp í "],
          [/ to /g, " til "],
          [/ and /g, " og "]
        ];
        let translated = node.nodeValue;
        productPhrases.forEach(([pattern, replacement]) => translated = translated.replace(pattern, replacement));
          node.nodeValue = translated;
        }
      });
    };

    window.translateDeltaSubtree = translateSubtree;
    translateSubtree(document.body);

    document.querySelectorAll("[data-aria-label-en][data-aria-label-fo]").forEach(element => {
      element.setAttribute(
        "aria-label",
        language === "fo" ? element.dataset.ariaLabelFo : element.dataset.ariaLabelEn
      );
    });

    document.querySelectorAll("[data-alt-en][data-alt-fo]").forEach(image => {
      image.alt = language === "fo" ? image.dataset.altFo : image.dataset.altEn;
    });

    document.querySelectorAll("[data-content-en][data-content-fo]").forEach(element => {
      element.setAttribute(
        "content",
        language === "fo" ? element.dataset.contentFo : element.dataset.contentEn
      );
    });

    document.querySelectorAll("[data-href-en][data-href-fo]").forEach(element => {
      element.setAttribute(
        "href",
        language === "fo" ? element.dataset.hrefFo : element.dataset.hrefEn
      );
    });

    document.querySelectorAll(".product-card-trigger").forEach(trigger => {
      const title = trigger.closest(".product-card")?.querySelector(".title")?.textContent.trim();
      if(!title) return;
      trigger.setAttribute(
        "aria-label",
        language === "fo" ? `Sí vørulýsing fyri ${title}` : `View specifications for ${title}`
      );
    });

    const translatedTitle = translationByMatch.get(document.title);
    if(translatedTitle) document.title = translatedTitle[language];

    document.querySelectorAll(".sales-team-float").forEach(tab => {
      const label = tab.querySelector(".sales-team-float-label");
      if(label && label.scrollWidth > 0){
        tab.style.setProperty("--label-width", `${Math.ceil(label.scrollWidth) + 2}px`);
      }
    });
  }
  }

  applyLanguage(language);
})();
