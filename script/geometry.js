
var geometry = {

    points: function(count)
    {
        var attributes = { position: [] };
        for (var index = 0; index < count; ++index)
        {
            // attributes.position.push(index / (count - 1), index, 0);
            attributes.position.push(Math.random(), Math.random(), 0);
        }
        return attributes;
    },

    pointmap: function(dimension)
    {
        var attributes = { position:[], texcoord: [] };
        for (var point = 0; point < dimension * dimension; ++point)
        {
            attributes.position.push(point / (dimension * dimension - 1), point, 0);
            attributes.texcoord.push((point%dimension)/dimension, Math.floor(point/dimension)/dimension);
        }
        return attributes;
    },

    pointcloudmap: function(dimension)
    {
        var attributes = { position:[], texcoord: [], indices: [] };
        const position = [-1, -1, 0, -1, 1, 0, 1, 1, 0, 1, -1, 0,];
        const indices = [0, 1, 2, 2, 3, 0];
        for (var point = 0; point < dimension * dimension; ++point)
        {
            for (var vertex = 0; vertex < 4; ++vertex)
            {
                attributes.position.push(position[vertex*3], position[vertex*3+1], position[vertex*3+2]);
                attributes.texcoord.push((point%dimension)/dimension, Math.floor(point/dimension)/dimension);
            }
            for (var index = 0; index < 6; ++index)
            {
                attributes.indices.push(point*4 + indices[index]);
            }
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

    grid: function(dimensions, subdivisions)
    {
        var attributes = { position: [], color: [], indices: [] };
        var width = dimensions[0];
        var height = dimensions[1];
        var w = width/subdivisions[0];
        var h = height/subdivisions[1];
        var index = 0;
        for (var x = 0; x <= subdivisions[0]; ++x)
        {
            attributes.position.push(x * w - width/2, 0, +height/2);
            attributes.position.push(x * w - width/2, 0, -height/2);
            attributes.indices.push(index, index + 1);
            index += 2;

            var color = [0.3,0.3,0.3,1];
            if (x == 0 || x == subdivisions[0]) color = [1,1,1,1];
            else if (x == subdivisions[0]/2) color = [1,0,0,1];
            color.forEach(rgba => attributes.color.push(rgba));
            color.forEach(rgba => attributes.color.push(rgba));
        }
        for (var y = 0; y <= subdivisions[1]; ++y)
        {
            attributes.position.push(+width/2, 0, y * h - height/2);
            attributes.position.push(-width/2, 0, y * h - height/2);
            attributes.indices.push(index, index + 1);
            index += 2;
            
            var color = [0.3,0.3,0.3,1];
            if (y == 0 || y == subdivisions[1]) color = [1,1,1,1];
            else if (y == subdivisions[1]/2) color = [0,0,1,1];
            color.forEach(rgba => attributes.color.push(rgba));
            color.forEach(rgba => attributes.color.push(rgba));
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


