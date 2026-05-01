// =========================================================
// api.ts — data fetching, shared across pages
// =========================================================
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const IMAGE_BASE = '../assets/';
const DATA_URL = '../assets/data.json';
export function fetchProducts() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(DATA_URL);
        if (!response.ok)
            throw new Error(`Failed to fetch products: ${response.status}`);
        const json = yield response.json();
        return json.data.map((p) => (Object.assign(Object.assign({}, p), { imageUrl: IMAGE_BASE + p.imageUrl })));
    });
}
