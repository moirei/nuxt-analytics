import { EcommerceEvent } from "../events/EcommerceEvent";
import { EventPayload, EventProperties } from "../types";
import { get, getAny } from "../utils";
import BaseAdapter from "./BaseAdapter";

/**
 * Basic example adapter for mapping Google Analytics
 * compatible data
 */
export default class GaAdapter extends BaseAdapter {
  /**
   * {@inheritdoc}
   */
  protected $channels = ["ga"];

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
      EcommerceEvent.RemoveFromCart,
    ];
  }

  /**
   * Configure adapter
   */
  public configure() {
    this.mapEventName(EcommerceEvent.AddToCart, "add_to_cart");
    this.mapEventName(EcommerceEvent.InitiateCheckout, "begin_checkout");
    this.mapEventName(EcommerceEvent.Purchase, "purchase");
    this.mapEventName(EcommerceEvent.ProgressCheckout, "checkout_progress");
    this.mapEventName(EcommerceEvent.ViewContent, "view_item");
    this.mapEventName(EcommerceEvent.ClickContent, "select_content");
    this.mapEventName(EcommerceEvent.Search, "search");
    this.mapEventName(EcommerceEvent.RemoveFromCart, "remove_from_cart");
  }

  /**
   * {@inheritdoc}
   */
  public eventPropertiesAs(payload: EventPayload) {
    return payload.props ? this.getActionData(payload.props) : {};
  }

  protected getActionData(properties: EventProperties): EventProperties {
    return {
      id: getAny(properties, ["id", "transaction_id", "transactionId"]),
      affiliation: get(properties, "affiliation"),
      value: getAny(properties, ["total", "price", "value"]),
      currency: getAny(properties, [
        "currency_code",
        "currencyCode",
        "currency",
      ]),
      tax: get(properties, "tax"),
      shipping: get(properties, "shipping"),
      checkout_step: getAny(properties, ["checkout_step", "checkoutStep"]),
      checkout_option: getAny(properties, [
        "checkout_option",
        "checkoutOption",
      ]),
      items: get<any[]>(properties, "items", []).map((item) =>
        this.getActionData(item)
      ),
    };
  }
}
