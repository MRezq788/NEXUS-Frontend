import type { Config } from "@puckeditor/core";

type Props = {
  HeadingBlock: { title: string };
  HeroBlock: { heading: string; subheading: string };
};

export const config: Config<Props> = {
  components: {
    HeadingBlock: {
      fields: {
        title: { type: "text" },
      },
      defaultProps: {
        title: "Welcome to my store",
      },
      render: ({ title }) => <h2 className="text-2xl font-bold p-4">{title}</h2>,
    },
    HeroBlock: {
      fields: {
        heading: { type: "text" },
        subheading: { type: "text" },
      },
      defaultProps: {
        heading: "Featured Products",
        subheading: "Check out our latest arrivals",
      },
      render: ({ heading, subheading }) => (
        <div className="bg-gray-100 p-8 text-center rounded-lg my-4">
          <h1 className="text-4xl font-extrabold mb-2">{heading}</h1>
          <p className="text-lg text-gray-600">{subheading}</p>
        </div>
      ),
    },
  },
};