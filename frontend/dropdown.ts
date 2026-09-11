/**
 * The toolbar's segmented controls, folded to their current value.
 *
 * Seven groups ride on the map, and laid out flat they were two bands of
 * geography wide: every option of every control on screen at once, when a
 * reader changes one of them a few times an hour. Each group now shows the
 * option it is set to, with a caret saying there are others, and opens a
 * list below itself when clicked. The map gets its top edge back and the
 * strip still says, at a glance, what question is being asked.
 *
 * The option buttons themselves are untouched. Every handler in `main.ts`,
 * and the `press` a link or an embed arrives through, still finds the same
 * `[data-*]` buttons with the same `.active` class; what this adds is a
 * trigger in front of each group that MIRRORS whichever option is active --
 * its text, its disabled state, its armed state -- and a rule for which
 * group's list is open. Mirroring is done by watching the group for changes
 * rather than by asking each handler to report, so a control that changes
 * its own button (the pin's "click the map…", the radius disabled under
 * Streets) is reflected without knowing this exists.
 *
 * The phone sheet is not folded. There the whole toolbar is already a mode a
 * reader enters, and inside it the chip rows are one tap per choice where a
 * list would be two; the trigger is hidden by the same media query that
 * turns the strip into a sheet, and the group's list is simply always open.
 *
 * The decisions -- what the trigger shows, which group is open next -- are
 * pure so they can be tested without a DOM, like the legend's counting and
 * the sheet's geometry.
 */

/** What one option button looks like, as far as the trigger cares. */
export interface OptionFace {
  label: string;
  active: boolean;
  disabled: boolean;
  armed: boolean;
}

export type TriggerFace = Omit<OptionFace, 'active'>;

/**
 * What the closed trigger wears: the active option, exactly.
 *
 * Disabled follows the active option because the radius is disabled as a
 * whole under Streets, and a trigger that stayed live would open a list of
 * greyed-out choices -- the silent control the disabling exists to prevent.
 */
export function triggerFace(options: OptionFace[]): TriggerFace {
  const shown = options.find((o) => o.active) ?? options[0];
  if (!shown) return { label: '', disabled: true, armed: false };
  return { label: shown.label, disabled: shown.disabled, armed: shown.armed };
}

export type DropdownEvent =
  | { kind: 'trigger'; group: string }
  | { kind: 'pick' }
  | { kind: 'outside' }
  | { kind: 'escape' };

/**
 * Which group's list is open after `event`, given that `open` was.
 *
 * One at a time: a second trigger closes the first as it opens its own,
 * rather than leaving two lists over the map, and anything that is not a
 * trigger -- choosing an option, clicking elsewhere, Escape -- closes the
 * lot.
 */
export function nextOpen(open: string | null, event: DropdownEvent): string | null {
  if (event.kind !== 'trigger') return null;
  return open === event.group ? null : event.group;
}

/** The hooks the stylesheet dresses: the trigger, its wrapper, an open group. */
const TRIGGER_CLASS = 'seg-current';
const WRAP_CLASS = 'dd';
const OPEN_CLASS = 'open';

/** Shared with `.seg button.armed`: the trigger wears the pin's waiting look. */
const ARMED_CLASS = 'armed';

function faceOf(seg: HTMLElement): TriggerFace {
  const options = Array.from(seg.querySelectorAll<HTMLButtonElement>('button'))
    .map((b) => ({
      label: b.textContent ?? '',
      active: b.classList.contains('active'),
      disabled: b.disabled,
      armed: b.classList.contains(ARMED_CLASS),
    }));
  return triggerFace(options);
}

/**
 * Fold every segmented group under `root`, and keep each fold honest.
 *
 * Each `.controls` that holds a `.seg` gets a trigger button in front of the
 * segment, both wrapped so the list can hang from the trigger's own left
 * edge rather than from the label's. The group's element is the unit the
 * open/closed state is kept on, as a class, so the stylesheet decides what
 * open looks like at each width.
 */
export function initDropdowns(root: ParentNode = document): void {
  const groups = new Map<string, { group: HTMLElement; trigger: HTMLButtonElement; seg: HTMLElement }>();
  let open: string | null = null;

  const apply = (next: string | null) => {
    open = next;
    for (const [key, g] of groups) {
      const on = key === open;
      g.group.classList.toggle(OPEN_CLASS, on);
      g.trigger.setAttribute('aria-expanded', String(on));
    }
  };

  const dispatch = (event: DropdownEvent) => apply(nextOpen(open, event));

  root.querySelectorAll<HTMLElement>('.controls').forEach((group, i) => {
    const seg = group.querySelector<HTMLElement>('.seg');
    if (!seg) return;
    const key = group.id || `controls-${i}`;
    const label = group.querySelector('.lbl')?.textContent ?? '';

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = TRIGGER_CLASS;
    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-expanded', 'false');

    const wrap = document.createElement('div');
    wrap.className = WRAP_CLASS;
    seg.replaceWith(wrap);
    wrap.append(trigger, seg);

    const mirror = () => {
      const face = faceOf(seg);
      trigger.textContent = face.label;
      trigger.disabled = face.disabled;
      trigger.classList.toggle(ARMED_CLASS, face.armed);
      trigger.setAttribute('aria-label', label ? `${label}: ${face.label}` : face.label);
    };
    mirror();
    new MutationObserver(mirror).observe(seg, {
      subtree: true, childList: true, characterData: true,
      attributes: true, attributeFilter: ['class', 'disabled'],
    });

    trigger.addEventListener('click', () => {
      dispatch({ kind: 'trigger', group: key });
      if (open === key) {
        seg.querySelector<HTMLButtonElement>('button.active')?.focus();
      }
    });
    // After the option's own handler, which is on the button and runs first.
    // Focus comes back to the trigger because the option just chosen is
    // about to be hidden, and a hidden element cannot hold it.
    seg.addEventListener('click', (e) => {
      if (!(e.target as HTMLElement).closest('button')) return;
      const wasOpen = open === key;
      dispatch({ kind: 'pick' });
      if (wasOpen) trigger.focus();
    });

    groups.set(key, { group, trigger, seg });
  });

  document.addEventListener('click', (e) => {
    if (open === null) return;
    const inside = (e.target as HTMLElement).closest(`.${WRAP_CLASS}`);
    if (!inside) dispatch({ kind: 'outside' });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || open === null) return;
    const was = groups.get(open);
    dispatch({ kind: 'escape' });
    if (was && was.seg.contains(document.activeElement)) was.trigger.focus();
  });
}
