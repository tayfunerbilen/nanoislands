## Yate
### Default select

    nb-select()

* size: m
* theme: normal
* direction: bottom

### Optional attributes
* `'size'` {string} `m / s`
* `'theme'` {string} `normal / action (yellow) / dark / pseudo`
* `'id'` {string} block@id and select@name
* `'name'` {string}
* `'direction'` {string} bottom / top — open default direction
* `'class'` {array} `['my_class1', 'my_class2']`
* `'disabled'` {boolean}
* `'maxHeight'` {Number|String} number of visible items or string value of the max-height like '10em'
* `'within'` {string} '...' - id attr of the container where listing tries to fit in (window default)
* `'items'` {array}  - each object in array could have text, value and selected fields
    * `'text'` {string} text of option
    * `'value'` {string} value of option
    * `'icon'` {string} 'three-dots'
    * `'selected'` {boolean}
    * `'separator'` {boolean}
    * `'group'` {array} - group of options, array of items in `optgroup`

#### Example

```
nb-select( {
  'size': 's'
  'id': 'select1'
  'class': 'my-sp-class'
  'attrs': {
        'name': 'my-name'
   }
  'theme': 'dark'
  'items': [
      {
          'text': 'Карта'
          'value': 'option1'
          'selected': 'true'
      }
      {
          'text': 'Спутник'
          'value': 'option2'
      }
      {
          'text': 'Гибрид'
          'value': 'option3'
      }
      {
          'text': 'Ещё'
          'value': 'option4'
          'icon': 'three-dots'
      }
        'text': 'Группа'
        'group': [
              {
                  'text': 'Супер Карта'
                  'value': 'option4'
              }
              {
                  'text': 'Супер Спутник'
                  'value': 'option5'
              }
              {
                  'text': 'Супер Гибрид'
                  'value': 'option6'
              }
        ]
    }
  ]
})
```

## JS

### Select methods

```

var select = nb.block(node);

 /**
 * Render dropdown of the select
 * @fires 'nb-rendered'
 * @returns {Object} nb.block
 */
select.render();

/**
 * Open dropdown of the select
 * @fires 'nb-opened'
 * @returns {Object} nb.block
 */
select.open();

/**
 * Close dropdown of the select
 * @fires 'nb-closed'
 * @returns {Object} nb.block
 */
select.close();
/**
 * Changes a value of control, text on the button and select value it the fallback
 *
 * @param name — event id that caused the change
 * @param params — {
     *     text: '..'
     *     value: '..'
     * }
 * @fires 'nb-changed' event with param {value, text}
 */
select.setState({
    text: 'Hello, world!',
    value: 'option1'
});

/**
 * Returns state of the select
 *
 * @return {Object} -
     * {
     *     value: '..'
     *     text: '..'
     * }
 */
select.getState();

/**
 * Get name of the select
 * @returns {String|Object} name
 */
select.getName();

/**
 * Changes a value of control, text on the button and select value it the fallback
 * @param {string} name
 * @fires 'nb-name-set'
 * @returns {Object} nb.block
 */
select.setName('Vadim');

/**
 * Set new items for select
 * @params {Array|Object} source New source
 * @fires 'nb-source-changed'
 * @returns {Object} nb.block
 */
select.setSource([{value: 'val', text: 'text'}])

/**
 * Get items from select
 * @returns {Array} source
 */
select.getSource();

/**
 * Add items to select
 * @param {Array|Object} items
 * @param {Number} index to insert
 * @fires 'nb-source-changed'
 * @returns {Object} nb.block
 */
select.addToSource([{value: 'val', text: 'text'}]);

/**
 * Remove items to select
 * @param {Array|Object|number} items or index
 * @fires 'nb-source-changed'
 * @returns {Object} nb.block
 */
select.removeFromSource();

/**
 * Disables the select
 * @fires 'nb-disabled'
 * @returns {Object} nb.block
 */
select.disable()

/**
 * Enables the select
 * @fires 'nb-enabled'
 * @returns {Object} nb.block
 */
select.enable();

/**
 * Return state of the select
 * @returns {Boolean}
 */
select.isEnabled()

/**
 * Focus the select
 * @fires 'nb-focused'
 * @returns {Object} nb.block
 */
select.focus()

/**
 * Blur the select
 * @fires 'nb-blured'
 * @returns {Object} nb.block
 */
select.blur()

/**
 * Destroy the select
 * @fires 'nb-select_destroyed'
 */
select.destroy()

```
