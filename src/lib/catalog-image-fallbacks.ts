import type { Product } from "@/types/ecommerce";

type ProductImageSource = Pick<Product, "slug" | "baseCategoryId" | "categoryIds">;

const alphaThetaControllerImage =
  "https://assets.alphatheta.com/wp-content/uploads/2025/07/DDJ-FLX10_djay_support_Key-visual_1200x630.jpg";

// Real product packshots used until local product assets are added to the repo.
export const productImageFallbacks: Record<string, string> = {
  "fender-player-ii-stratocaster-hss-black":
    "https://thumbs.static-thomann.de/thumb//bdbmagic/pics/prod/598253.jpg",
  "gibson-les-paul-standard-50s-heritage-cherry-sunburst":
    "https://thumbs.static-thomann.de/thumb//bdbmagic/pics/prod/462505.jpg",
  "ibanez-azes40-black":
    "https://thumbs.static-thomann.de/thumb//bdbmagic/pics/prod/524947.jpg",
  "yamaha-fg830-natural":
    "https://thumbs.static-thomann.de/thumb//bdbmagic/pics/prod/379935.jpg",
  "fender-mustang-lt25":
    "https://thumbs.static-thomann.de/thumb/padthumb600x600/pics/bdb/_45/456903/13933481_800.jpg",
  "ibanez-sr300e-iron-pewter":
    "https://thumbs.static-thomann.de/thumb//bdbmagic/pics/prod/379379.jpg",
  "fender-rumble-100-v3":
    "https://thumbs.static-thomann.de/thumb//bdbmagic/pics/prod/331986.jpg",
  "yamaha-stage-custom-birch-5-piece-shell-pack-honey-amber":
    "https://thumbs.static-thomann.de/thumb/padthumb600x600/pics/bdb/_36/369229/18237355_800.jpg",
  "pearl-export-exx-5-piece-drum-set-jet-black":
    "https://thumbs.static-thomann.de/thumb//bdbmagic/pics/prod/313175.jpg",
  "roland-td-17kvx2-v-drums-kit":
    "https://thumbs.static-thomann.de/thumb//bdbmagic/pics/prod/551837.jpg",
  "roland-fp-30x-black":
    "https://thumbs.static-thomann.de/thumb/padthumb600x600/pics/bdb/_51/510682/16037098_800.jpg",
  "yamaha-p225-black":
    "https://thumbs.static-thomann.de/thumb/padthumb600x600/pics/bdb/_56/568064/18547848_800.jpg",
  "korg-minilogue-xd":
    "https://thumbs.static-thomann.de/thumb/padthumb600x600/pics/bdb/_45/457066/14351333_800.jpg",
  "korg-microkey-air-61":
    "https://thumbs.static-thomann.de/thumb/padthumb600x600/pics/bdb/_37/374930/16221986_800.jpg",
  "focusrite-scarlett-2i2-4th-gen":
    "https://thumbs.static-thomann.de/thumb//bdbmagic/pics/prod/566684.jpg",
  "universal-audio-apollo-twin-x-duo":
    "https://thumbs.static-thomann.de/thumb//bdbmagic/pics/prod/571436.jpg",
  "shure-sm7b":
    "https://thumbs.static-thomann.de/thumb//bdbmagic/pics/prod/129929.jpg",
  "yamaha-hs8-pair":
    "https://thumbs.static-thomann.de/thumb//bdbmagic/pics/prod/313037.jpg",
  "sennheiser-hd-650":
    "https://thumbs.static-thomann.de/thumb//bdbmagic/pics/prod/471755.jpg",
  "pioneer-dj-ddj-flx10": alphaThetaControllerImage,
  "pioneer-dj-djm-a9": alphaThetaControllerImage,
  "yamaha-dbr12-powered-speaker":
    "https://thumbs.static-thomann.de/thumb//bdbmagic/pics/prod/350853.jpg",
  "yamaha-mg12xu-analog-mixer":
    "https://thumbs.static-thomann.de/thumb/padthumb600x600/pics/bdb/_33/333834/8414184_800.jpg",
  "shure-blx24-sm58-wireless-system":
    "https://thumbs.static-thomann.de/thumb/padthumb600x600/pics/bdb/_31/315734/12170867_800.jpg",
  "fender-professional-series-cable-6m":
    "https://thumbs.static-thomann.de/thumb//bdbmagic/pics/prod/530710.jpg",
  "yamaha-l85-digital-piano-stand-black":
    "https://thumbs.static-thomann.de/thumb//bdbmagic/pics/prod/478583.jpg",
  "gibson-original-les-paul-hardshell-case":
    "https://thumbs.static-thomann.de/thumb//bdbmagic/pics/prod/246967.jpg",
};

