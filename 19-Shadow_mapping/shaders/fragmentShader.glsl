precision highp float;

uniform sampler2D samplerTex;
uniform sampler2D samplerShadowMap;
uniform float u_shininess;
uniform vec3 u_source_direction;
uniform vec3 u_view_direction;
uniform bool u_CameraShadow;

varying vec2 v_uv;
//varying vec3 v_color;
varying vec3 v_normal;
varying vec3 v_vertPos;
varying vec3 v_LightPos;

const vec3 source_diffuse_color  = vec3(1.0,1.0,1.0);
const vec3 source_ambient_color  = vec3(0.2,0.2,0.2);
const vec3 source_specular_color = vec3(1.0,1.0,1.0);

void main() {

    vec2 uv_ShadowMap = v_LightPos.xy;
    vec4 ShadowMapColor = texture2D(samplerShadowMap,uv_ShadowMap);
    float z_ShadowMap = ShadowMapColor.r;

    float thisShadow = 1.0;

    if (z_ShadowMap + 0.01 < v_LightPos.z){
        thisShadow = 0.3;
    }

    if (u_CameraShadow){
        gl_FragColor = vec4(z_ShadowMap,z_ShadowMap,z_ShadowMap,1.);
        return;
    }

    vec3 colorTex = vec3(texture2D(samplerTex,v_uv));

    vec3 lightDir    = normalize(u_source_direction - v_vertPos);
    vec3 L = normalize(lightDir);
    vec3 V = normalize(u_view_direction);
    vec3 R = normalize(reflect(-L,v_normal));

    float S = dot(V,R);
    S = clamp(S,0.0,1.0);
    S = pow(S,u_shininess);

    vec3 I_specular = source_specular_color * S;

    vec3 color =  I_specular + source_ambient_color + source_diffuse_color * max(0.0,dot(v_normal,L));
    color = color * thisShadow;
    gl_FragColor =  vec4(color * colorTex,1.0);

}
