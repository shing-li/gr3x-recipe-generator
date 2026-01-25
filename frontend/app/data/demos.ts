// 此檔案用於管理 Demo Tab 的展示內容
// 使用方式：
// 1. 將照片放入 frontend/public/demo/ 資料夾
// 2. 在下方陣列中新增物件，設定 image 路徑與對應的 recipe JSON

export interface DemoItem {
  id: string;
  title: string;
  image: string;      // 圖片路徑，例如 "/demo/my_photo.jpg"
  description?: string;
  recipe: any;        // 完整的 RecipeResponse 物件
}

export const DEMO_RECIPES: DemoItem[] = [
  {
    id: "demo-1",
    title: "Fuji negative",
    image: "/demo/fuji_neg.JPG", // 請確保 frontend/public/demo/demo1.jpg 存在
    description: "模擬富士：Classic Neg. (經典負片)  色彩特色： * 高對比、強色偏： 高光區域會帶有淡淡的淺綠色，而陰影區域則會呈現**洋紅（暖紅）**調。 獨特的紅與綠： 綠色會變得深沉且略微發黃，紅色則會帶有一種陳舊的暗棕感。 適合氛圍： * 懷舊與故事感： 適合表現「歲月感」或「記憶中的生活」。 戲劇性： 由於對比度強，能讓平凡的物品顯得具有電影感。",
    recipe: {
      vibe_match: "Fujifilm Classic Neg. Simulation (Vintage Storytelling)",
      base_mode: "Negative Film",
      global_settings: {
        exposure_recommendation: "-0.7 EV",
        wb_setting: "Cloudy (6000K)",
        wb_shift_a: 4,
        wb_shift_g: 2,
        hdf_recommendation: "OFF"
      },
      parameters: {
        saturation: -2,
        hue: -1,
        high_low_key: -2,
        contrast: 3,
        contrast_highlight: 1,
        contrast_shadow: -3,
        sharpness: 1,
        shading: -2,
        clarity: 1
      },
      note: "Uses Negative Film as the base for its cinematic curve. WB is set to Cloudy with a strong Amber/Green shift (A4, G2) to replicate the signature 'pale green highlights' and 'brownish vintage reds'. High contrast (+3) and crushed shadows (-3) mimic the hard, dramatic tonality of Classic Neg, while underexposure (-0.7) deepens the colors for that 'aged memory' feel."
    }
  },
  {
    id: "demo-2",
    title: "Conon Portrait",
    image: "/demo/canon_people.JPG", // 請確保 frontend/public/demo/demo2.jpg 存在
    description: "Canon Classic Portrait (Ruddy/Pink Skin)",
    recipe: {
      vibe_match: "Canon Classic Portrait (Ruddy/Pink Skin)",
      base_mode: "Positive Film",
      global_settings: {
        exposure_recommendation: "+0.3 to +0.7 EV",
        wb_setting: "Multi-Pattern Auto",
        wb_shift_a: 3,
        wb_shift_g: -2,
        hdf_recommendation: "ON"
      },
      parameters: {
        saturation: -1,
        hue: -2,
        high_low_key: 3,
        contrast: -1,
        contrast_highlight: -3,
        contrast_shadow: 1,
        sharpness: -1,
        shading: 0,
        clarity: -2
      },
      note: "Designed to mimic Canon's famous color science for portraits. 'Positive Film' provides the rich color depth, while shifting Hue to negative (-2) introduces the signature ruddy/pinkish skin tones (Magenta shift). High Key (+3) and Exposure (+0.3) ensure the skin looks bright and porcelain-like. HDF and negative Clarity (-2) soften the skin texture, removing the digital sharpness for a flattering, organic look."
    }
  },
  {
    id: "demo-3",
    title: "Ricoh Positive",
    image: "/demo/ricoh_posi.JPG", // 請確保 frontend/public/demo/demo3.jpg 存在
    description: "能最大程度呈現理光藍的特色，拍天氣好的戶外風景",
    recipe: {
      vibe_match: "Ultimate Ricoh Blue Landscape",
      base_mode: "Positive Film",
      global_settings: {
        exposure_recommendation: "-0.3 EV",
        wb_setting: "Daylight (5200K)",
        wb_shift_a: -2,
        wb_shift_g: -1,
        hdf_recommendation: "OFF"
      },
      parameters: {
        saturation: 3,
        hue: -1,
        high_low_key: -1,
        contrast: 1,
        contrast_highlight: -2,
        contrast_shadow: -1,
        sharpness: 2,
        shading: -1,
        clarity: 1
      },
      note: "Uses Positive Film as the foundation for the signature 'Ricoh Blue'. High saturation (+3) and a slight cool/magenta WB shift (A:-2, G:-1) deepen the sky. Underexposing (-0.3 EV) combined with negative Shading (-1) and High/Low Key (-1) creates rich, dense colors. HDF is OFF to maintain landscape sharpness."
    }
  },
  {
    id: "demo-4",
    title: "Ricoh air",
    image: "/demo/ricoh_air.JPG", // 請確保 frontend/public/demo/demo3.jpg 存在
    description: "日系朦朧美，拍女生皮膚白",
    recipe: {
      vibe_match: "Japanese Hazy Portrait (Airy & Bright)",
      base_mode: "Negative Film",
      global_settings: {
        exposure_recommendation: "+0.3 to +0.7 EV",
        wb_setting: "Auto White Balance (AWB)",
        wb_shift_a: -2,
        wb_shift_g: 1,
        hdf_recommendation: "ON"
      },
      parameters: {
        saturation: -1,
        hue: -1,
        high_low_key: 3,
        contrast: -2,
        contrast_highlight: -4,
        contrast_shadow: 2,
        sharpness: -2,
        shading: 0,
        clarity: -3
      },
      note: "Designed for the 'Japanese Airy' aesthetic. HDF ON combined with low Clarity (-3) creates the dreamy 'hazy' effect. High Key (+3) and lifted Shadows (+2) ensure the skin looks fair and porcelain-like by eliminating harsh darks. Negative Film provides the base nostalgic color, while the WB shift (Blue/Magenta direction) counteracts yellow casts to keep skin tones clean."
    }
  }
];