export const categoryImageFallbacks: Record<string, string> = {
  guitars: productImageFallbacks["fender-player-ii-stratocaster-hss-black"],
  "electric-guitars":
    productImageFallbacks["gibson-les-paul-standard-50s-heritage-cherry-sunburst"],
  "acoustic-guitars": productImageFallbacks["yamaha-fg830-natural"],
  "guitar-amps": productImageFallbacks["fender-mustang-lt25"],
  "pedals-effects": productImageFallbacks["fender-player-ii-stratocaster-hss-black"],
  bass: productImageFallbacks["ibanez-sr300e-iron-pewter"],
  "bass-guitars": productImageFallbacks["ibanez-sr300e-iron-pewter"],
  "bass-amps": productImageFallbacks["fender-rumble-100-v3"],
  drums: productImageFallbacks["yamaha-stage-custom-birch-5-piece-shell-pack-honey-amber"],
  "acoustic-drums":
    productImageFallbacks["yamaha-stage-custom-birch-5-piece-shell-pack-honey-amber"],
  "electronic-drums": productImageFallbacks["roland-td-17kvx2-v-drums-kit"],
  cymbals: productImageFallbacks["yamaha-stage-custom-birch-5-piece-shell-pack-honey-amber"],
  keys: productImageFallbacks["roland-fp-30x-black"],
  keyboards: productImageFallbacks["roland-fp-30x-black"],
  "digital-pianos": productImageFallbacks["yamaha-p225-black"],
  synthesizers: productImageFallbacks["korg-minilogue-xd"],
  "midi-keyboards": productImageFallbacks["korg-microkey-air-61"],
  studio: productImageFallbacks["focusrite-scarlett-2i2-4th-gen"],
  "studio-recording": productImageFallbacks["focusrite-scarlett-2i2-4th-gen"],
  "audio-interfaces": productImageFallbacks["universal-audio-apollo-twin-x-duo"],
  "studio-microphones": productImageFallbacks["shure-sm7b"],
  "studio-monitors": productImageFallbacks["yamaha-hs8-pair"],
  "studio-headphones": productImageFallbacks["sennheiser-hd-650"],
  dj: productImageFallbacks["pioneer-dj-ddj-flx10"],
  "dj-equipment": productImageFallbacks["pioneer-dj-ddj-flx10"],
  "dj-controllers": productImageFallbacks["pioneer-dj-ddj-flx10"],
  "dj-mixers": productImageFallbacks["pioneer-dj-djm-a9"],
  live: productImageFallbacks["yamaha-dbr12-powered-speaker"],
  "pa-live-sound": productImageFallbacks["yamaha-dbr12-powered-speaker"],
  "pa-speakers": productImageFallbacks["yamaha-dbr12-powered-speaker"],
  "live-mixers": productImageFallbacks["yamaha-mg12xu-analog-mixer"],
  "powered-mixers": "https://thumbs.static-thomann.de/thumb/orig/pics/prod/285441.jpg",
  "wireless-systems": productImageFallbacks["shure-blx24-sm58-wireless-system"],
  accessories: productImageFallbacks["gibson-original-les-paul-hardshell-case"],
  cables: productImageFallbacks["fender-professional-series-cable-6m"],
  stands: productImageFallbacks["yamaha-l85-digital-piano-stand-black"],
  "cases-bags": productImageFallbacks["gibson-original-les-paul-hardshell-case"],
  deals: productImageFallbacks["fender-player-ii-stratocaster-hss-black"],
};

export function getCategoryFallbackImage(...keys: Array<string | null | undefined>) {
  for (const key of keys) {
    if (key && categoryImageFallbacks[key]) {
      return categoryImageFallbacks[key];
    }
  }

  return categoryImageFallbacks.guitars;
}

export function getProductFallbackImage(product: ProductImageSource) {
  return (
    productImageFallbacks[product.slug] ??
    getCategoryFallbackImage(product.baseCategoryId, ...product.categoryIds)
  );
}
