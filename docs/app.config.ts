export default defineAppConfig({
  docus: {
    title: "nuxt-analytics",
    description: "A Nuxt library for tracking app events.",
    image: "/cover.jpg",
    socials: {
      github: "moirei/nuxt-analytics",
    },
    github: {
      dir: ".starters/default/content",
      branch: "master",
      repo: "nuxt-analytics",
      owner: "moirei",
      edit: false,
    },
    aside: {
      level: 0,
      collapsed: false,
      // exclude: [],
    },
    main: {
      padded: true,
      fluid: true,
    },
    header: {
      title: "Nuxt Apollo",
      logo: true,
      // showLinkIcon: true,
      // exclude: [],
      // fluid: true
    },
    footer: {
      iconLinks: [
        {
          href: "https://nuxt.com",
          icon: "simple-icons:nuxtdotjs",
        },
      ],
    },
  },
});
