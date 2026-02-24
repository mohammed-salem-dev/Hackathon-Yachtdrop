import fs from "fs";
import path from "path";

export type ProductItem = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number; // ← add this — if set, shows strikethrough + badge
  imageUrl: string;
  description: string;
  category: string;
  sourceUrl: string;
};

type ProductCache = {
  fetchedAt: number;
  products: ProductItem[];
};

const CACHE_FILE =
  process.env.NODE_ENV === "production"
    ? "/tmp/products-cache.json"
    : path.join(process.cwd(), "products-cache.json");

const CACHE_TTL_MS = 0;

const MOCK_PRODUCTS: ProductItem[] = [


  // ── ANCHORING ──
  {
    id: "nh-anchor-Lewmar-10kg",
    name: "Lewmar delta anchor stainless steel 40kg",
    price: 5813.06,

    imageUrl: "/products/lewmar.png",
    description:
      "Its unique shank profile and ballasted tip make the Delta® anchor self-launching. The low centre of gravity and self-righting geometry ensure that the Delta® anchor will set immediately. Consistent and reliable in performance, the Delta® anchor has Lloyd's Register General Approval of an Anchor Design as a High Holding Power anchor and is specified as the primary anchor used by numerous National Lifeboat organisations. Also available in premium grade Duplex/High Tensile stainless steel.",
    category: "Anchoring & Docking",
    sourceUrl:
      "https://nautichandler.com/6779-large_default/lewmar-delta-anchor-stainless-steel-40kg.webp",
  },
  {
    id: "nh-anchor-Rope",
    name: "Rope covers maxichafe ø24-34mm (30cm) black fendequip",
    price: 25.85,
    imageUrl: "/products/rope-covers.png",
    description:
      "The unique maxiChafe chafeMat system protects the yachts topside and gel coat from scuff marks whilst extending the life of the rope.",
    category: "Anchoring & Docking",
    sourceUrl:
      "https://nautichandler.com/en/8496-rope-covers-maxichafe-o2434mm-30cm-black-fendequip.html",
  },
  {
    id: "nh-anchor-Maxistow",
    name: "Maxistow hd inflatable fender dark grey 75x30cm fendequip",
    price: 197.77,
    originalPrice: 219.74,
    imageUrl: "/products/maxistow-hd.png",
    description:
      "Light and easy to handle when inflated and easily stowed into a small locker when deflated. Made from high-grade fabrics with an abrasion and UV resistant surface.",
    category: "Anchoring & Docking",
    sourceUrl:
      "https://nautichandler.com/en/8525-maxistow-hd-inflatable-fender-dark-grey-75x30cm-fendequip.html",
  },

  // ── SAFETY ──
  {
    id: "nh-Retro-reflective",
    name: "Retro reflective tape solas 50mmx1m",
    price: 38.82,
    originalPrice: 48.52,
    imageUrl: "/products/retro-reflective-.png",
    description:
      "Retro-reflecvtive tape SOLAS. Increases safety for inflatables, life vests, life bouys, etc.",
    category: "Safety",
    sourceUrl:
      "https://nautichandler.com/en/1924-retro-reflective-tape-solas-50mmx1m.html",
  },
  {
    id: "nh-PLASTIMO-Lifejacket",
    name: "PLASTIMO Lifejacket pilot 165 with harness",
    price: 84.37,
    originalPrice: 105.46,
    imageUrl: "/products/plastimo-lifejacket.png",
    description:
      "Buoyancy : Rated 150 N, actual buoyancy 165 N, XXL size available : with 60 - 175 cm belt",
    category: "Safety",
    sourceUrl:
      "https://nautichandler.com/en/17482-plastimo-lifejacket-pilot-165-with-harness.html",
  },

  {
    id: "nh-Liferaft-ISO9650",
    name: "Liferaft 4 Person Valise ISO9650",
    price: 2383.51,
    imageUrl: "/products/liferaft-4-person.png",
    description:
      "Life rafts created especially for the Spanish market, according to the present regulations. Available in canister or valise.",
    category: "Safety",
    sourceUrl:
      "https://nautichandler.com/en/16541-liferaft-4-person-valise-iso9650.html",
  },

  // ── ELECTRICAL ──
  {
    id: "nh-Insulating-Tape",
    name: "Wurth Insulating Tape Pvc Grey 19xmm25mm",
    price: 3.81,
    originalPrice: 4.48,
    imageUrl: "/products/wurth-insulating.png",
    description:
      "General use in all types of electrical and industrial applications, insulation and clamping, marking of installations, etc ...",
    category: "Electrics - Lighting",
    sourceUrl:
      "https://nautichandler.com/en/9252-wurth-insulating-tape-pvc-grey-19xmm25mm.html",
  },
  {
    id: "nh-Cable-Connector-PIN",
    name: "Hella Cable Connector Kit 7 PIN",
    price: 81.5,
    originalPrice: 85.79,
    imageUrl: "/products/hella-cable.png",
    description: "Article number: 8JA 006 807-801",
    category: "Electrics - Lighting",
    sourceUrl:
      "https://nautichandler.com/en/17750-hella-cable-connector-kit-7-pin.html",
  },
  {
    id: "nh-Orion-converter-victron",
    name: "Orion tr converter 12/12v-30a 360w victron",
    price: 260.15,
    imageUrl: "/products/orion-tr-converter.png",
    description:
      "Images shown may not accurately represent Orion-Tr 12 / 12-30A (360W) characteristics.",
    category: "Electrics - Lighting",
    sourceUrl:
      "https://nautichandler.com/en/13520-orion-tr-converter-1212v30a-360w-victron.html",
  },

  // ── ROPES & RIGGING ──
  {
    id: "nh-MaxiStow-FENDEQUIP",
    name: "MaxiStow inflatable fender HDPVC Repair Kit FENDEQUIP",
    price: 171.71,
    imageUrl: "/products/maxistow-inflatable.png",
    description: "Glue not included",
    category: "Ropes",
    sourceUrl:
      "https://nautichandler.com/en/17746-maxistow-inflatable-fender-hdpvc-repair-kit-fendequip.html",
  },
  {
    id: "nh-Halyard-White",
    name: "Bag Halyard PVC White 30x20x10cm",
    price: 46.71,
    originalPrice: 58.39,
    imageUrl: "/products/bag-halyard.png",
    description: "PVC or Dralon, mesh canvas, batten and grommets.",
    category: "Ropes",
    sourceUrl:
      "https://nautichandler.com/en/15044-bag-halyard-pvc-white-30x20x10cm.html",
  },
  {
    id: "nh-Dynema-Regata-2000",
    name: "LIROS Dynema Regata Regata 2000 Blue 8mm",
    price: 6.77,
    originalPrice: 7.52,
    imageUrl: "/products/liros-dynema.png",
    description:
      "Mod. LIROS REGATTA 2000 - Material: Alma Dynema SK75 and polyester sheath of high torsion Construction: 2-3mm. Twisted 16 threads. From 4 mm.",
    category: "Ropes",
    sourceUrl:
      "https://nautichandler.com/en/9606-liros-dynema-regata-line-2000-blue-8mm.html",
  },

  // ── Motor ──
  {
    id: "nh-absorbents-3m",
    name: "3m oil absorbents 480x430x3mm x unity 1L",
    price: 1.51,
    originalPrice: 1.89,
    imageUrl: "/products/3m-oil-absorbents.png",
    description:
      "3M absorbers can be used in a wide variety of applications for spill control. Spills can be controlled and collected effectively minimizing environmental impact.",
    category: "Motor",
    sourceUrl:
      "https://nautichandler.com/en/156-3m-oil-absorbents-480x430x3mm-x-unity-1l.html",
  },
  {
    id: "nh-VETUS-Exhaust-3.5",
    name: "VETUS Exhaust Pipe 3.5",
    price: 88.33,
    imageUrl: "/products/vetus-exhaust-pipe-35.png",
    description: "Rubber tube, inner Ø 3.5 (20 m roll) (price per meter).",
    category: "Motor",
    sourceUrl: "https://www.nautichandler.com",
  },

  // ── NAVIGATION ──
  {
    id: "nh-offshore-105",
    name: "Plastimo offshore 105 compass black conical card",
    price: 257.7,
    originalPrice: 322.13,
    imageUrl: "/products/plastimo-offshore.png",
    description: "Powerboats 5 to 10 m (17 to 33 ft).",
    category: "Navigation",
    sourceUrl:
      "https://nautichandler.com/en/16136-plastimo-offshore-105-compass-black-conical-card.html",
  },
  {
    id: "nh-Plastimo-bracket-105",
    name: "Plastimo bracket kit offshore 105 compass black",
    price: 45.45,
    originalPrice: 56.81,
    imageUrl: "/products/plastimo-bracket.png",
    description:
      "The optional bracket brings additional mounting possibilities, either on a horizontal surface avoiding to cut the instrument panel, or on a vertical bulkhead.",
    category: "Navigation",
    sourceUrl:
      "https://nautichandler.com/en/16137-plastimo-bracket-kit-offshore-105-compass-black.html",
  },

  // ── Maintenance - Cleaning Products ──

  {
    id: "nh-Spinnaker-repair-5m",
    name: "Spinnaker repair tape black 50mmx4,5m",
    price: 15.14,
    originalPrice: 18.93,
    imageUrl: "/products/spinnaker-repair.png",
    description: "Self-adhesive tape in nylon for sail repairs.",
    category: "Maintenance - Cleaning Products",
    sourceUrl:
      "https://nautichandler.com/en/2107-spinnaker-repair-tape-black-50mmx45m.html",
  },
  {
    id: "nh-GREEN-Regular",
    name: "SIMPLE GREEN Regular Cleaner&Degreaser 10l",
    price: 129.81,
    originalPrice: 162.26,
    imageUrl: "/products/simple-green-regular.png",
    description:
      "Powerful Multi-purpose Cleaner-Degreaser: safe, effective and powerful for critical cleaning that requires an ideal aroma and color free solution for the manufacturing, electronics and food industry.",
    category: "Cleaning Products",
    sourceUrl:
      "https://nautichandler.com/en/3532-simple-green-regular-cleanerdegreaser-10l.html",
  },

  //Fitting
  {
    id: "nh-rope-clamp-2units",
    name: "Wire rope clamp s.steel ø3mm (2units)",
    price: 2.89,
    originalPrice: 3.61,
    imageUrl: "/products/wire-rope-clamp.png",
    description: "AISI-316 stainless steel clamp cable tie.",
    category: "Fitting",
    sourceUrl:
      "https://nautichandler.com/en/6807-wire-rope-clamp-ssteel-o3mm-2units.html",
  },
  {
    id: "nh-Wire-Rope-4mm",
    name: "Wire Rope Clip Cable Clamp S.Steel 4mm",
    price: 14.88,
    originalPrice: 18.6,
    imageUrl: "/products/wire-rope-clip.png",
    description: "Cable ties for metal cables in stainless steel.",
    category: "Fitting",
    sourceUrl:
      "https://nautichandler.com/en/5852-wire-rope-clip-cable-clamp-ssteel-4mm.html",
  },
  //Life On Board
  {
    id: "nh-Isotherm-Water-230V",
    name: "Isotherm Water kit tank 230V 50-60Hz 15L",
    price: 349.72,
    imageUrl: "/products/isotherm-water.png",
    description: "Water tank 15L with pump",
    category: "Life On Board",
    sourceUrl:
      "https://nautichandler.com/en/17208-isotherm-water-kit-tank-230v-5060hz-15l.html",
  },
  {
    id: "nh-Adapter-Olive-RG57049",
    name: "Adapter G1/4M-Olive 8mm-RG57049",
    price: 15.84,
    imageUrl: "/products/adapter-g14molive.png",
    description:
      "Designed for the installation of a BBQ, a stove or an oven on a boat.",
    category: "Life On Board",
    sourceUrl:
      "https://nautichandler.com/en/19943-adapter-g14molive-8mmrg57049.html",
  },
  //Inflatable-Water Toys
  {
    id: "nh-Inflatable-Repair-500ml",
    name: "Pvc Inflatable Repair Kit Black",
    price: 33.02,
    imageUrl: "/products/pvc-inflatable.png",
    description:
      "Contains: 75 ml. single component glue PU and one piece of PVC fabric.",
    category: "Inflatable-Water Toys",
    sourceUrl:
      "https://nautichandler.com/en/3359-pvc-inflatable-repair-kit-black.html",
  },
  {
    id: "nh-Inflatable-Tender-P220SH",
    name: "Plastimo Inflatable Tender Raid II P220SH Blue",
    price: 876.28,
    imageUrl: "/products/plastimo-inflatable.png",
    description:
      "The innovative design makes the most of space on board with additional storage areas and optimum confort for the crew. The reinforced cones contribute to optimizing planing.",
    category: "Inflatable-Water Toys",
    sourceUrl:
      "https://nautichandler.com/en/15698-plastimo-inflatable-tender-raid-ii-p220sh-blue.html",
  },
  //Painting
  {
    id: "nh-Burlete-Masking-13mmx50m",
    name: "3M Burlete Masking 13mmx50m x Box",
    price: 41.35,
    originalPrice: 51.69,
    imageUrl: "/products/3m-burlete.png",
    description:
      "Scoth masking weatherstrip 13 mm x 50 m Covers vehicle openings (doors, hood, trunk ...).",
    category: "Painting",
    sourceUrl:
      "https://nautichandler.com/en/5734-3m-burlete-masking-13mmx50m-x-box.html",
  },

  //Plumbing
  {
    id: "nh-Armaflex-tape-50mmx3mmx15m",
    name: "Armaflex xg tape self-adhesive 50mmx3mmx15m",
    price: 26.56,
    originalPrice: 31.25,
    imageUrl: "/products/armaflex-xg-tape.png",
    description: "Reliable condensation control based on closed-cell",
    category: "Plumbing",
    sourceUrl:
      "https://nautichandler.com/en/3528-armaflex-xg-tape-selfadhesive-50mmx3mmx15m.html",
  },
  //Electronics
  {
    id: "nh-GARMIN-Echomap-62cv",
    name: "GARMIN Echomap Uhd 62cv With Transducer Gt24 xdcr",
    price: 749.0,
    imageUrl: "/products/garmin-echomap.png",
    description:
      "The sunlight-readable 6 chartplotter features a quick-release bail mount, and the transducer bundle adds Ultra High-Definition scanning sonar and CHIRP traditional sonar.",
    category: "Electronics",
    sourceUrl:
      "https://nautichandler.com/en/12805-garmin-echomap-uhd-62cv-with-transducer-gt24-xdcr.html",
  },
  {
    id: "nh-Inmarsat-isatphone-pro",
    name: "Inmarsat isatphone 2/pro dc charger",
    price: 15.0,
    imageUrl: "/products/inmarsat-isatphone.png",
    description:
      "This AC power charger for the IsatPhone Pro and IsatPhone 2 comes with international plugs to plug in worldwide power.",
    category: "Electronics",
    sourceUrl:
      "https://nautichandler.com/en/13373-inmarsat-isatphone-2pro-dc-charger.html",
  },
  //Screws
  {
    id: "nh-Clamp-stainless-3017",
    name: "Clamp stainless steel DIN 3017 8-16/9",
    price: 1.92,
    originalPrice: 2.57,
    imageUrl: "/products/clamp-stainless-steel.png",
    description: "Clamp stainless steel DIN 3017 8-16/9",
    category: "Screws",
    sourceUrl:
      "https://nautichandler.com/en/17073-clamp-stainless-steel-din-3017-8169.html",
  },
  //Tools - Machines
  {
    id: "nh-liquid-protection-XL",
    name: "3M liquid protection one piece vest white size XL",
    price: 11.65,
    originalPrice: 14.57,
    imageUrl: "/products/3m-liquid-protection.png",
    description:
      "Excellent barrier against dry particles and some splashes of liquid chemicals (EC type 5/6).",
    category: "Tools - Machines",
    sourceUrl:
      "https://nautichandler.com/en/10471-3m-liquid-protection-one-piece-vest-white-size-xl.html",
  },
  //Nautical Clothing and Personal Gear
  {
    id: "nh-Overshoe-small-navy",
    name: "Overshoe small 10-12 navy fendequip",
    price: 32.55,
    imageUrl: "/products/overshoe-small-1012-navy.png",
    description:
      "Ultra lightweight and easy to fit, each overShoe has non-absorbent sole and the non-slip underside will protect against scuff marks; perfect for your special visitors or contractors.",
    category: "Nautical Clothing and Personal Gear",
    sourceUrl:
      "https://nautichandler.com/en/8953-overshoe-small-1012-navy-fendequip.html",
  },
  //Brands
  {
    id: "nh-Aerospace-Protectant-Protectant",
    name: "303 Aerospace Protectant UV Protectant for vinyl, rubber and plastic 0.473L",
    price: 41.09,
    originalPrice: 43.25,
    imageUrl: "/products/303-aerospace-protectant.png",
    description:
      "303 Aerospace Protectant is a high-performance treatment designed to protect marine surfaces from UV rays, salt exposure, and premature aging. Originally developed for the aerospace industry, this advanced formula provides superior protection for vinyl, plastic, rubber, fiberglass, and gel coat, keeping them looking like new for longer.",
    category: "Brands",
    sourceUrl:
      "https://nautichandler.com/en/24991-303-aerospace-protectant-uv-protection-for-vinyl-rubber-and-plastic-0473l.html",
  },
];

