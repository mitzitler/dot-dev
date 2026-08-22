uniform vec3 u_color1;
uniform vec3 u_color2;

vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
    vec4 topColor = vec4(u_color1 / 255.0, 1.0);
    vec4 bottomColor = vec4(u_color2 / 255.0, 1.0);
    return (uv.y < 0.5) ? topColor : bottomColor;
}
