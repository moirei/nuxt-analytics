import {
  SpyInstance,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import Hotjar from "../../src/runtime/channels/Hotjar";

describe("hotjar [channel]", () => {
  let channel: Hotjar;
  let config: any;
  let hjSpy: SpyInstance;

  beforeEach(async () => {
    config = {
      siteId: 123,
    };
    channel = new Hotjar("hj", config);

    await channel.install();

    hjSpy = vi.spyOn(window, "hj").mockImplementation(() => {
      return true;
    });
  });

  afterEach(async () => {
    await channel.uninstall();
  });

  it("expects identify to call Hotjar with the right arguments", async () => {
    const attributes = {
      name: "John doe",
      email: "johndoe@email.com",
    };

    const user = {
      id: "12345678",
      ...attributes,
    };

    await channel.identify({
      user,
    });

    expect(hjSpy).toHaveBeenCalledWith("identify", user.id, attributes);
  });

  it("expects track to call Hotjar with the right arguments", async () => {
    await channel.track({
      event: "page_viewed",
    });

    expect(hjSpy).toHaveBeenCalledWith("event", "page_viewed");
  });

  it("expects page to call Hotjar with the right arguments", async () => {
    const props = {
      k: "v",
    };
    await channel.page({
      props,
    });

    await channel.page({});

    expect(hjSpy).toHaveBeenNthCalledWith(1, "event", "page_viewed", props);
    expect(hjSpy).toHaveBeenNthCalledWith(2, "event", "page_viewed");
  });
});
