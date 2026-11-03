// CommonJS exports the callable directly; share its API with the ESM declarations.
import type esm from './index.js' with { "resolution-mode": "import" }

declare const nlp: typeof esm
declare namespace nlp {
  export type TypedPlugin<Methods extends object> = esm.TypedPlugin<Methods>
}

export = nlp
