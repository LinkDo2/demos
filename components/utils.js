var utils = {
    merge: function(obj1, obj2) {
        for (var p in obj2) {
            if (obj2[p] && obj2[p].constructor == Object ) {
                if (obj1[p]) {
                    this.merge(obj1[p], obj2[p]);
                    continue;
                }
            }
            obj1[p] = obj2[p];
        }
    },

    mergeAll: function(){
        var newObj = {};
        var objs = arguments;
        for(var i = 0; i < objs.length; i++){
            this.merge(newObj, objs[i]);
        }
        return newObj;
    },

    htmlToNode: function(htmlString, parent){
        while(parent.lastChild){parent.removeChild(parent.lastChild); }
        return this.appendHtmlToNode(htmlString, parent);
    },

    appendHtmlToNode: function(htmlString, parent){
        return parent.appendChild(document.importNode(new DOMParser().parseFromString(htmlString, 'text/html').body.childNodes[0], true));
    },

    once: function once(fn, context) {
        var result;
        return function() {
            if(fn) {
                result = fn.apply(context || this, arguments);
                fn = null;
            }
            return result;
        };
    },

    throttle: function throttle(callback, limit) {
        var wait = false;
        var timer = null;
        return function() {
            var that = this;
            if (!wait) {
                //callback.apply(this, arguments);
                wait = true;
                clearTimeout(timer);
                timer = setTimeout(function() {
                    wait = false;
                    callback.apply(that, arguments);
                }, limit);
            }
        };
    }
};

if (typeof module === 'object' && module.exports) {
    module.exports = utils;
}