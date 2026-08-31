// W3C-style motion tokens used by the avatar behavior controller.
export const motionTokens = Object.freeze({
  blink: Object.freeze({
    minInterval: 2.4, // character.blink.interval-min
    maxInterval: 6.8, // character.blink.interval-max
    duration: 0.15, // character.blink.duration
  }),
  expression: Object.freeze({
    quick: 0.2, // character.expression.transition-quick
    normal: 0.4, // character.expression.transition-normal
    slow: 0.8, // character.expression.transition-slow
  }),
  idle: Object.freeze({
    breathingPeriod: 4, // character.idle.breathing-period
    swayPeriod: 3, // character.idle.sway-period
  }),
  procedural: Object.freeze({
    headTargetMin: 1.15, // procedural.frequency-slow
    headTargetMax: 2.65,
    headJitterYaw: 0.018, // procedural.amplitude-subtle
  }),
  attention: Object.freeze({
    minimumAwayYaw: 0.14,
    audienceYaw: -0.2,
    visualYaw: -1.12, // ~64°: giro casi lateral hacia las ayudas visuales
  }),
});
