import { EcommerceEvent } from "../events/EcommerceEvent";
import { EventProperties } from "../types";
import { get, getAny } from "../utils";
import BaseAdapter from "./BaseAdapter";

/**
 * Basic example adapter for mapping Facebook Pixel
 * compatible data
 */
export class FacebookAdapter extends BaseAdapter {
  /**
   * {@inheritdoc}
   */
  protected $channels = ["facebook"];

  /**
   * {@inheritdoc}
   */
  public only() {
    return [
      EcommerceEvent.AddToCart,
      EcommerceEvent.InitiateCheckout,
      EcommerceEvent.Purchase,
      EcommerceEvent.ProgressCheckout,
      EcommerceEvent.Search,
      EcommerceEvent.ViewContent,
      EcommerceEvent.ClickContent,
      EcommerceEvent.Registration,
    ];
  }

  /**
   * Configure adapter
   */
  public configure() {
    this.mapEventName(EcommerceEvent.AddToCart, "AddToCart");
    this.mapEventName(EcommerceEvent.InitiateCheckout, "InitiateCheckout");
    this.mapEventName(EcommerceEvent.ProgressCheckout, "ProgressCheckout");
    this.mapEventName(EcommerceEvent.ViewContent, "ViewContent");
    this.mapEventName(EcommerceEvent.ClickContent, "SelectContent");
    this.mapEventName(EcommerceEvent.Registration, "CompleteRegistration");

    this.mapEventProperty(EcommerceEvent.AddToCart, (payload) => {
      return this.getActionData(payload.props);
    });

    this.mapEventProperty(EcommerceEvent.InitiateCheckout, (payload) => {
      const data = this.getActionData(payload.props);

      return {
        ...data,
        num_items: Object.keys(get(data, "content_ids")).length,
      };
    });

    this.mapEventProperty(EcommerceEvent.Search, (payload) => {
      const data = this.getActionData(payload.props);

      return {
        ...data,
        search_string: getAny(payload.props, [
          "search_string",
          "searchString",
          "search_term",
          "searchTerm",
          "term",
        ]),
      };
    });

    this.mapEventProperty(EcommerceEvent.Registration, (payload) => {
      return {
        content_name: get(payload.props, "name"),
        currency: getAny(payload.props, [
          "currency_code",
          "currencyCode",
          "currency",
        ]),
        status: get(payload.props, "status"),
        value: getAny(payload.props, ["total", "price", "value"]),
        predicted_ltv: getAny(payload.props, ["predicted_ltv", "ltv"]),
      };
    });
  }

  protected getActionData(properties?: EventProperties) {
    const contents = getAny<any[]>(properties, ["items", "contents"], []);

    return {
      content_ids: contents
        .map((content) => get(content, "id"))
        .filter((id) => !!id),
      content_name: get(properties, "name"),
      content_type: getAny(
        properties,
        ["type", "content_type", "contentType"],
        "product"
      ),
      content_category: get(properties, "category"),
      contents: contents,
      currency: getAny(properties, [
        "currency_code",
        "currencyCode",
        "currency",
      ]),
      value: getAny(properties, ["total", "price", "value"]),
    };
  }
}
