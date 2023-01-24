const userAgentRegex = /mobile|tablet|android|ipad|iphone/i;

export const isMobile:boolean = userAgentRegex.test(navigator.userAgent);
