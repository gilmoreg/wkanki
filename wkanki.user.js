// ==UserScript==
// @name        wkanki
// @namespace   http://gilmoreg.com
// @description Create Anki flashcards from Wanikani lessons via AnkiConnect
// @version     0.1.0
// @include     https://www.wanikani.com/lesson/session
// @include     https://www.wanikani.com/vocabulary/*
// @include     https://www.wanikani.com/kanji/*
// ==/UserScript==

/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 9);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const waitForClass = (node) => new Promise((resolve) => {
    const interval = setInterval(() => {
        if (node.classList.length > 0) {
            clearInterval(interval);
            resolve();
        }
    }, 1);
});
class Dom {
    constructor(dom = document, win = window) {
        this.dom = dom;
        this.win = win;
        this.pageType = this.pageType.bind(this);
        this.itemType = this.itemType.bind(this);
        this.querySelector = this.querySelector.bind(this);
        this.querySelectorAll = this.querySelectorAll.bind(this);
    }
    pageType() {
        return this.win.location.href.match(/.+lesson\/session/) ? 'lesson' : 'page';
    }
    async itemType() {
        const pageType = this.pageType();
        if (pageType === 'lesson') {
            const mainInfo = this.dom.querySelector('#main-info');
            if (!mainInfo)
                throw new Error('unable to get page type');
            await waitForClass(mainInfo);
            if (mainInfo.classList.contains('vocabulary'))
                return 'vocabulary';
            if (mainInfo.classList.contains('kanji'))
                return 'kanji';
            throw new Error('unsupported lesson type');
        }
        // Item
        const pageRegex = /https:\/\/www.wanikani.com\/(.+)\/.+/;
        const matches = pageRegex.exec(this.win.location.href);
        if (!matches || matches.length < 2) {
            throw new Error('url not recognized');
        }
        return matches[1];
    }
    querySelector(query) {
        const element = this.dom.querySelector(query);
        return element ? element : this.dom.createElement('div');
    }
    querySelectorAll(query) {
        const elements = Array.from(this.dom.querySelectorAll(query));
        return (elements && elements.length > 0) ? elements : [this.dom.createElement('div')];
    }
}
exports.Dom = Dom;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const AnkiConnectURL = 'http://localhost:8765';
const createAKConnectAddNoteContract = (note) => ({
    action: 'addNote',
    version: 6,
    params: {
        note: {
            deckName: note.deckName,
            modelName: 'Basic',
            fields: {
                Front: note.front,
                Back: note.back,
            },
            options: {
                allowDuplicate: true,
            },
            tags: note.tags,
        }
    }
});
class AnkiConnectAdapter {
    ankiConnectRequest(body) {
        return fetch(AnkiConnectURL, {
            method: 'POST',
            body: JSON.stringify(body),
        })
            .then(res => res.json());
    }
    getDeckNames() {
        return this.ankiConnectRequest({ action: 'deckNames', version: 6 })
            .then(res => res.result)
            .catch(err => {
            console.error(err);
            return [];
        });
    }
    addNote(note) {
        return this.ankiConnectRequest(createAKConnectAddNoteContract(note))
            .then(res => !!res)
            .catch(err => {
            console.error(err);
            return false;
        });
    }
}
exports.default = AnkiConnectAdapter;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__(4);

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(6)(content, options);

if(content.locals) module.exports = content.locals;

if(false) {
	module.hot.accept("!!../node_modules/css-loader/dist/cjs.js!./index.css", function() {
		var newContent = require("!!../node_modules/css-loader/dist/cjs.js!./index.css");

		if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];

		var locals = (function(a, b) {
			var key, idx = 0;

			for(key in a) {
				if(!b || a[key] !== b[key]) return false;
				idx++;
			}

			for(key in b) idx--;

			return idx === 0;
		}(content.locals, newContent.locals));

		if(!locals) throw new Error('Aborting CSS HMR due to changed css-modules locals.');

		update(newContent);
	});

	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const AnkiConnectAdapter_1 = __webpack_require__(1);
