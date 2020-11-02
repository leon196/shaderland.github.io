
var geometry = {

    points: function(count)
    {
        var attributes = { position: [] };
        for (var index = 0; index < count; ++index)
        {
            attributes.position.push(index / (count - 1), index, 0);
        }
        return attributes;
    },

    circle: function(segments)
    {
        var attributes = { position: [], indices: [] };
        for (var i = 0; i < segments; ++i)
        {
            var a = Math.PI * 2 * i / (segments);
            attributes.position.push(Math.cos(a), 0, Math.sin(a));
            attributes.indices.push(i, (i + 1) % segments);
        }
        return attributes;
    },

    clone: function(attributes, count)
    {
        var clones = { quantity: [] };
        var keys = Object.keys(attributes);
        var vertexCount = attributes.position.length/3;
        keys.forEach(key => clones[key] = [] );
        for (var index = 0; index < count; ++index)
        {
            keys.forEach(key =>
            {
                if (key !== "indices")
                {
                    attributes[key].forEach(item => clones[key].push(item));
                }
            });
            var rng = Math.random();
            for (var p = 0; p < vertexCount; ++p)
            {
                clones.quantity.push(index / (count - 1), index, rng);
            }
            for (var i = 0; i < attributes.indices.length; ++i)
            {
                clones.indices.push(index * vertexCount + attributes.indices[i]);
            }
        }
        return clones;
    }
}


