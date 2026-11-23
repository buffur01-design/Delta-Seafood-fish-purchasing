const markets = {
  "Faroe Islands": { region: "North Atlantic", focus: "Operations", description: "Home base for Delta Seafood operations and coordination." },
  Spain: { region: "Southern Europe", focus: "Sales market", description: "A key European destination in Delta Seafood's commercial network." },
  Italy: { region: "Southern Europe", focus: "Sales market", description: "An established European market for Delta Seafood products." },
  USA: { region: "North America", focus: "Sales market", description: "Delta Seafood's current market connection in North America." }
};

const nodes = document.querySelectorAll(".node");
const name = document.querySelector("#market-name");
const description = document.querySelector("#market-description");
const region = document.querySelector("#market-region");
const focus = document.querySelector("#market-focus");

function selectMarket(node) {
  const marketName = node.dataset.market;
  const market = markets[marketName];
  nodes.forEach(item => item.classList.toggle("active", item === node));
  name.textContent = marketName;
  description.textContent = market.description;
  region.textContent = market.region;
  focus.textContent = market.focus;
}

nodes.forEach(node => {
  node.addEventListener("click", () => selectMarket(node));
  node.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectMarket(node);
    }
  });
});

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".main-nav");
menuButton.addEventListener("click", () => {
  const isOpen = navigation.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll('.main-nav a[href^="#"]').forEach(link => {
  link.addEventListener("click", () => {
    navigation.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});

selectMarket(document.querySelector('.node[data-market="Faroe Islands"]'));
