class CartNotification extends HTMLElement {
  constructor() {
    super();

    this.notification = document.getElementById('cart-notification');
    this.header = document.querySelector('sticky-header');
    this.onBodyClick = this.handleBodyClick.bind(this);

    this.notification.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());
    this.querySelectorAll('button[type="button"]').forEach((closeButton) =>
      closeButton.addEventListener('click', this.close.bind(this))
    );
  }

  open() {
    this.notification.classList.add('animate', 'active');

    this.notification.addEventListener(
      'transitionend',
      () => {
        this.notification.focus();
        trapFocus(this.notification);
      },
      { once: true }
    );

    document.body.addEventListener('click', this.onBodyClick);
  }

  close() {
    this.notification.classList.remove('active');
    document.body.removeEventListener('click', this.onBodyClick);

    removeTrapFocus(this.activeElement);
  }

  // Replace or Insert the rendered HTML response from shopify by section storefront api regarding to section id.
  renderContents(parsedState, showCart, bundleItem) {
    this.cartItemKey = parsedState.key;
    this.getSectionsToRender().forEach((section) => {
      if (showCart == true) {
        document.getElementById(section.id).innerHTML = this.getSectionInnerHTML(
          parsedState.sections[section.id],
          section.selector
        );
      } else {
        if (section.id == 'cart-notification-product') {
          document.getElementById(section.id).insertAdjacentHTML('beforeend', this.getSectionInnerHTML(
            parsedState.sections[section.id],
            section.selector
          ));
        } else {
          document.getElementById(section.id).innerHTML = this.getSectionInnerHTML(
            parsedState.sections[section.id],
            section.selector
          );
        }
      }      
    });

    if (this.header) this.header.reveal();
    if (showCart) {
      if (!bundleItem) {
        this.open();
      }
    } else {
      if (bundleItem) {
        this.open();
      }
    }
  }

  getSectionsToRender() {
    return [
      {
        id: 'cart-notification-product',
        selector: `[id="cart-notification-product-${this.cartItemKey}"]`,
      },
      {
        id: 'cart-notification-button',
      },
      {
        id: 'cart-icon-bubble',
      },
    ];
  }

  getSectionInnerHTML(html, selector = '.shopify-section') {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
  }

  handleBodyClick(evt) {
    const target = evt.target;
    if (target !== this.notification && !target.closest('cart-notification')) {
      const disclosure = target.closest('details-disclosure, header-menu');
      this.activeElement = disclosure ? disclosure.querySelector('summary') : null;
      this.close();
    }
  }

  setActiveElement(element) {
    this.activeElement = element;
  }
}

customElements.define('cart-notification', CartNotification);