function readCache(): ProductCache | null {
  try {
    if (!fs.existsSync(CACHE_FILE)) return null;
    return JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8")) as ProductCache;
  } catch {
    return null;
  }
}

function writeCache(products: ProductItem[]) {
  try {
    fs.writeFileSync(
      CACHE_FILE,
      JSON.stringify({ fetchedAt: Date.now(), products }, null, 2),
      "utf-8",
    );
  } catch {
    // write failed — ignore silently
  }
}

function isCacheValid(cache: ProductCache): boolean {
  return Date.now() - cache.fetchedAt < CACHE_TTL_MS;
}

export async function fetchLiveInventory(): Promise<ProductItem[]> {
  const cached = readCache();
  if (cached && isCacheValid(cached)) return cached.products;

  try {
    const axios = (await import("axios")).default;
    const cheerio = await import("cheerio");

    const CATEGORIES = [
      { id: "3", slug: "deck-hardware", label: "Deck Hardware" },
      { id: "7", slug: "safety", label: "Safety" },
      { id: "10", slug: "electrical", label: "Electrical" },
      { id: "14", slug: "ropes-rigging", label: "Ropes & Rigging" },
      { id: "17", slug: "anchoring", label: "Anchoring" },
      { id: "21", slug: "navigation", label: "Navigation" },
      { id: "26", slug: "maintenance", label: "Maintenance" },
    ];

    const UA =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) " +
      "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

    const allProducts: ProductItem[] = [];

    for (const cat of CATEGORIES) {
      try {
        const url = `https://www.nautichandler.com/en/${cat.id}-${cat.slug}`;
        const { data: html } = await axios.get<string>(url, {
          headers: { "User-Agent": UA, "Accept-Language": "en-GB,en;q=0.9" },
          timeout: 8000,
        });

        const $ = cheerio.load(html);

        $("article.product-miniature, .js-product-miniature").each((_, el) => {
          const card = $(el);
          const name = card
            .find(".product-title a, h2.h3 a")
            .first()
            .text()
            .trim();
          if (!name) return;

          const priceText = card.find(".price").first().text().trim();
          const price =
            parseFloat(priceText.replace(/[^0-9.,]/g, "").replace(",", ".")) ||
            0;

          const imgEl = card.find("img.lazy, img").first();
          const imageUrl =
            imgEl.attr("data-src") ||
            imgEl.attr("src") ||
            "/placeholder-product.png";

          const rel = card.find(".product-title a").attr("href") || "";
          const sourceUrl = rel.startsWith("http")
            ? rel
            : `https://www.nautichandler.com${rel}`;

          const description =
            card.find(".product-description-short").first().text().trim() ||
            `${cat.label} product`;

          const id = `nh-${name
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]/g, "")
            .slice(0, 40)}-${cat.id}`;

          allProducts.push({
            id,
            name,
            price,
            imageUrl,
            description,
            category: cat.label,
            sourceUrl,
          });
        });
      } catch {
        // single category failed — continue
      }
    }

    if (allProducts.length > 0) {
      writeCache(allProducts);
      return allProducts;
    }
  } catch {
    // scraper failed entirely
  }

  const stale = readCache();
  if (stale && stale.products.length > 0) return stale.products;

  writeCache(MOCK_PRODUCTS);
  return MOCK_PRODUCTS;
}
