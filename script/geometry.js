
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

    pointcloud: function (attributes, positions, colors, normals, pointSize)
    {
        var indexStart = 0;
        if (attributes != null) indexStart = attributes.position.length / 3;
        else attributes = { position: [], color: [], normal: [], indices: [] };

        const v3 = twgl.v3;
        const stride = 4;
        var count = positions.length / stride;
        var indexTriangle = 0;
        const position = [-1, -1, 0, -1, 1, 0, 1, 1, 0, 1, -1, 0,];
        const indices = [0, 1, 2, 2, 3, 0];
        var size = 1.0;
        for (var index = 0; index < count; ++index)
        {
            var i = index * stride;
            var pos = [positions[i], positions[i + 1], positions[i + 2]];
            if (Math.abs(pos[0]) + Math.abs(pos[1]) + Math.abs(pos[2]) > 0.01)
            {
                var z = [normals[i], normals[i + 1], normals[i+2]];
                var x = v3.normalize(v3.cross(z, [0,1,0]));
                var y = v3.normalize(v3.cross(x, z));
                size = pointSize * arrayLength(pos, camera.position);
                for (var v = 0; v < 4; ++v)
                {
                    attributes.position.push(pos[0] + (x[0] * position[v * 3] + y[0] * position[v * 3 + 1]) * size);
                    attributes.position.push(pos[1] + (x[1] * position[v * 3] + y[1] * position[v * 3 + 1]) * size);
                    attributes.position.push(pos[2] + (x[2] * position[v * 3] + y[2] * position[v * 3 + 1]) * size);
                    attributes.normal.push(normals[i], normals[i + 1], normals[i + 2]);
                    attributes.color.push(colors[i], colors[i+1], colors[i+2], colors[i+3]);
                }
                for (var t = 0; t < 6; ++t)
                {
                    attributes.indices.push(indexStart + indexTriangle * 4 + indices[t]);
                }
                ++indexTriangle;
            }
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


