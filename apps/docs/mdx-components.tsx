import defaultComponents from "fumadocs-ui/mdx";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import type { MDXComponents } from "mdx/types";
import { Playground } from "@/components/Playground";

/** Merge Fumadocs defaults with our custom MDX components (live Playground). */
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultComponents,
    Playground,
    Tab,
    Tabs,
    ...components,
  };
}
