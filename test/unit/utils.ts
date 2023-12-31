export const injectDummyScript = () => {
  /* eslint-disable */
  (function (d) {
    let h = d.getElementsByTagName("head")[0];
    var c = d.createElement("script");
    c.async = true;
    c.type = "text/javascript";
    c.charset = "utf-8";
    c.id = "dummy";
    h.appendChild(c);
  })(document);

  /* eslint-enable */
};

export const hasScript = (selector: string) => {
  const scripts = document.querySelectorAll(selector);
  return !!Array.from(scripts).length;
};