const WKPage_1 = __webpack_require__(8);
const Dom_1 = __webpack_require__(0);
const modalTemplate = `
  <div id="wkanki_modal" class="wkanki_modal">
    <!-- Modal content -->
    <div class="wkanki_modal-content">
      <span class="wkanki_close">&times;</span>
      <form>
        <p>
          <label for="wkanki_decks">Anki Deck: </label>
          <select id="wkanki_decks"></select>
        </p>
        <p>
          <label for="wkanki_front">Front: </label>
        </p>
        <p>
          <input type="text" id="wkanki_front">
        </p>
        <p>
          <label for="wkanki_back">Back: </label>
          <textarea rows="13" cols="43" id="wkanki_back"></textarea>
        </p>
        <p class="wkanki_modal-footer">
          <button id="wkanki_submit">Add</button>
        </p>
      </form>
      <div class="wkanki_modal-content-preview">
        <p>Front:</p>
        <div id="wkanki_preview-front"></div>
        <p>Back:</p>
        <div id="wkanki_preview-back"></div>
      </div>
    </div>
  </div>
`;
const radicalColor = '214, 241, 255';
const kanjiColor = '255, 214, 241';
const kanjiBackgroundColor = '241, 0, 161';
const vocabColor = '161, 0, 241';
const vocabBackgroundColor = '241,214,240';
const readingBackgroundColor = '71,71,71';
const readingForegroundColor = '255,255,255';
const frontFontSize = 64;
const backFontSize = 16;
const generateStyles = (fontSize, color) => `color: rgb(255, 255, 255); font-family: &quot;Hiragino Kaku Gothic Pro&quot;, Meiryo, &quot;Source Han Sans Japanese&quot;, NotoSansCJK, TakaoPGothic, &quot;Yu Gothic&quot;, &quot;ヒラギノ角ゴ Pro W3&quot;, メイリオ, Osaka, &quot;MS PGothic&quot;, &quot;ＭＳ Ｐゴシック&quot;, sans-serif; font-size: ${fontSize}px; text-align: center; background-color: rgb(${color}); line-height: normal;`;
const generateHTML = (text, fontSize, color) => `<span style="${generateStyles(fontSize, color)}">${text}</span>`;
const generateBackHTML = (text) => {
    const html = text
        .replace(/class="highlight-kanji"/g, `style="background-color: rgb(${kanjiColor});"`)
        .replace(/class="kanji-highlight"/g, `style="background-color: rgb(${kanjiColor});"`)
        .replace(/class="highlight-vocabulary"/g, `style="background-color: rgb(${vocabBackgroundColor});"`)
        .replace(/class="vocabulary-highlight"/g, `style="background-color: rgb(${vocabBackgroundColor});"`)
        .replace(/class="highlight-radical"/g, `style="background-color: rgb(${radicalColor});"`)
        .replace(/class="radical-highlight"/g, `style="background-color: rgb(${radicalColor});"`)
        .replace(/class="reading-highlight"/g, `style="color: rgb(${readingForegroundColor}); background-color: rgb(${readingBackgroundColor})"`);
    return `<div style="font-size: ${backFontSize};">${html}</div>`;
};
class Modal {
    constructor(ankiConnectAdapter = new AnkiConnectAdapter_1.default(), dom = new Dom_1.Dom(), storage = localStorage) {
        this.ankiConnectAdapter = ankiConnectAdapter;
        this.dom = dom;
        this.storage = storage;
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.insert = this.insert.bind(this);
        this.update = this.update.bind(this);
        this.updateDecks = this.updateDecks.bind(this);
        this.updatePreview = this.updatePreview.bind(this);
        this.addCard = this.addCard.bind(this);
        this.getStoredDeck = this.getStoredDeck.bind(this);
        this.setStoredDeck = this.setStoredDeck.bind(this);
        this.insert();
        this.modal = this.dom.querySelector('#wkanki_modal');
        this.select = this.dom.querySelector('#wkanki_decks');
        this.front = this.dom.querySelector('#wkanki_front');
        this.back = this.dom.querySelector('#wkanki_back');
        this.frontPreview = this.dom.querySelector('#wkanki_preview-front');
        this.backPreview = this.dom.querySelector('#wkanki_preview-back');
        this.front.addEventListener('input', this.updatePreview);
        this.back.addEventListener('input', this.updatePreview);
        this.select.addEventListener('change', this.setStoredDeck);
        this.updateDecks();
    }
    async show() {
        const lessonType = await this.dom.itemType();
        // Radicals not supported
        if (lessonType === 'radical')
            return;
        this.update(null);
        this.modal.style.display = 'block';
    }
    hide() {
        this.modal.style.display = 'none';
    }
    insert() {
        const body = this.dom.querySelector('body');
        if (!body) {
            return;
        }
        body.insertAdjacentHTML('afterend', modalTemplate);
        const close = this.dom.querySelector('.wkanki_close');
        close && close.addEventListener('click', this.hide);
        const submit = this.dom.querySelector('#wkanki_submit');
        submit && submit.addEventListener('click', this.addCard);
    }
    getStoredDeck() {
        return (this.storage && this.storage.getItem('wkanki_deck')) || '';
    }
    setStoredDeck(e) {
        const target = e.target;
        this.storage && this.storage.setItem('wkanki_deck', target.value);
    }
    async updateDecks() {
        const deckNames = await this.ankiConnectAdapter.getDeckNames();
        const storedDeck = this.getStoredDeck();
        if (!deckNames) {
            return;
        }
        const html = deckNames
            .map(d => `<option value="${d}" ${d === storedDeck ? 'selected' : ''}>${d}</option>`)
            .join();
        this.select.innerHTML = html;
    }
    async update(e) {
        e && e.stopPropagation();
        this.page = await WKPage_1.NewWaniKaniPage();
        this.front.value = this.page.challenge();
        this.back.value = generateBackHTML(this.page.answer());
        this.updatePreview(e);
    }
    async updatePreview(e) {
        e && e.stopPropagation();
        const type = await this.dom.itemType();
        const color = type === 'vocabulary' ? vocabColor : kanjiBackgroundColor;
        this.frontPreview.innerHTML = generateHTML(this.front.value, frontFontSize, color);
        this.backPreview.innerHTML = this.back.value;
    }
    async addCard(e) {
        e.preventDefault();
        const result = await this.ankiConnectAdapter.addNote({
            deckName: this.select.value,
            front: this.frontPreview.innerHTML,
            back: this.backPreview.innerHTML,
            tags: []
        });
        if (result) {
            this.hide();
        }
        else {
            console.error(result);
        }
        return result;
    }
}
exports.default = Modal;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(5)(false);
// Module
exports.push([module.i, ".wkanki_show_modal {\n  margin: 2em;\n  text-align: center;\n}\n\n.wkanki_show_modal button {\n  border-radius: 0.5em;\n  padding: 0.25em;\n}\n\n/* The Modal (background) */\n.wkanki_modal {\n  display: none; /* Hidden by default */\n  position: fixed; /* Stay in place */\n  z-index: 1000; /* Sit on top */\n  left: 0;\n  top: 0;\n  width: 100%; /* Full width */\n  height: 100%; /* Full height */\n  overflow: auto; /* Enable scroll if needed */\n  background-color: rgb(0,0,0); /* Fallback color */\n  background-color: rgba(0,0,0,0.4); /* Black w/ opacity */\n}\n\n/* Modal Content/Box */\n.wkanki_modal-content {\n  background-color: #fefefe;\n  margin: 15% auto; /* 15% from the top and centered */\n  padding: 20px;\n  border: 1px solid #888;\n  width: 80%; /* Could be more or less, depending on screen size */\n  border-radius: 0.5em;\n  display: flex;\n  justify-content: space-evenly;\n\n}\n\n.wkanki_modal-content form {\n  flex: 50%;\n  padding: 1em;\n}\n\n.wkanki_modal-content-preview {\n  flex: 50%;\n  padding: 1em;\n}\n\n.wkanki_modal-content-preview div {\n  border: 1px solid black;\n  border-radius: 0.5em;\n}\n\n#wkanki_preview-front {\n  text-align: center;\n}\n\n/* The Close Button */\n.wkanki_close {\n  color: #aaa;\n  float: right;\n  font-size: 28px;\n  font-weight: bold;\n}\n\n.wkanki_close:hover,\n.wkanki_close:focus {\n  color: black;\n  text-decoration: none;\n  cursor: pointer;\n}\n\n.wkanki_modal-footer {\n  text-align: center;\n  margin: 1em;\n}", ""]);


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names
module.exports = function (useSourceMap) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item, useSourceMap);

      if (item[2]) {
        return "@media ".concat(item[2], "{").concat(content, "}");
      }

      return content;
    }).join('');
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery) {
    if (typeof modules === 'string') {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, '']];
    }

    var alreadyImportedModules = {};

    for (var i = 0; i < this.length; i++) {
      // eslint-disable-next-line prefer-destructuring
      var id = this[i][0];

      if (id != null) {
        alreadyImportedModules[id] = true;
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = modules[_i]; // skip already imported module
      // this implementation is not 100% perfect for weird media query combinations
      // when a module is imported multiple times with different media queries.
      // I hope this will never occur (Hey this way we have smaller bundles)

      if (item[0] == null || !alreadyImportedModules[item[0]]) {
        if (mediaQuery && !item[2]) {
          item[2] = mediaQuery;
        } else if (mediaQuery) {
          item[2] = "(".concat(item[2], ") and (").concat(mediaQuery, ")");
        }

        list.push(item);
      }
    }
  };

  return list;
};

