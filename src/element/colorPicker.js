import clickOutSide from '../utils/clickoutside';
import Color from '../utils/color';
import draggable from '../utils/draggable';

export default {
  init: function ($, componentName) {
    function ColorPicker ($el, options) {
      this.$el = $el;
      this.options = options;
      this.color = new Color({
        enableAlpha: options.showAlpha,
        format: options.colorFormat
      });
    }

    ColorPicker.prototype = {
      constructor: ColorPicker,
      init: function () {
        var that = this,
          options = this.options;
        this.$trigger = $('<div class="el-color-picker__trigger"><span class="el-color-picker__color"></span>' +
          '<span class="el-color-picker__icon el-icon-arrow-down"></span></div>');
        this.$colorInner = $('<span class="el-color-picker__color-inner" style="background-color: transparent;"></span>');
        this.$empty = $('<span class="el-color-picker__empty el-icon-close"></span>');
        this.$trigger.find('.el-color-picker__color').append(this.$colorInner, this.$empty);
        this.$colorDropdown = $('<div class="el-color-dropdown el-color-picker__panel" style="transform-origin: center top;' +
          ' z-index: 2069; position: absolute; left: 50%; transform: translateX(-50%); display: none;" x-placement="bottom"></div>');
        this.$wrapper = $('  <div class="el-color-dropdown__main-wrapper"><div class="el-color-hue-slider is-vertical" style="float: right;">' +
          '      <div class="el-color-hue-slider__bar"></div>' +
          '      <div class="el-color-hue-slider__thumb" style="left: 0px; top: 104px;"></div>' +
          '    </div>' +
          '    <div class="el-color-svpanel" style="background-color: rgb(0, 125, 255);">' +
          '      <div class="el-color-svpanel__white"></div><div class="el-color-svpanel__black"></div>' +
          '      <div class="el-color-svpanel__cursor" style="top: 0px; left: 0px;"><div></div></div>' +
          '    </div>' +
          '  </div>');
        this.$btns = $('<div class="el-color-dropdown__btns"><span class="el-color-dropdown__value"><div class="el-input el-input--mini">' +
          '      <input type="text" autocomplete="off" class="el-input__inner"><!----><!----><!----></div></span>\n' +
          '    <button type="button" class="el-button el-color-dropdown__link-btn el-button--text el-button--mini">清空</button>' +
          '    <button type="button" class="el-button el-color-dropdown__btn el-button--default el-button--mini is-plain">确定</button>\n' +
          '  </div>');
        this.$colorDropdown.append(this.$wrapper, this.$btns);
        this.$el.addClass('el-color-picker').append(this.$trigger, this.$colorDropdown).on('click', function (e) {
          if ($(e.target).parent().is(that.$trigger)) {
            that._show ? that.hide() : that.show();
          }
          e.stopPropagation();
        });
        clickOutSide.bind(function (e) {
          return !$(e.target).parents().is(that.$el);
        }, function () {
          that.hide();
        });
        this.dragThumb();
        this.dragSV();
      },
      dragSV: function () {
        var that = this, options = this.options;
        var $svpanel = this.$wrapper.find('.el-color-svpanel');
        var $cursor = this.$wrapper.find('.el-color-svpanel__cursor');

        function handleDrag (event) {
          var el = $svpanel[0];
          var rect = el.getBoundingClientRect();

          let left = event.clientX - rect.left;
          let top = event.clientY - rect.top;
          left = Math.max(0, left);
          left = Math.min(left, rect.width);

          top = Math.max(0, top);
          top = Math.min(top, rect.height);

          $cursor.css({left: left, top: top});
          that.color.set({
            saturation: left / rect.width * 100,
            value: 100 - top / rect.height * 100
          });
          event.stopPropagation();
        }

        var dragConfig = {
          drag: handleDrag,
          end: handleDrag
        };
        draggable($svpanel[0], dragConfig);
      },
      dragThumb: function () {
        var that = this, options = this.options;

        function handleDrag (event) {
          var rect = that.$wrapper[0].getBoundingClientRect();
          var $thumb = that.$wrapper.find('.el-color-hue-slider__thumb');
          var thumb = $thumb[0];

          var top = event.clientY - rect.top;
          top = Math.max(thumb.offsetHeight / 2, top);
          top = Math.min(top, rect.height - thumb.offsetHeight / 2);

          $thumb.css('top', top);
          that.color.set('alpha', Math.round((top - thumb.offsetHeight / 2) / (rect.height - thumb.offsetHeight) * 100));
          event.stopPropagation();
        }

        var dragConfig = {
          drag: handleDrag,
          end: handleDrag
        };
        draggable(this.$wrapper.find('.el-color-hue-slider__bar')[0], dragConfig);
        draggable(this.$wrapper.find('.el-color-hue-slider__thumb')[0], dragConfig);
      },
      show: function () {
        this.$colorDropdown.show();
        this._show = true;
      },
      hide: function () {
        this.$colorDropdown.hide();
        this._show = false;
      }
    };
    $.fn[componentName] = function () {
      var option = arguments[0],
        args = arguments,
        value,
        allowedMethods = [];
      this.each(function () {
        var $this = $(this),
          data = $this.data('u-colorPicker');
        if (!data) {
          var options = $.extend({}, $.fn[componentName].defaults, $this.data(), option);
          data = new ColorPicker($this, options);
          $this.data('u-colorPicker', data);
          data.init();
        }
        if (typeof option === 'string') {
          if ($.inArray(option, allowedMethods) < 0) {
            throw 'Unknown method: ' + option;
          }
          value = data[option](args[1]);
        }
      });
      return typeof value !== 'undefined' ? value : this;
    };
    $.fn[componentName].defaults = {
      'value': '',
      'disabled': '',
      'size': '',
      'showAlpha': false,
      'colorFormat': '',
      'popperClass': '',
      'predefine': [],
      'change': '',
      'activeChange': ''
    };
  },
  componentName: 'colorPicker'
};