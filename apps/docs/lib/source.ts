import { docs } from "@/.source";
import { loader } from "fumadocs-core/source";

/** The Fumadocs content source, generated from `content/docs`. */
export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
});
