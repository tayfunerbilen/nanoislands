/*
 * jQuery UI Depends:
 *        jquery.ui.dialog.js
 *        jquery.ui.core.js
 *        jquery.ui.widget.js
 *        jquery.ui.button.js
 *        jquery.ui.draggable.js
 *        jquery.ui.mouse.js
 *        jquery.ui.position.js
 */

(function() {

    /**
     * @fileOverview Надстройки nb над jQueryUI
     */

    $.nb = {};

    $.widget('nb.baseDialog', $.ui.dialog, {
        options: {
            height: 'auto',
            minHeight: 'auto',
            width: 'auto'
        },
        open: function() {
            this._super();
            var that = this;

            if (that.options.autoclose) {
                this._onmousedown = function(e) {
                    that.options.closedByOuterClick = true;
                    // e.which === 3 -> right mouse button
                    // e.which === 2 -> middle (wheel) mouse button
                    if (e.which === 2 || e.which === 3) {
                        return;
                    }

                    if ($.contains(that.uiDialog[0], e.target)) {
                        return;
                    }

                    that.close();
                };

                this.document.on('mousedown', this._onmousedown);
                this.document.on('touchstart', this._onmousedown);
            }

            if (this.options.position.fixed) {
                this._onresize = $.proxy(this._position, this, true);
                this.window.on('resize', this._onresize);
            }


            this._onpopupclose = nb.on('popup-close', function() {
                if (that.options.autoclose) {
                    that.close();
                }
            });
        },
        close: function() {
            this._super();
            this.document.off('mousedown', this._onmousedown);
            this.document.off('touchstart', this._onmousedown);

            if (this._onresize) {
                this.window.off('resize', this._onresize);
            }

            nb.off('popup-close', this._onpopupclose);
        },
        _create: function() {
            this.options.dialogClass += _getUIDialogExtraClass.call(this);
            this.options.dialogClass += (this.options.position.fixed) ? ' ui-dialog-fixed' : '';
            this._super();
            this.element[0].widget = this;
        },
        _destroy: function() {
            this._super();
            delete this.element[0].widget;
        },
        _position: function() {
            var that = this;
            var using = this.options.position.using;

            // Перестановка базового опорного свойства.
            this.options.position.using = function(props, ui) {
                var position = $.extend({}, props);
                var width;
                var height;

                if (ui.vertical == 'bottom') {
                    height = that.window.height();

                    position.bottom = height - (position.top + ui.element.height);
                    position.top = 'auto';
                }

                if (ui.horizontal == 'right') {
                    width = that.window.width();

                    position.right = width - (position.left + ui.element.width);
                    position.left = 'auto';
                }

                return using.call(ui.element.element[0], position, ui);
            };

            this._super();

            this.options.position.using = using;
        },
        _createTitlebar: function() {
            this.uiDialogTitlebarClose = $();
        }
    });

    // диалог с хвостиком
    $.widget('nb.contextDialog', $.nb.baseDialog, {

        tailOffset: 13,

        options: {
            tail: 'center',
            height: 'auto',
            minHeight: 'auto',
            width: 'auto',
            show: {
                effect: 'nb',
                duration: 150
            },
            hide: {
                effect: 'nb',
                duration: 150
            },
            draggable: false,
            resizable: false,
            dialogClass: '_nb-popup-outer ui-dialog-no-close',
            position: {
                my: 'center top',
                at: 'center bottom',
                // horizontal: fit, пытаемся уместить в window
                // vertical: flip - выбирает наилучший вариант - вверх или вних
                collision: "fit flip"
            }
        },

        _create: function() {
            this._super();
            this.$tail = $('<div class="_nb-popup-tail"><i/></div>');

            //TODO: проверить, что вызывается один раз
            this.$tail.prependTo(this.uiDialog);
        },
        _position: function(noEffect) {
            var that = this;
            var using = this.options.position.using;

            // При повторном позиционировании попапа без его скрытия
            // не произойдет вызова эффекта `nb`. Поэтому нет необходимости
            // дополнительно смещать попап, чтобы обеспечить простор для
            // анимации.
            var offsetMultiplier = noEffect ? 1 : 2;

            // Позиционирование хвостика попапа, заданное в CSS.
            var defaultTailPosition = {
                top: '',
                left: '',
                right: '',
                bottom: ''
            };

            this.options.position.using = function(props, ui) {
                var $el = ui.element.element;
                var el = $el[0];

                // Определение направления хвостика.
                var tailDirection = _getPopupTailDirection(ui.target, ui.element);
                var direction = _getInverseDirection(tailDirection);
                var targetCenter = _getElementCenter(ui.target);

                nb.node.setMod(el, '_nb-popup_to', direction);
                $el.data('nb-tail-dir', direction);

                // Позиционирование хвостика вдоль попапа, необходимо для того,
                // чтобы хвостик указывал на центр целевого элемента.
                if (_isDirectionVertical(tailDirection)) {
                    that.$tail.css($.extend(defaultTailPosition, {
                        left: Math.abs(targetCenter.x - ui.element.left) / ui.element.width * 100 + '%'
                    }));
                } else {
                    that.$tail.css($.extend(defaultTailPosition, {
                        top: Math.abs(targetCenter.y - ui.element.top) / ui.element.height * 100 + '%'
                    }));
                }

                props[tailDirection] += (that.tailOffset * offsetMultiplier);

                return using.call(el, props, ui);
            };

            this._super();

            this.options.position.using = using;
        }
    });

    jQuery.effects.effect.nb = function(o, done) {
        var $this = $(this);
        var mode = $.effects.setMode($this, o.mode || "hide");
        var tailDir = $this.data('nb-tail-dir');

        var res = {
            show: {
                'bottom': {
                    opacity: 1,
                    top: '-=' + $.nb.contextDialog.prototype.tailOffset
                },
                'top': {
                    opacity: 1,
                    bottom: '-=' + $.nb.contextDialog.prototype.tailOffset
                },
                'left': {
                    opacity: 1,
                    right: '-=' + $.nb.contextDialog.prototype.tailOffset
                },
                'right': {
                    opacity: 1,
                    left: '-=' + $.nb.contextDialog.prototype.tailOffset
                }
            },
            hide: {
                'bottom': {
                    opacity: 0,
                    top: '+=' + $.nb.contextDialog.prototype.tailOffset
                },
                'top': {
                    opacity: 0,
                    bottom: '+=' + $.nb.contextDialog.prototype.tailOffset
                },
                'left': {
                    opacity: 0,
                    right: '+=' + $.nb.contextDialog.prototype.tailOffset
                },
                'right': {
                    opacity: 0,
                    left: '+=' + $.nb.contextDialog.prototype.tailOffset
                }
            }
        };

        if (mode == 'show') {
            $this.show();
        }

        $this.animate(res[mode][tailDir], {
            queue: false,
            duration: o.duration,
            easing: o.easing,
            complete: function() {
                if (mode == 'hide') {
                    $this.hide();
                }
                done();
            }
        });
    };

    /**
     * Вычисляет направление хвостика попапа, принимая во внимание положение
     * и размер обоих элементов.
     *
     * Сперва для каждого элемента вычисляются координаты вершин опоясывающего
     * прямоугольника. После этого, для каждой внешней полуплоскости,
     * образованной сторонами прямоугольника целевого элемента (т.н. тогглера)
     * проверяется попадание вершин прямоугольника попапа.
     *
     * @param  {Object} targetDimensions Положение и измерения элемента, на который указывает попап
     * @param  {Object} popupDimensions  Положение и измерения попапа
     * @return {String} top|right|bottom|left
     */
    function _getPopupTailDirection(targetDimensions, popupDimensions) {
        var p = _getBoundingRectangle(popupDimensions);
        var t = _getBoundingRectangle(targetDimensions);

        // Проверка полуплоскости вверх от целевого элемента.
        if (p[0].y <= t[0].y && p[1].y <= t[0].y) {
            return 'bottom';
        }

        // Проверка полуплоскости вправо от целевого элемента.
        if (p[0].x >= t[1].x && p[1].x >= t[1].x) {
            return 'left';
        }

        // Проверка полуплоскости вниз от целевого элемента.
        if (p[0].y >= t[1].y && p[1].y >= t[1].y) {
            return 'top';
        }

        // В оставшихся случаях попап лежит слева от тогглера.
        return 'right';
    }

    /**
     * Рассчитывает координату центра прямоугольника на основе значений
     * `left`, `top`, `width`, `height`.
     * @param  {Object} d
     * @return {Object}
     */
    function _getElementCenter(d) {
        return {
            x: d.left + (d.width / 2),
            y: d.top + (d.height / 2)
        };
    }

    /**
     * Возвращает координаты левой верхней и правой нижней вершин прямоугольника,
     * из значений `top`, `left`, `width` и `height`:
     *
     *     {
     *         top: 20,
     *         left: 25,
     *         width: 50,
     *         height: 20
     *     }
     *
     * в
     *
     *     [
     *         {
     *             x: 25,
     *             y: 20
     *         },
     *         {
     *             x: 75,
     *             y: 70
     *         }
     *     ]
     *
     * @param  {Object} d
     * @return {Object}
     */
    function _getBoundingRectangle(d) {
        return [
            {
                x: d.left,
                y: d.top
            },
            {
                x: d.left + d.width,
                y: d.top + d.height
            }
        ];
    }

    /**
     * Возвращает строковое представление противоположного направления,
     * например `top` -> `bottom`.
     * @param  {String} direction
     * @return {String}
     */
    function _getInverseDirection(direction) {
        var inversion = {
            top: 'bottom',
            bottom: 'top',
            left: 'right',
            right: 'left'
        };

        return inversion[direction];
    }

    function _isDirectionVertical(direction) {
        return  direction === 'top' || direction === 'bottom';
    }

    /**
     *  Функция возвращает строку с модификаторами
     *  для обертки попапа, которую добавляет jquery ui,
     *  в соответсвии с модификаторами самого попапа
     *
     *  Например, для попапа заданы классы-модификаторы nb-popup_mod и nb-popup_another-mod,
     *  функция вернет строку 'nb-popup-outer_mod nb-popup-outer_another-mod'
     *
     */
    function _getUIDialogExtraClass() {
        var popupClasses = this.element.attr('class').split(' ') || [];
        // не матчимся на _ в начале слова
        // иначе это глобальный класс,
        // не мачимся на __, чтобы ислючить элемент
        var modRe = /\w+\_(?!_)/;
        var uiDialogClasses;

        uiDialogClasses = $.map(popupClasses, function(item) {
            var parts = item.split(modRe);
            var l = parts.length;
            var modifier = parts.pop();
            var newClass = '';

            // в массиве должно быть больше 1 элемента
            // иначе модификатора не было
            if (l > 1) {
                newClass = '_nb-popup-outer_' + modifier;
            }

            return newClass;
        });

        return uiDialogClasses.join(' ');
    }


    nb.define('popup', {

        events: {
            'click ._nb-popup-close': 'close',
            'position': 'onposition'
        },

        // ----------------------------------------------------------------------------------------------------------------- //
        oninit: function() {
            var that = this;
            var data = this.nbdata();

            if ('modal' in data) {
                this.modal = true;
            }

            this.$menu = this.$node.find('._nb-popup-menu');

            if (this.$menu.length) {
                this.$menu.menu({
                    select: function(event, ui) {
                        that.trigger('nb-select', {
                            event: event,
                            ui: ui
                        });
                    }
                });
            }

            // Храним исходное положение попапа, чтобы возвращать его на место
            var previous = this.node.previousSibling;
            this._home = previous ? { previous: previous } : { parent: this.node.parentNode };
        },

        onposition: function(e, params) {
            var where = params.where;
            var how = params.how;
            this._move(where, how, params);
        },


        /**
         *
         * @param {Object} params
         */
        open: function(params) {
            var where = params.where;
            var how = params.how;
            //  Специальный флаг-костыль.
            //  Если он true, то это значит, что мы только что передвинули открытый попап в другое место
            //  и его не нужно закрывать на клик.
            this.moved = false;

            if (this.where) {
                //  Попап уже открыт
                //  FIXME: Буэээ. Уродливое условие для варианта, когда заданы координаты вместо ноды.
                if (where === this.where || ( (where instanceof Array) && where[0] === this.where[0] && where[1] === this.where[1] )) {
                    //  На той же ноде. Значит закрываем его.
                    this.close();
                } else {
                    this.moved = true;
                    //  На другой ноде. Передвигаем его в нужное место.
                    this._move(where, how, params);
                }
            } else {
                //  Попап закрыт. Будем открывать.

                $(this.node).removeClass('_nb-is-hidden');
                //  Передвигаем попап.
                this._move(where, how, params);
                this.trigger('nb-opened');
            }
            return this;
        },

        close: function() {

            //  Снимаем флаг о том, что попап открыт.
            this.where = null;

            if (this.isOpen()) {
                this.node.widget.close();
                this.trigger('nb-closed');
            }

            // if popup closed by document click we also should fire event
            if (this.node && this.node.widget && this.node.widget.options.closedByOuterClick) {
                this.node.widget.options.closedByOuterClick = false;
                this.trigger('nb-closed');
            }

            return this;
        },

        isOpen: function() {
            return this.node && this.node.widget && this.node.widget.isOpen();
        },

        destroy: function() {
            if (this.node && this.node.widget) {
                this.node.widget.destroy();
            }

            this.trigger('nb-destroyed', this);
            this.nbdestroy();
        },

        // ----------------------------------------------------------------------------------------------------------------- //

        _move: function(where, how, params) {
            //  Запоминаем, на какой ноде мы открываем попап.
            this.where = where;
            var that = this;

            var data = this.nbdata();
            // по умолчанию попап позиционирова абсолютно
            var isFixed = false;

            // сделаем попап фиксированным, если
            // у popup-toggler задан how.fixed = true
            if (how && how.fixed) {
                isFixed = true;
            }
            // или если был задан атрибут data-nb-how = 'fixed'
            // в настройках самого попапа
            if (data.how == 'fixed') {
                isFixed = true;
            }

            var using = function(props) {
                var $el = $(this);

                if (params.animate) {
                    $el.stop().animate(props, {
                        duration: 'fast',
                        queue: false,
                        complete: $.proxy(that.trigger, that, 'position.complete')
                    });
                } else {
                    $el.css(props);
                }
            };

            how = how || {};

            //  Модальный попап двигать не нужно.
            if (this.modal) {
                $(this.node).baseDialog({
                    height: data.height,
                    minHeight: data.minheight,
                    width: data.width,
                    show: 'fade',
                    hide: 'fade',
                    modal: true,
                    resizable: false,
                    draggable: false,
                    dialogClass: '_nb-popup-outer ui-dialog-fixed',
                    close: function() {
                        that.close();
                    },
                    appendTo: params.appendTo,
                    position: {
                        using: using
                    },
                    autoclose: typeof how.autoclose !== 'undefined' ? how.autoclose : false
                });

                return;
            }


            $(this.node).contextDialog({
                tail: data.tail,
                position: {
                    // где попап
                    at: (how.at ? how.at : 'center bottom'),// + ' center',
                    // где ссылка, которая открыла попап
                    my: (how.my ? how.my : 'center top'),// + ' center',
                    fixed: isFixed,
                    of: $(this.where),
                    // horizontal: fit, пытаемся уместить в window
                    // vertical: flip - выбирает наилучший вариант - вверх или вних
                    collision: (how.collision ? how.collision : 'fit flip'),
                    using: using
                },
                close: function() {
                    that.close();
                },
                appendTo: params.appendTo,
                autoclose: typeof how.autoclose !== 'undefined' ? how.autoclose : true
            });
        }
    }, 'base');
})();

