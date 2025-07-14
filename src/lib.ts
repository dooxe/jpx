import { JpxImage } from "./JpxImage";
import { JpxError } from "./JpxError";
import { Kernel } from "./Kernel";
import { getDefault } from "./utils";



export const time = () => {
    return Date.now();
};


export const exit = () => {
    throw new JpxError('Exiting');
};


export const addPlugin = (plugin) => {
    for (var name in plugin) {
        var p = JpxImage.prototype[name];
        if (p) {
            throw new JpxError('addPlugin()', 'method "' + name + '" cannot be overridden');
        }
        JpxImage.prototype[name] = plugin[name];
    }
};


export const defineFilter = (name, parameters, filterCode) => {
    addPlugin((function (name, params, filterCode) {
        var defaults = {};
        for (var i = 0; i < params.length; ++i) {
            var p = params[i];
            defaults[p.name] = p.defaultValue;
        }
        var plugin = {};
        plugin[name] = function (P) {
            var p = defaults;
            for (var n in P) {
                p[n] = getDefault(P[n], defaults[n]);
            }
            return filterCode.call(this, p);
        };
        return plugin;
    })(name, parameters, filterCode));
}






addPlugin({


    add: function (other) {
        var self = this;
        if (typeof other === 'number') {
            self.data.forEach(function (d, i) { self.data[i] += other; });
            return this;
        }
        self.data.forEach(function (d, i) { self.data[i] += other.data[i]; });
        return self;
    },


    sub: function (other) {
        var self = this;
        if (typeof other === 'number') {
            return self.add(-other);
        }
        self.data.forEach(function (d, i) { self.data[i] -= other.data[i]; });
        return self;
    },


    mul: function (other) {
        var self = this;
        if (typeof other === 'number') {
            self.data.forEach(function (d, i) { self.data[i] *= other; });
            return this;
        }
        self.data.forEach(function (d, i) { self.data[i] *= other.data[i]; });
        return self;
    }
});
