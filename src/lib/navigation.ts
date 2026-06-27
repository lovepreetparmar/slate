export type NavDirection = "forward" | "back";

let navDirection: NavDirection = "forward";

export function setNavDirection(direction: NavDirection) {
  navDirection = direction;
}

export function consumeNavDirection(): NavDirection {
  const direction = navDirection;
  navDirection = "forward";
  return direction;
}

export function navigateForward(href: string, navigate: (href: string) => void) {
  setNavDirection("forward");
  navigate(href);
}

export function navigateBack(href: string, navigate: (href: string) => void) {
  setNavDirection("back");
  navigate(href);
}
