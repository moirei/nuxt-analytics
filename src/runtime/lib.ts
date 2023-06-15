import { InlineAdapter, InlineChannel } from "./types";

/**
 * Define analytics channel inline.
 *
 * @param options
 * @returns
 */
export const defineChannel = (
  options: Omit<InlineChannel, "__inline">
): InlineChannel => ({
  ...options,
  __inline: true,
});

/**
 * Define analytics adapter inline.
 *
 * @param options
 * @returns
 */
export const defineAdapter = (
  options: Omit<InlineAdapter, "__inline">
): InlineAdapter => ({
  ...options,
  __inline: true,
});

/**
 * Remove scripts defined by selectors from DOM.
 *
 * @param selectors One or more DOM selectors to match against.
 */
export const removeFromDOM = (selectors: string): void => {
  document.querySelectorAll(selectors).forEach((el: Element) => {
    el.parentElement?.removeChild(el);
  });
};