// ----------------------------------------------------------------------------------------------------------------- //

nb.define('popup-toggler', {

    events: {
        'click': 'open'
    },

    oninit: function() {
        this.data = this.nbdata()['popup-toggler'];
        this.popup = nb.find(this.data['id']);
        this.options = {
            //  Относительно чего позиционировать попап.
            //  Если заданы точные координаты в `data.where`, то по ним.
            //  Иначе относительно ноды этого блока.
            where: this.data.where || this.node,

            //  Как позиционировать попап.
            how: this.data.how,

            // Куда его вставлять
            appendTo: this.data.appendTo
        };
        this.trigger('nb-inited', this);
    },

    /**
     * Open popup
     * @fires 'nb-opened'
     * @returns {Object} nb.block
     */
    open: function(evt) {
        if (evt) {
            evt.preventDefault();
        }
        if (!this.$node.hasClass('_nb-is-disabled') && this.popup) {
            this.popup.open(this.options);
            this.trigger('nb-opened', this);
        }
        return this;
    },

    /**
     * Close popup
     * @fires 'nb-closed'
     * @returns {Object} nb.block
     */
    close: function() {
        if (!this.$node.hasClass('_nb-is-disabled') && this.popup) {
            this.popup.close();
            this.trigger('nb-closed', this);
        }
        return this;
    },

    /**
     * Returns connected popup
     * @returns {Object} nb.block
     */
    getPopup: function() {
        return this.popup;
    },

    /**
     * Sets connected popup
     * @param {Object} params  - {
    *       id : 'id' — popupID or link to nb.block
    *       where: '#elem' — to what elem popup attached
    *       how: { my: 'left', at:'right' } — to to open popup
    *   }
     * @returns {Object} nb.block
     */
    setPopup: function(params) {
        if (typeof params === 'string') {
            var obj = {};
            obj.popup = params;
            params = obj;
        }

        if (arguments.length === 1 && typeof params === 'object' && params.popup) {
            var id = params.popup;
            delete params.popup;

            if (params.where) {
                this.options = params;
            }

            if (typeof id === 'string') {
                this.popup = nb.find(id);
            } else {
                this.popup = id;
            }
            this.trigger('nb-popup-set', this);
        }
        return this;
    },

    /**
     * Get connected popup  option
     * @returns {Object} options
     */
    getOptions: function() {
        return this.options;
    },

    /**
     * Sets connected popup options
     * @param {Object} params - {
    *       where: '#elem' — to what elem popup attached
    *       how: { my: 'left', at:'right' } — to to open popup
    *   }
     * @returns {Object} nb.block
     */
    setOptions: function(params) {
        if (arguments.length === 1 && typeof params === 'object') {
            this.options = params;
            this.trigger('nb-options-set', this);
        }
        return this;
    },

    /**
     * Destroy the popup toggler
     * @fires 'nb-destroyed'
     */
    destroy: function() {
        this.nbdestroy();
    }

}, 'base');