function cssWithMappingToString(item, useSourceMap) {
  var content = item[1] || ''; // eslint-disable-next-line prefer-destructuring

  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (useSourceMap && typeof btoa === 'function') {
    var sourceMapping = toComment(cssMapping);
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot).concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
  }

  return [content].join('\n');
} // Adapted from convert-source-map (MIT)


function toComment(sourceMap) {
  // eslint-disable-next-line no-undef
  var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
  var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
  return "/*# ".concat(data, " */");
}

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getTarget = function (target, parent) {
  if (parent){
    return parent.querySelector(target);
  }
  return document.querySelector(target);
};

var getElement = (function (fn) {
	var memo = {};

	return function(target, parent) {
                // If passing function in options, then use it for resolve "head" element.
                // Useful for Shadow Root style i.e
                // {
                //   insertInto: function () { return document.querySelector("#foo").shadowRoot }
                // }
                if (typeof target === 'function') {
                        return target();
                }
                if (typeof memo[target] === "undefined") {
			var styleTarget = getTarget.call(this, target, parent);
			// Special case to return head of iframe instead of iframe itself
			if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
				try {
					// This will throw an exception if access to iframe is blocked
					// due to cross-origin restrictions
					styleTarget = styleTarget.contentDocument.head;
				} catch(e) {
					styleTarget = null;
				}
			}
			memo[target] = styleTarget;
		}
		return memo[target]
	};
})();

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(7);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton && typeof options.singleton !== "boolean") options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
        if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else if (typeof options.insertAt === "object" && options.insertAt.before) {
		var nextSibling = getElement(options.insertAt.before, target);
		target.insertBefore(style, nextSibling);
	} else {
		throw new Error("[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	if(options.attrs.type === undefined) {
		options.attrs.type = "text/css";
	}

	if(options.attrs.nonce === undefined) {
		var nonce = getNonce();
		if (nonce) {
			options.attrs.nonce = nonce;
		}
	}

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	if(options.attrs.type === undefined) {
		options.attrs.type = "text/css";
	}
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function getNonce() {
	if (false) {
		return null;
	}

	return __webpack_require__.nc;
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = typeof options.transform === 'function'
		 ? options.transform(obj.css) 
		 : options.transform.default(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 7 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/|\s*$)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Dom_1 = __webpack_require__(0);
class WaniKaniPage {
    constructor(dom = new Dom_1.Dom()) {
        this.dom = dom;
        this.challenge = this.challenge.bind(this);
        this.answer = this.answer.bind(this);
    }
    challenge() {
        throw new Error("Method not implemented.");
    }
    answer() {
        throw new Error("Method not implemented.");
    }
    createMeaning() {
        const header = this.dom.querySelector('.span12 header h1');
        const meaningMatches = header.innerHTML.match(/^.+<\/span>\s(.+)$/m);
        return meaningMatches[1];
    }
    ;
}
class KanjiLesson extends WaniKaniPage {
    constructor(dom) {
        super(dom);
    }
    getMeanings() {
        const synonyms = this.dom.querySelector('#supplement-kan-meaning>div>div>div');
        if (!synonyms || !synonyms.innerHTML || synonyms.innerHTML === '(None)')
            return '';
        return synonyms.innerHTML;
    }
    challenge() {
        const character = this.dom.querySelector('#character');
        return character && character.innerHTML || '';
    }
    answer() {
        const reading = this.dom.querySelector('#supplement-kan-reading span:lang(ja)');
        const meaning = this.dom.querySelector('#meaning');
        const meanings = this.getMeanings();
        const meaningMnemonic = this.dom.querySelector('#supplement-kan-meaning-mne');
        const meaningHint = this.dom.querySelector('#supplement-kan-meaning-hnt');
        const readingMnemonic = this.dom.querySelector('#supplement-kan-reading-mne');
        const readingHint = this.dom.querySelector('#supplement-kan-reading-hnt');
        return `
        <span>${reading && reading.innerText}</span>
        <p>
          ${meaning && meaning.innerText}${(meanings !== '' ? `, ${meanings}` : '')}
        </p>
        <p>
          ${meaningMnemonic && meaningMnemonic.innerHTML}
          ${meaningHint && meaningHint.innerHTML}
          ${readingMnemonic && readingMnemonic.innerHTML}
          ${readingHint && readingHint.innerHTML}
        </p>
      `;
    }
}
exports.KanjiLesson = KanjiLesson;
class VocabLesson extends WaniKaniPage {
    getMeanings() {
        const synonyms = this.dom.querySelector('#supplement-voc-synonyms');
        if (!synonyms || !synonyms.innerHTML || synonyms.innerHTML === '(None)')
            return '';
        return synonyms.innerHTML;
    }
    constructor(dom) {
        super(dom);
    }
    challenge() {
        const character = this.dom.querySelector('#character');
        return character && character.innerHTML || '';
    }
    answer() {
        var readings = '';
        const readingElements = this.dom.querySelectorAll('.pronunciation-variant');
        if (readingElements && readingElements.length) {
            readings = readingElements.map(el => el.innerHTML).join(',');
        }
        const meaning = this.dom.querySelector('#meaning');
        const meanings = this.getMeanings();
        const meaningExplanation = this.dom.querySelector('#supplement-voc-meaning-exp');
        const readingExplanation = this.dom.querySelector('#supplement-voc-reading-exp');
        const pos = this.dom.querySelector('#supplement-voc-part-of-speech');
        return `
        <span>${readings}</span>
        <p>
          ${meaning && meaning.innerText}${(meanings !== '' ? `, ${meanings}` : '')}
        </p>
        <p>
          ${meaningExplanation && meaningExplanation.innerHTML}
          ${readingExplanation && readingExplanation.innerHTML}
        </p>
        <p>
          Part of speech: ${pos && pos.innerHTML}
        </p>
    `;
    }
}
exports.VocabLesson = VocabLesson;
class KanjiPage extends WaniKaniPage {
    error(message) {
        const errorMessage = `cannot parse kanji page: ${message}`;
        throw new Error(errorMessage);
    }
    constructor(dom) {
        super(dom);
    }
    challenge() {
        const character = this.dom.querySelector('.kanji-icon');
        return character && character.innerText || '';
    }
    answer() {
        const meaning = this.createMeaning();
        const readingElements = this.dom.querySelectorAll('p:lang(ja)');
        const readings = createReadings(readingElements);
        const mnemonicElements = this.dom.querySelectorAll('.mnemonic-content p');
        const mnemonics = mnemonicElements.map(el => el.innerHTML).join(' ');
        return `
        <p>${meaning}</p>
        <p>
          ${readings}
        </p>
        <p>
          ${mnemonics}
        </p>
      `;
    }
}
exports.KanjiPage = KanjiPage;
class VocabPage extends WaniKaniPage {
    error(message) {
        const errorMessage = `cannot parse vocab page: ${message}`;
        throw new Error(errorMessage);
    }
    constructor(dom) {
        super(dom);
    }
    challenge() {
        const character = this.dom.querySelector('.vocabulary-icon');
        return character && character.innerText || '';
    }
    answer() {
        const meaning = this.createMeaning(); // This is not capturing "Alternative meanings" in VocabPage (but those are all caps)
        const readingElements = this.dom.querySelectorAll('.vocabulary-reading p:lang(ja)');
        if (!readingElements)
            this.error('no reading elements');
        const readings = createReadings(readingElements);
        const mnemonicElements = this.dom.querySelectorAll('.mnemonic-content p');
        if (!mnemonicElements || mnemonicElements.length < 1)
            this.error('no mnemonic elements');
        const mnemonics = mnemonicElements.map(el => el.innerHTML).join(' ');
        return `
      <p>
        ${readings}
      </p>
      <p>
        ${meaning}
      </p>
      <p>
        ${mnemonics}
      </p>
    `;
    }
}
exports.VocabPage = VocabPage;
/*
Currently an issue with some vocab pages where you might see
<section class="vocabulary-reading">
          <h2>Reading</h2>
          <p lang="ja">
            けいと
            <button type="button" class="audio-btn audio-idle"></button>
            <audio>
              <source src="https://cdn.wanikani.com/subjects/audio/3416-%E6%AF%9B%E7%B3%B8.mp3?1525117045" type="audio/mpeg">
              <source src="https://cdn.wanikani.com/subjects/audio/3416-%E6%AF%9B%E7%B3%B8.ogg?1525117045" type="audio/ogg">
            </audio>
</p>        </section>
*/
const createReadings = (readingElements) => readingElements
    .filter(el => !el.innerText.includes('None'))
    .map(el => {
    const wkCanon = !el.parentElement || !el.parentElement.classList.contains('muted-content');
    return wkCanon ? el.innerText : `<span style="opacity: 0.3">${el.innerText}</span>`;
})
    .join(', ');
async function NewWaniKaniPage(dom = new Dom_1.Dom()) {
    const pageType = dom.pageType();
    const itemType = await dom.itemType();
    if (pageType === 'lesson') {
        switch (itemType) {
            case 'kanji': return new KanjiLesson(dom);
            case 'vocabulary': return new VocabLesson(dom);
            default: throw new Error('unsupported lesson type');
        }
    }
    switch (itemType) {
        case 'kanji': return new KanjiPage(dom);
        case 'vocabulary': return new VocabPage(dom);
        default: throw new Error('unsupported page type');
    }
}
exports.NewWaniKaniPage = NewWaniKaniPage;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
__webpack_require__(2);
const Modal_1 = __webpack_require__(3);
const Dom_1 = __webpack_require__(0);
const AnkiConnectAdapter_1 = __webpack_require__(1);
const dom = new Dom_1.Dom();
const ankiConnectAdapter = new AnkiConnectAdapter_1.default();
const modal = new Modal_1.default(ankiConnectAdapter, dom);
const supplementalInfo = dom.querySelector('#supplement-info');
const information = dom.querySelector('#information');
const buttonHTML = `<div class="wkanki_show_modal"><button id="wkanki_show_modal">Add to Anki</button></div>`;
if (supplementalInfo) {
    supplementalInfo.insertAdjacentHTML('beforeend', buttonHTML);
}
if (information) {
    information.insertAdjacentHTML('afterend', buttonHTML);
}
const button = dom.querySelector('#wkanki_show_modal');
button && button.addEventListener('click', () => modal.show());


/***/ })
/******/ ]);