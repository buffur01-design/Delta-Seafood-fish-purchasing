(function(){
  const footer = document.querySelector("footer");
  if(!footer) return;

  footer.innerHTML = `
    <div class="footer-wrapper">
      <div class="footer-logo">
        <img src="delta-bumerki.png" alt="Delta Seafood Logo">
      </div>

      <div class="footer-feature-grid">
        <div class="footer-column">
          <h4>Contact</h4>
          <div class="footer-contact-entry">
            <strong>Delta Seafood</strong>
            <a href="mailto:Deltaseafood@deltaseafood.fo">Deltaseafood@deltaseafood.fo</a>
            <span>Telephone +298 208800</span>
            <span>Havnalagið 25, 800 Tvøroyri</span>
            <span>Reg no: 2468</span>
            <span>VAT no.: 448486</span>
          </div>
          <div class="footer-contact-entry">
            <strong>TG Seafood</strong>
            <a href="mailto:tgseafood@tgseafood.fo">tgseafood@tgseafood.fo</a>
            <span>Telephone +298 208800</span>
            <span>Á Hamranesi 10, 850 Hvalba</span>
            <span>Reg no: 3670</span>
            <span>VAT no.: 532908</span>
          </div>

          <h4>Address</h4>
          <div class="footer-address-grid">
            <div>
              <p>Delta Seafood</p>
              <p>Havnalagið 25</p>
              <p>800 Tvøroyri</p>
            </div>
            <div>
              <p>TG Seafood</p>
              <p>Á Hamranesi 10</p>
              <p>850 Hvalba</p>
            </div>
          </div>
        </div>

        <div class="footer-column footer-image-column">
          <img src="salted-cod.png" alt="Salted cod">
        </div>

        <div class="footer-column">
          <h4>Registration Delta Seafood</h4>
          <p>Registration no: 2468</p>
          <p>VAT no.: 448486</p>
          <h4>Registration TG Seafood</h4>
          <p>Registration no: 3670</p>
          <p>VAT no.: 532908</p>
        </div>

        <div class="footer-column footer-msc">
          <div class="footer-msc-frame">
            <img src="msc.svg" alt="MSC Certification">
            <p>Certified sustainable by MSC for responsible seafood sourcing.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="footer-note">Delta Seafood © 2026. All rights reserved.</div>
  `;
})();
