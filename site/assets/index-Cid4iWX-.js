//#region \0vite/modulepreload-polyfill.js
(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
})();
//#endregion
//#region node_modules/svelte/src/internal/shared/utils.js
var is_array = Array.isArray;
var index_of = Array.prototype.indexOf;
var includes = Array.prototype.includes;
var array_from = Array.from;
var define_property = Object.defineProperty;
var get_descriptor = Object.getOwnPropertyDescriptor;
var get_descriptors = Object.getOwnPropertyDescriptors;
var object_prototype = Object.prototype;
var array_prototype = Array.prototype;
var get_prototype_of = Object.getPrototypeOf;
var is_extensible = Object.isExtensible;
var noop = () => {};
/** @param {Function} fn */
function run(fn) {
	return fn();
}
/** @param {Array<() => void>} arr */
function run_all(arr) {
	for (var i = 0; i < arr.length; i++) arr[i]();
}
/**
* TODO replace with Promise.withResolvers once supported widely enough
* @template [T=void]
*/
function deferred() {
	/** @type {(value: T) => void} */
	var resolve;
	/** @type {(reason: any) => void} */
	var reject;
	return {
		promise: new Promise((res, rej) => {
			resolve = res;
			reject = rej;
		}),
		resolve,
		reject
	};
}
/**
* When encountering a situation like `let [a, b, c] = $derived(blah())`,
* we need to stash an intermediate value that `a`, `b`, and `c` derive
* from, in case it's an iterable
* @template T
* @param {ArrayLike<T> | Iterable<T>} value
* @param {number} [n]
* @returns {Array<T>}
*/
function to_array(value, n) {
	if (Array.isArray(value)) return value;
	if (n === void 0 || !(Symbol.iterator in value)) return Array.from(value);
	/** @type {T[]} */
	const array = [];
	for (const element of value) {
		array.push(element);
		if (array.length === n) break;
	}
	return array;
}
var CLEAN = 1024;
var DIRTY = 2048;
var MAYBE_DIRTY = 4096;
var INERT = 8192;
var DESTROYED = 16384;
/** Set once a reaction has run for the first time */
var REACTION_RAN = 32768;
/** Effect is in the process of getting destroyed. Can be observed in child teardown functions */
var DESTROYING = 1 << 25;
/**
* 'Transparent' effects do not create a transition boundary.
* This is on a block effect 99% of the time but may also be on a branch effect if its parent block effect was pruned
*/
var EFFECT_TRANSPARENT = 65536;
var EFFECT_PRESERVED = 1 << 19;
var USER_EFFECT = 1 << 20;
var EFFECT_OFFSCREEN = 1 << 25;
/**
* Tells that we marked this derived and its reactions as visited during the "mark as (maybe) dirty"-phase.
* Will be lifted during execution of the derived and during checking its dirty state (both are necessary
* because a derived might be checked but not executed). This is a pure performance optimization flag and
* should not be used for any other purpose!
*/
var WAS_MARKED = 65536;
var REACTION_IS_UPDATING = 1 << 21;
var ASYNC = 1 << 22;
var ERROR_VALUE = 1 << 23;
var STATE_SYMBOL = Symbol("$state");
var LEGACY_PROPS = Symbol("legacy props");
var LOADING_ATTR_SYMBOL = Symbol("");
var ATTRIBUTES_CACHE = Symbol("attributes");
var CLASS_CACHE = Symbol("class");
var STYLE_CACHE = Symbol("style");
var TEXT_CACHE = Symbol("text");
var FORM_RESET_HANDLER = Symbol("form reset");
/** allow users to ignore aborted signal errors if `reason.name === 'StaleReactionError` */
var STALE_REACTION = new class StaleReactionError extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
var IS_XHTML = !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml");
/**
* `%name%(...)` can only be used during component initialisation
* @param {string} name
* @returns {never}
*/
function lifecycle_outside_component(name) {
	throw new Error(`https://svelte.dev/e/lifecycle_outside_component`);
}
//#endregion
//#region node_modules/svelte/src/internal/client/errors.js
/**
* Cannot create a `$derived(...)` with an `await` expression outside of an effect tree
* @returns {never}
*/
function async_derived_orphan() {
	throw new Error(`https://svelte.dev/e/async_derived_orphan`);
}
/**
* Keyed each block has duplicate key `%value%` at indexes %a% and %b%
* @param {string} a
* @param {string} b
* @param {string | undefined | null} [value]
* @returns {never}
*/
function each_key_duplicate(a, b, value) {
	throw new Error(`https://svelte.dev/e/each_key_duplicate`);
}
/**
* `%rune%` cannot be used inside an effect cleanup function
* @param {string} rune
* @returns {never}
*/
function effect_in_teardown(rune) {
	throw new Error(`https://svelte.dev/e/effect_in_teardown`);
}
/**
* Effect cannot be created inside a `$derived` value that was not itself created inside an effect
* @returns {never}
*/
function effect_in_unowned_derived() {
	throw new Error(`https://svelte.dev/e/effect_in_unowned_derived`);
}
/**
* `%rune%` can only be used inside an effect (e.g. during component initialisation)
* @param {string} rune
* @returns {never}
*/
function effect_orphan(rune) {
	throw new Error(`https://svelte.dev/e/effect_orphan`);
}
/**
* Maximum update depth exceeded. This typically indicates that an effect reads and writes the same piece of state
* @returns {never}
*/
function effect_update_depth_exceeded() {
	throw new Error(`https://svelte.dev/e/effect_update_depth_exceeded`);
}
/**
* Cannot do `bind:%key%={undefined}` when `%key%` has a fallback value
* @param {string} key
* @returns {never}
*/
function props_invalid_value(key) {
	throw new Error(`https://svelte.dev/e/props_invalid_value`);
}
/**
* Property descriptors defined on `$state` objects must contain `value` and always be `enumerable`, `configurable` and `writable`.
* @returns {never}
*/
function state_descriptors_fixed() {
	throw new Error(`https://svelte.dev/e/state_descriptors_fixed`);
}
/**
* Cannot set prototype of `$state` object
* @returns {never}
*/
function state_prototype_fixed() {
	throw new Error(`https://svelte.dev/e/state_prototype_fixed`);
}
/**
* Updating state inside `$derived(...)`, `$inspect(...)` or a template expression is forbidden. If the value should not be reactive, declare it without `$state`
* @returns {never}
*/
function state_unsafe_mutation() {
	throw new Error(`https://svelte.dev/e/state_unsafe_mutation`);
}
/**
* A `<svelte:boundary>` `reset` function cannot be called while an error is still being handled
* @returns {never}
*/
function svelte_boundary_reset_onerror() {
	throw new Error(`https://svelte.dev/e/svelte_boundary_reset_onerror`);
}
//#endregion
//#region node_modules/svelte/src/constants.js
var HYDRATION_ERROR = {};
var UNINITIALIZED = Symbol("uninitialized");
var NAMESPACE_HTML = "http://www.w3.org/1999/xhtml";
var NAMESPACE_SVG = "http://www.w3.org/2000/svg";
var NAMESPACE_MATHML = "http://www.w3.org/1998/Math/MathML";
/**
* Reading a derived belonging to a now-destroyed effect may result in stale values
*/
function derived_inert() {
	console.warn(`https://svelte.dev/e/derived_inert`);
}
/**
* Hydration failed because the initial UI does not match what was rendered on the server. The error occurred near %location%
* @param {string | undefined | null} [location]
*/
function hydration_mismatch(location) {
	console.warn(`https://svelte.dev/e/hydration_mismatch`);
}
/**
* A `<svelte:boundary>` `reset` function only resets the boundary the first time it is called
*/
function svelte_boundary_reset_noop() {
	console.warn(`https://svelte.dev/e/svelte_boundary_reset_noop`);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/hydration.js
/** @import { TemplateNode } from '#client' */
/**
* Use this variable to guard everything related to hydration code so it can be treeshaken out
* if the user doesn't use the `hydrate` method and these code paths are therefore not needed.
*/
var hydrating = false;
/** @param {boolean} value */
function set_hydrating(value) {
	hydrating = value;
}
/**
* The node that is currently being hydrated. This starts out as the first node inside the opening
* <!--[--> comment, and updates each time a component calls `$.child(...)` or `$.sibling(...)`.
* When entering a block (e.g. `{#if ...}`), `hydrate_node` is the block opening comment; by the
* time we leave the block it is the closing comment, which serves as the block's anchor.
* @type {TemplateNode}
*/
var hydrate_node;
/** @param {TemplateNode | null} node */
function set_hydrate_node(node) {
	if (node === null) {
		hydration_mismatch();
		throw HYDRATION_ERROR;
	}
	return hydrate_node = node;
}
function hydrate_next() {
	return set_hydrate_node(/* @__PURE__ */ get_next_sibling(hydrate_node));
}
/** @param {TemplateNode} node */
function reset(node) {
	if (!hydrating) return;
	if (/* @__PURE__ */ get_next_sibling(hydrate_node) !== null) {
		hydration_mismatch();
		throw HYDRATION_ERROR;
	}
	hydrate_node = node;
}
function next(count = 1) {
	if (hydrating) {
		var i = count;
		var node = hydrate_node;
		while (i--) node = /* @__PURE__ */ get_next_sibling(node);
		hydrate_node = node;
	}
}
/**
* Skips or removes (depending on {@link remove}) all nodes starting at `hydrate_node` up until the next hydration end comment
* @param {boolean} remove
*/
function skip_nodes(remove = true) {
	var depth = 0;
	var node = hydrate_node;
	while (true) {
		if (node.nodeType === 8) {
			var data = node.data;
			if (data === "]") {
				if (depth === 0) return node;
				depth -= 1;
			} else if (data === "[" || data === "[!" || data[0] === "[" && !isNaN(Number(data.slice(1)))) depth += 1;
		}
		var next = /* @__PURE__ */ get_next_sibling(node);
		if (remove) node.remove();
		node = next;
	}
}
/**
*
* @param {TemplateNode} node
*/
function read_hydration_instruction(node) {
	if (!node || node.nodeType !== 8) {
		hydration_mismatch();
		throw HYDRATION_ERROR;
	}
	return node.data;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/equality.js
/** @import { Equals } from '#client' */
/** @type {Equals} */
function equals(value) {
	return value === this.v;
}
/**
* @param {unknown} a
* @param {unknown} b
* @returns {boolean}
*/
function safe_not_equal(a, b) {
	return a != a ? b == b : a !== b || a !== null && typeof a === "object" || typeof a === "function";
}
/** @type {Equals} */
function safe_equals(value) {
	return !safe_not_equal(value, this.v);
}
//#endregion
//#region node_modules/svelte/src/internal/flags/index.js
/** True if experimental.async=true */
var async_mode_flag = false;
/** True if we're not certain that we only have Svelte 5 code in the compilation */
var legacy_mode_flag = false;
function enable_legacy_mode_flag() {
	legacy_mode_flag = true;
}
//#endregion
//#region node_modules/svelte/src/internal/client/context.js
/** @import { ComponentContext, DevStackEntry, Effect } from '#client' */
/** @type {ComponentContext | null} */
var component_context = null;
/** @param {ComponentContext | null} context */
function set_component_context(context) {
	component_context = context;
}
/**
* @param {Record<string, unknown>} props
* @param {any} runes
* @param {Function} [fn]
* @returns {void}
*/
function push(props, runes = false, fn) {
	component_context = {
		p: component_context,
		i: false,
		c: null,
		e: null,
		s: props,
		x: null,
		r: active_effect,
		l: legacy_mode_flag && !runes ? {
			s: null,
			u: null,
			$: []
		} : null
	};
}
/**
* @template {Record<string, any>} T
* @param {T} [component]
* @returns {T}
*/
function pop(component) {
	var context = component_context;
	var effects = context.e;
	if (effects !== null) {
		context.e = null;
		for (var fn of effects) create_user_effect(fn);
	}
	if (component !== void 0) context.x = component;
	context.i = true;
	component_context = context.p;
	return component ?? {};
}
/** @returns {boolean} */
function is_runes() {
	return !legacy_mode_flag || component_context !== null && component_context.l === null;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/task.js
/** @type {Array<() => void>} */
var micro_tasks = [];
function run_micro_tasks() {
	var tasks = micro_tasks;
	micro_tasks = [];
	run_all(tasks);
}
/**
* @param {() => void} fn
*/
function queue_micro_task(fn) {
	if (micro_tasks.length === 0 && !is_flushing_sync) {
		var tasks = micro_tasks;
		queueMicrotask(() => {
			if (tasks === micro_tasks) run_micro_tasks();
		});
	}
	micro_tasks.push(fn);
}
/**
* Synchronously run any queued tasks.
*/
function flush_tasks() {
	while (micro_tasks.length > 0) run_micro_tasks();
}
/**
* @param {unknown} error
*/
function handle_error(error) {
	var effect = active_effect;
	if (effect === null) {
		/** @type {Derived} */ active_reaction.f |= ERROR_VALUE;
		return error;
	}
	if ((effect.f & 32768) === 0 && (effect.f & 4) === 0) throw error;
	invoke_error_boundary(error, effect);
}
/**
* @param {unknown} error
* @param {Effect | null} effect
*/
function invoke_error_boundary(error, effect) {
	if (effect !== null && (effect.f & 16384) !== 0) return;
	while (effect !== null) {
		if ((effect.f & 128) !== 0) {
			if ((effect.f & 32768) === 0) throw error;
			try {
				/** @type {Boundary} */ effect.b.error(error);
				return;
			} catch (e) {
				error = e;
			}
		}
		effect = effect.parent;
	}
	throw error;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/status.js
/** @import { Derived, Signal } from '#client' */
var STATUS_MASK = ~(DIRTY | MAYBE_DIRTY | CLEAN);
/**
* @param {Signal} signal
* @param {number} status
*/
function set_signal_status(signal, status) {
	signal.f = signal.f & STATUS_MASK | status;
}
/**
* Set a derived's status to CLEAN or MAYBE_DIRTY based on its connection state.
* @param {Derived} derived
*/
function update_derived_status(derived) {
	if ((derived.f & 512) !== 0 || derived.deps === null) set_signal_status(derived, CLEAN);
	else set_signal_status(derived, MAYBE_DIRTY);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/utils.js
/** @import { Derived, Effect, Value } from '#client' */
/**
* @param {Value[] | null} deps
*/
function clear_marked(deps) {
	if (deps === null) return;
	for (const dep of deps) {
		if ((dep.f & 2) === 0 || (dep.f & 65536) === 0) continue;
		dep.f ^= WAS_MARKED;
		clear_marked(
			/** @type {Derived} */
			dep.deps
		);
	}
}
/**
* @param {Effect} effect
* @param {Set<Effect>} dirty_effects
* @param {Set<Effect>} maybe_dirty_effects
*/
function defer_effect(effect, dirty_effects, maybe_dirty_effects) {
	if ((effect.f & 2048) !== 0) dirty_effects.add(effect);
	else if ((effect.f & 4096) !== 0) maybe_dirty_effects.add(effect);
	clear_marked(effect.deps);
	set_signal_status(effect, CLEAN);
}
//#endregion
//#region node_modules/svelte/src/store/utils.js
/** @import { Readable } from './public' */
/**
* @template T
* @param {Readable<T> | null | undefined} store
* @param {(value: T) => void} run
* @param {(value: T) => void} [invalidate]
* @returns {() => void}
*/
function subscribe_to_store(store, run, invalidate) {
	if (store == null) {
		run(void 0);
		if (invalidate) invalidate(void 0);
		return noop;
	}
	const unsub = untrack(() => store.subscribe(run, invalidate));
	return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
//#endregion
//#region node_modules/svelte/src/store/shared/index.js
/** @import { Readable, StartStopNotifier, Subscriber, Unsubscriber, Updater, Writable } from '../public.js' */
/** @import { Stores, StoresValues, SubscribeInvalidateTuple } from '../private.js' */
/**
* @type {Array<SubscribeInvalidateTuple<any> | any>}
*/
var subscriber_queue = [];
/**
* Create a `Writable` store that allows both updating and reading by subscription.
*
* @template T
* @param {T} [value] initial value
* @param {StartStopNotifier<T>} [start]
* @returns {Writable<T>}
*/
function writable(value, start = noop) {
	/** @type {Unsubscriber | null} */
	let stop = null;
	/** @type {Set<SubscribeInvalidateTuple<T>>} */
	const subscribers = /* @__PURE__ */ new Set();
	/**
	* @param {T} new_value
	* @returns {void}
	*/
	function set(new_value) {
		if (safe_not_equal(value, new_value)) {
			value = new_value;
			if (stop) {
				const run_queue = !subscriber_queue.length;
				for (const subscriber of subscribers) {
					subscriber[1]();
					subscriber_queue.push(subscriber, value);
				}
				if (run_queue) {
					for (let i = 0; i < subscriber_queue.length; i += 2) subscriber_queue[i][0](subscriber_queue[i + 1]);
					subscriber_queue.length = 0;
				}
			}
		}
	}
	/**
	* @param {Updater<T>} fn
	* @returns {void}
	*/
	function update(fn) {
		set(fn(value));
	}
	/**
	* @param {Subscriber<T>} run
	* @param {() => void} [invalidate]
	* @returns {Unsubscriber}
	*/
	function subscribe(run, invalidate = noop) {
		/** @type {SubscribeInvalidateTuple<T>} */
		const subscriber = [run, invalidate];
		subscribers.add(subscriber);
		if (subscribers.size === 1) stop = start(set, update) || noop;
		run(value);
		return () => {
			subscribers.delete(subscriber);
			if (subscribers.size === 0 && stop) {
				stop();
				stop = null;
			}
		};
	}
	return {
		set,
		update,
		subscribe
	};
}
/**
* Get the current value from a store by subscribing and immediately unsubscribing.
*
* @template T
* @param {Readable<T>} store
* @returns {T}
*/
function get$1(store) {
	let value;
	subscribe_to_store(store, (_) => value = _)();
	return value;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/store.js
/** @import { StoreReferencesContainer } from '#client' */
/** @import { Store } from '#shared' */
/**
* We set this to `true` when updating a store so that we correctly
* schedule effects if the update takes place inside a `$:` effect
*/
var legacy_is_updating_store = false;
/**
* Whether or not the prop currently being read is a store binding, as in
* `<Child bind:x={$y} />`. If it is, we treat the prop as mutable even in
* runes mode, and skip `binding_property_non_reactive` validation
*/
var is_store_binding = false;
var IS_UNMOUNTED = Symbol("unmounted");
/**
* Gets the current value of a store. If the store isn't subscribed to yet, it will create a proxy
* signal that will be updated when the store is. The store references container is needed to
* track reassignments to stores and to track the correct component context.
* @template V
* @param {Store<V> | null | undefined} store
* @param {string} store_name
* @param {StoreReferencesContainer} stores
* @returns {V}
*/
function store_get(store, store_name, stores) {
	const entry = stores[store_name] ??= {
		store: null,
		source: /* @__PURE__ */ mutable_source(void 0),
		unsubscribe: noop
	};
	if (entry.store !== store && !(IS_UNMOUNTED in stores)) {
		entry.unsubscribe();
		entry.store = store ?? null;
		if (store == null) {
			entry.source.v = void 0;
			entry.unsubscribe = noop;
		} else {
			var is_synchronous_callback = true;
			entry.unsubscribe = subscribe_to_store(store, (v) => {
				if (is_synchronous_callback) entry.source.v = v;
				else set(entry.source, v);
			});
			is_synchronous_callback = false;
		}
	}
	if (store && IS_UNMOUNTED in stores) return get$1(store);
	return get(entry.source);
}
/**
* Unsubscribes from all auto-subscribed stores on destroy
* @returns {[StoreReferencesContainer, ()=>void]}
*/
function setup_stores() {
	/** @type {StoreReferencesContainer} */
	const stores = {};
	function cleanup() {
		teardown(() => {
			for (var store_name in stores) stores[store_name].unsubscribe();
			define_property(stores, IS_UNMOUNTED, {
				enumerable: false,
				value: true
			});
		});
	}
	return [stores, cleanup];
}
/**
* Returns a tuple that indicates whether `fn()` reads a prop that is a store binding.
* Used to prevent `binding_property_non_reactive` validation false positives and
* ensure that these props are treated as mutable even in runes mode
* @template T
* @param {() => T} fn
* @returns {[T, boolean]}
*/
function capture_store_binding(fn) {
	var previous_is_store_binding = is_store_binding;
	try {
		is_store_binding = false;
		return [fn(), is_store_binding];
	} finally {
		is_store_binding = previous_is_store_binding;
	}
}
//#endregion
//#region node_modules/svelte/src/reactivity/create-subscriber.js
/**
* Returns a `subscribe` function that integrates external event-based systems with Svelte's reactivity.
* It's particularly useful for integrating with web APIs like `MediaQuery`, `IntersectionObserver`, or `WebSocket`.
*
* If `subscribe` is called inside an effect (including indirectly, for example inside a getter),
* the `start` callback will be called with an `update` function. Whenever `update` is called, the effect re-runs.
*
* If `start` returns a cleanup function, it will be called when the effect is destroyed.
*
* If `subscribe` is called in multiple effects, `start` will only be called once as long as the effects
* are active, and the returned teardown function will only be called when all effects are destroyed.
*
* It's best understood with an example. Here's an implementation of [`MediaQuery`](https://svelte.dev/docs/svelte/svelte-reactivity#MediaQuery):
*
* ```js
* import { createSubscriber } from 'svelte/reactivity';
* import { on } from 'svelte/events';
*
* export class MediaQuery {
* 	#query;
* 	#subscribe;
*
* 	constructor(query) {
* 		this.#query = window.matchMedia(`(${query})`);
*
* 		this.#subscribe = createSubscriber((update) => {
* 			// when the `change` event occurs, re-run any effects that read `this.current`
* 			const off = on(this.#query, 'change', update);
*
* 			// stop listening when all the effects are destroyed
* 			return () => off();
* 		});
* 	}
*
* 	get current() {
* 		// This makes the getter reactive, if read in an effect
* 		this.#subscribe();
*
* 		// Return the current state of the query, whether or not we're in an effect
* 		return this.#query.matches;
* 	}
* }
* ```
* @param {(update: () => void) => (() => void) | void} start
* @since 5.7.0
*/
function createSubscriber(start) {
	let subscribers = 0;
	let version = source(0);
	/** @type {(() => void) | void} */
	let stop;
	return () => {
		if (effect_tracking()) {
			get(version);
			render_effect(() => {
				if (subscribers === 0) stop = untrack(() => start(() => increment(version)));
				subscribers += 1;
				return () => {
					queue_micro_task(() => {
						subscribers -= 1;
						if (subscribers === 0) {
							stop?.();
							stop = void 0;
							increment(version);
						}
					});
				};
			});
		}
	};
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/boundary.js
/** @import { Effect, Source, TemplateNode, } from '#client' */
/**
* @typedef {{
* 	 onerror?: ((error: unknown, reset: () => void) => void) | null;
*   failed?: ((anchor: Node, error: () => unknown, reset: () => () => void) => void) | null;
*   pending?: ((anchor: Node) => void) | null;
* }} BoundaryProps
*/
var flags = EFFECT_TRANSPARENT | EFFECT_PRESERVED;
/**
* @param {TemplateNode} node
* @param {BoundaryProps} props
* @param {((anchor: Node) => void)} children
* @param {((error: unknown) => unknown) | undefined} [transform_error]
* @returns {void}
*/
function boundary(node, props, children, transform_error) {
	new Boundary(node, props, children, transform_error);
}
var Boundary = class {
	/** @type {Boundary | null} */
	parent;
	is_pending = false;
	/**
	* API-level transformError transform function. Transforms errors before they reach the `failed` snippet.
	* Inherited from parent boundary, or defaults to identity.
	* @type {(error: unknown) => unknown}
	*/
	transform_error;
	/** @type {TemplateNode} */
	#anchor;
	/** @type {TemplateNode | null} */
	#hydrate_open = hydrating ? hydrate_node : null;
	/** @type {BoundaryProps} */
	#props;
	/** @type {((anchor: Node) => void)} */
	#children;
	/** @type {Effect} */
	#effect;
	/** @type {Effect | null} */
	#main_effect = null;
	/** @type {Effect | null} */
	#pending_effect = null;
	/** @type {Effect | null} */
	#failed_effect = null;
	/** @type {DocumentFragment | null} */
	#offscreen_fragment = null;
	#local_pending_count = 0;
	#pending_count = 0;
	#pending_count_update_queued = false;
	/** @type {Set<Effect>} */
	#dirty_effects = /* @__PURE__ */ new Set();
	/** @type {Set<Effect>} */
	#maybe_dirty_effects = /* @__PURE__ */ new Set();
	/**
	* A source containing the number of pending async deriveds/expressions.
	* Only created if `$effect.pending()` is used inside the boundary,
	* otherwise updating the source results in needless `Batch.ensure()`
	* calls followed by no-op flushes
	* @type {Source<number> | null}
	*/
	#effect_pending = null;
	#effect_pending_subscriber = createSubscriber(() => {
		this.#effect_pending = source(this.#local_pending_count);
		return () => {
			this.#effect_pending = null;
		};
	});
	/**
	* @param {TemplateNode} node
	* @param {BoundaryProps} props
	* @param {((anchor: Node) => void)} children
	* @param {((error: unknown) => unknown) | undefined} [transform_error]
	*/
	constructor(node, props, children, transform_error) {
		this.#anchor = node;
		this.#props = props;
		this.#children = (anchor) => {
			var effect = active_effect;
			effect.b = this;
			effect.f |= 128;
			children(anchor);
		};
		this.parent = active_effect.b;
		this.transform_error = transform_error ?? this.parent?.transform_error ?? ((e) => e);
		this.#effect = block(() => {
			if (hydrating) {
				const comment = this.#hydrate_open;
				hydrate_next();
				const server_rendered_pending = comment.data === "[!";
				if (comment.data.startsWith("[?")) {
					const serialized_error = JSON.parse(comment.data.slice(2));
					this.#hydrate_failed_content(serialized_error);
				} else if (server_rendered_pending) this.#hydrate_pending_content();
				else this.#hydrate_resolved_content();
			} else this.#render();
		}, flags);
		if (hydrating) this.#anchor = hydrate_node;
	}
	#hydrate_resolved_content() {
		try {
			this.#main_effect = branch(() => this.#children(this.#anchor));
		} catch (error) {
			this.error(error);
		}
	}
	/**
	* @param {unknown} error The deserialized error from the server's hydration comment
	*/
	#hydrate_failed_content(error) {
		const failed = this.#props.failed;
		if (!failed) return;
		this.#failed_effect = branch(() => {
			failed(this.#anchor, () => error, () => () => {});
		});
	}
	#hydrate_pending_content() {
		const pending = this.#props.pending;
		if (!pending) return;
		this.is_pending = true;
		this.#pending_effect = branch(() => pending(this.#anchor));
		queue_micro_task(() => {
			var fragment = this.#offscreen_fragment = document.createDocumentFragment();
			var anchor = create_text();
			fragment.append(anchor);
			this.#main_effect = this.#run(() => {
				return branch(() => this.#children(anchor));
			});
			if (this.#pending_count === 0) {
				this.#anchor.before(fragment);
				this.#offscreen_fragment = null;
				pause_effect(this.#pending_effect, () => {
					this.#pending_effect = null;
				});
				this.#resolve(current_batch);
			}
		});
	}
	#render() {
		try {
			this.is_pending = this.has_pending_snippet();
			this.#pending_count = 0;
			this.#local_pending_count = 0;
			this.#main_effect = branch(() => {
				this.#children(this.#anchor);
			});
			if (this.#pending_count > 0) {
				var fragment = this.#offscreen_fragment = document.createDocumentFragment();
				move_effect(this.#main_effect, fragment);
				const pending = this.#props.pending;
				this.#pending_effect = branch(() => pending(this.#anchor));
			} else this.#resolve(current_batch);
		} catch (error) {
			this.error(error);
		}
	}
	/**
	* @param {Batch} batch
	*/
	#resolve(batch) {
		this.is_pending = false;
		batch.transfer_effects(this.#dirty_effects, this.#maybe_dirty_effects);
	}
	/**
	* Defer an effect inside a pending boundary until the boundary resolves
	* @param {Effect} effect
	*/
	defer_effect(effect) {
		defer_effect(effect, this.#dirty_effects, this.#maybe_dirty_effects);
	}
	/**
	* Returns `false` if the effect exists inside a boundary whose pending snippet is shown
	* @returns {boolean}
	*/
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#props.pending;
	}
	/**
	* @template T
	* @param {() => T} fn
	*/
	#run(fn) {
		var previous_effect = active_effect;
		var previous_reaction = active_reaction;
		var previous_ctx = component_context;
		set_active_effect(this.#effect);
		set_active_reaction(this.#effect);
		set_component_context(this.#effect.ctx);
		try {
			Batch.ensure();
			return fn();
		} catch (e) {
			handle_error(e);
			return null;
		} finally {
			set_active_effect(previous_effect);
			set_active_reaction(previous_reaction);
			set_component_context(previous_ctx);
		}
	}
	/**
	* Updates the pending count associated with the currently visible pending snippet,
	* if any, such that we can replace the snippet with content once work is done
	* @param {1 | -1} d
	* @param {Batch} batch
	*/
	#update_pending_count(d, batch) {
		if (!this.has_pending_snippet()) {
			if (this.parent) this.parent.#update_pending_count(d, batch);
			return;
		}
		this.#pending_count += d;
		if (this.#pending_count === 0) {
			this.#resolve(batch);
			if (this.#pending_effect) pause_effect(this.#pending_effect, () => {
				this.#pending_effect = null;
			});
			if (this.#offscreen_fragment) {
				this.#anchor.before(this.#offscreen_fragment);
				this.#offscreen_fragment = null;
			}
		}
	}
	/**
	* Update the source that powers `$effect.pending()` inside this boundary,
	* and controls when the current `pending` snippet (if any) is removed.
	* Do not call from inside the class
	* @param {1 | -1} d
	* @param {Batch} batch
	*/
	update_pending_count(d, batch) {
		this.#update_pending_count(d, batch);
		this.#local_pending_count += d;
		if (!this.#effect_pending || this.#pending_count_update_queued) return;
		this.#pending_count_update_queued = true;
		queue_micro_task(() => {
			this.#pending_count_update_queued = false;
			if (this.#effect_pending) internal_set(this.#effect_pending, this.#local_pending_count);
		});
	}
	get_effect_pending() {
		this.#effect_pending_subscriber();
		return get(this.#effect_pending);
	}
	/** @param {unknown} error */
	error(error) {
		if (!this.#props.onerror && !this.#props.failed) throw error;
		if (current_batch?.is_fork) {
			if (this.#main_effect) current_batch.skip_effect(this.#main_effect);
			if (this.#pending_effect) current_batch.skip_effect(this.#pending_effect);
			if (this.#failed_effect) current_batch.skip_effect(this.#failed_effect);
			current_batch.oncommit(() => {
				this.#handle_error(error);
			});
		} else this.#handle_error(error);
	}
	/**
	* @param {unknown} error
	*/
	#handle_error(error) {
		if (this.#main_effect) {
			destroy_effect(this.#main_effect);
			this.#main_effect = null;
		}
		if (this.#pending_effect) {
			destroy_effect(this.#pending_effect);
			this.#pending_effect = null;
		}
		if (this.#failed_effect) {
			destroy_effect(this.#failed_effect);
			this.#failed_effect = null;
		}
		if (hydrating) {
			set_hydrate_node(this.#hydrate_open);
			next();
			set_hydrate_node(skip_nodes());
		}
		var onerror = this.#props.onerror;
		let failed = this.#props.failed;
		var did_reset = false;
		var calling_on_error = false;
		const reset = () => {
			if (did_reset) {
				svelte_boundary_reset_noop();
				return;
			}
			did_reset = true;
			if (calling_on_error) svelte_boundary_reset_onerror();
			if (this.#failed_effect !== null) pause_effect(this.#failed_effect, () => {
				this.#failed_effect = null;
			});
			this.#run(() => {
				this.#render();
			});
		};
		/** @param {unknown} transformed_error */
		const handle_error_result = (transformed_error) => {
			try {
				calling_on_error = true;
				onerror?.(transformed_error, reset);
				calling_on_error = false;
			} catch (error) {
				invoke_error_boundary(error, this.#effect && this.#effect.parent);
			}
			if (failed) this.#failed_effect = this.#run(() => {
				try {
					return branch(() => {
						var effect = active_effect;
						effect.b = this;
						effect.f |= 128;
						failed(this.#anchor, () => transformed_error, () => reset);
					});
				} catch (error) {
					invoke_error_boundary(error, this.#effect.parent);
					return null;
				}
			});
		};
		queue_micro_task(() => {
			/** @type {unknown} */
			var result;
			try {
				result = this.transform_error(error);
			} catch (e) {
				invoke_error_boundary(e, this.#effect && this.#effect.parent);
				return;
			}
			if (result !== null && typeof result === "object" && typeof result.then === "function")
 /** @type {any} */ result.then(
				handle_error_result,
				/** @param {unknown} e */
				(e) => invoke_error_boundary(e, this.#effect && this.#effect.parent)
			);
			else handle_error_result(result);
		});
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/async.js
/** @import { Blocker, Effect, Source, Value } from '#client' */
/**
* @param {Blocker[]} blockers
* @param {Array<() => any>} sync
* @param {Array<() => Promise<any>>} async
* @param {(values: Value[]) => any} fn
*/
function flatten(blockers, sync, async, fn) {
	const d = is_runes() ? derived : derived_safe_equal;
	var pending = blockers.filter((b) => !b.settled);
	var deriveds = sync.map(d);
	if (async.length === 0 && pending.length === 0) {
		fn(deriveds);
		return;
	}
	var parent = active_effect;
	var restore = capture();
	var blocker_promise = pending.length === 1 ? pending[0].promise : pending.length > 1 ? Promise.all(pending.map((b) => b.promise)) : null;
	/**
	* @param {Source[]} async
	*/
	function finish(async) {
		if ((parent.f & 16384) !== 0) return;
		restore();
		try {
			fn([...deriveds, ...async]);
		} catch (error) {
			invoke_error_boundary(error, parent);
		}
		unset_context();
	}
	var decrement_pending = increment_pending();
	if (async.length === 0) {
		/** @type {Promise<any>} */ blocker_promise.then(() => finish([])).finally(decrement_pending);
		return;
	}
	function run() {
		Promise.all(async.map((expression) => /* @__PURE__ */ async_derived(expression))).then(finish).catch((error) => invoke_error_boundary(error, parent)).finally(decrement_pending);
	}
	if (blocker_promise) blocker_promise.then(() => {
		restore();
		run();
		unset_context();
	});
	else run();
}
/**
* Captures the current effect context so that we can restore it after
* some asynchronous work has happened (so that e.g. `await a + b`
* causes `b` to be registered as a dependency).
*/
function capture() {
	var previous_effect = active_effect;
	var previous_reaction = active_reaction;
	var previous_component_context = component_context;
	var previous_batch = current_batch;
	return function restore(activate_batch = true) {
		set_active_effect(previous_effect);
		set_active_reaction(previous_reaction);
		set_component_context(previous_component_context);
		if (activate_batch && (previous_effect.f & 16384) === 0) {
			previous_batch?.activate();
			previous_batch?.apply();
		}
	};
}
function unset_context(deactivate_batch = true) {
	set_active_effect(null);
	set_active_reaction(null);
	set_component_context(null);
	if (deactivate_batch) current_batch?.deactivate();
}
/**
* @returns {(skip?: boolean) => void}
*/
function increment_pending() {
	var effect = active_effect;
	var boundary = effect.b;
	var batch = current_batch;
	var blocking = !!boundary?.is_rendered();
	boundary?.update_pending_count(1, batch);
	batch.increment(blocking, effect);
	return () => {
		boundary?.update_pending_count(-1, batch);
		batch.decrement(blocking, effect);
	};
}
/**
* @template V
* @param {() => V} fn
* @returns {Derived<V>}
*/
/*#__NO_SIDE_EFFECTS__*/
function derived(fn) {
	var flags = 2 | DIRTY;
	if (active_effect !== null) active_effect.f |= EFFECT_PRESERVED;
	return {
		ctx: component_context,
		deps: null,
		effects: null,
		equals,
		f: flags,
		fn,
		reactions: null,
		rv: 0,
		v: UNINITIALIZED,
		wv: 0,
		parent: active_effect,
		ac: null
	};
}
var OBSOLETE = Symbol("obsolete");
/**
* @template V
* @param {() => V | Promise<V>} fn
* @param {string} [label]
* @param {string} [location] If provided, print a warning if the value is not read immediately after update
* @returns {Promise<Source<V>>}
*/
/*#__NO_SIDE_EFFECTS__*/
function async_derived(fn, label, location) {
	let parent = active_effect;
	if (parent === null) async_derived_orphan();
	var promise = void 0;
	var signal = source(UNINITIALIZED);
	var should_suspend = !active_reaction;
	/** @type {Set<ReturnType<typeof deferred<V>>>} */
	var deferreds = /* @__PURE__ */ new Set();
	async_effect(() => {
		var effect = active_effect;
		/** @type {ReturnType<typeof deferred<V>>} */
		var d = deferred();
		promise = d.promise;
		try {
			Promise.resolve(fn()).then(d.resolve, (e) => {
				if (e !== STALE_REACTION) d.reject(e);
			}).finally(unset_context);
		} catch (error) {
			d.reject(error);
			unset_context();
		}
		var batch = current_batch;
		if (should_suspend) {
			if ((effect.f & 32768) !== 0) var decrement_pending = increment_pending();
			if (parent.b?.is_rendered()) batch.async_deriveds.get(effect)?.reject(OBSOLETE);
			else for (const d of deferreds.values()) d.reject(OBSOLETE);
			deferreds.add(d);
			batch.async_deriveds.set(effect, d);
		}
		/**
		* @param {any} value
		* @param {unknown} error
		*/
		const handler = (value, error = void 0) => {
			decrement_pending?.();
			deferreds.delete(d);
			if (error === OBSOLETE) return;
			batch.activate();
			if (error) {
				signal.f |= ERROR_VALUE;
				internal_set(signal, error);
			} else {
				if ((signal.f & 8388608) !== 0) signal.f ^= ERROR_VALUE;
				internal_set(signal, value);
			}
			batch.deactivate();
		};
		d.promise.then(handler, (e) => handler(null, e || "unknown"));
	});
	teardown(() => {
		for (const d of deferreds) d.reject(OBSOLETE);
	});
	return new Promise((fulfil) => {
		/** @param {Promise<V>} p */
		function next(p) {
			function go() {
				if (p === promise) fulfil(signal);
				else next(promise);
			}
			p.then(go, go);
		}
		next(promise);
	});
}
/**
* @template V
* @param {() => V} fn
* @returns {Derived<V>}
*/
/*#__NO_SIDE_EFFECTS__*/
function user_derived(fn) {
	const d = /* @__PURE__ */ derived(fn);
	if (!async_mode_flag) push_reaction_value(d);
	return d;
}
/**
* @template V
* @param {() => V} fn
* @returns {Derived<V>}
*/
/*#__NO_SIDE_EFFECTS__*/
function derived_safe_equal(fn) {
	const signal = /* @__PURE__ */ derived(fn);
	signal.equals = safe_equals;
	return signal;
}
/**
* @param {Derived} derived
* @returns {void}
*/
function destroy_derived_effects(derived) {
	var effects = derived.effects;
	if (effects !== null) {
		derived.effects = null;
		for (var i = 0; i < effects.length; i += 1) destroy_effect(effects[i]);
	}
}
/**
* @template T
* @param {Derived} derived
* @returns {T}
*/
function execute_derived(derived) {
	var value;
	var prev_active_effect = active_effect;
	var parent = derived.parent;
	if (!is_destroying_effect && parent !== null && derived.v !== UNINITIALIZED && (parent.f & 24576) !== 0) {
		derived_inert();
		return derived.v;
	}
	set_active_effect(parent);
	try {
		derived.f &= ~WAS_MARKED;
		destroy_derived_effects(derived);
		value = update_reaction(derived);
	} finally {
		set_active_effect(prev_active_effect);
	}
	return value;
}
/**
* @param {Derived} derived
* @returns {void}
*/
function update_derived(derived) {
	var value = execute_derived(derived);
	if (!derived.equals(value)) {
		derived.wv = increment_write_version();
		if (!current_batch?.is_fork || derived.deps === null) {
			if (current_batch !== null) {
				current_batch.capture(derived, value, true);
				previous_batch?.capture(derived, value, true);
			} else derived.v = value;
			if (derived.deps === null) {
				set_signal_status(derived, CLEAN);
				return;
			}
		}
	}
	if (is_destroying_effect) return;
	if (batch_values !== null) {
		if (effect_tracking() || current_batch?.is_fork) batch_values.set(derived, value);
	} else update_derived_status(derived);
}
/**
* @param {Derived} derived
*/
function freeze_derived_effects(derived) {
	if (derived.effects === null) return;
	for (const e of derived.effects) if (e.teardown || e.ac) {
		e.teardown?.();
		e.ac?.abort(STALE_REACTION);
		if (e.fn !== null) e.teardown = noop;
		e.ac = null;
		remove_reactions(e, 0);
		destroy_effect_children(e);
	}
}
/**
* @param {Derived} derived
*/
function unfreeze_derived_effects(derived) {
	if (derived.effects === null) return;
	for (const e of derived.effects) if (e.teardown && e.fn !== null) update_effect(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/batch.js
/** @import { Fork } from 'svelte' */
/** @import { Derived, Effect, Reaction, Source, Value } from '#client' */
/** @type {Batch | null} */
var first_batch = null;
/** @type {Batch | null} */
var last_batch = null;
/** @type {Batch | null} */
var current_batch = null;
/**
* This is needed to avoid overwriting inputs
* @type {Batch | null}
*/
var previous_batch = null;
/**
* When time travelling (i.e. working in one batch, while other batches
* still have ongoing work), we ignore the real values of affected
* signals in favour of their values within the batch
* @type {Map<Value, any> | null}
*/
var batch_values = null;
/** @type {Effect | null} */
var last_scheduled_effect = null;
var is_flushing_sync = false;
var is_processing = false;
/**
* During traversal, this is an array. Newly created effects are (if not immediately
* executed) pushed to this array, rather than going through the scheduling
* rigamarole that would cause another turn of the flush loop.
* @type {Effect[] | null}
*/
var collected_effects = null;
/**
* An array of effects that are marked during traversal as a result of a `set`
* (not `internal_set`) call. These will be added to the next batch and
* trigger another `batch.process()`
* @type {Effect[] | null}
* @deprecated when we get rid of legacy mode and stores, we can get rid of this
*/
var legacy_updates = null;
var flush_count = 0;
var uid = 1;
var Batch = class Batch {
	id = uid++;
	/** True as soon as `#process` was called */
	#started = false;
	linked = true;
	/** @type {Batch | null} */
	#prev = null;
	/** @type {Batch | null} */
	#next = null;
	/** @type {Map<Effect, ReturnType<typeof deferred<any>>>} */
	async_deriveds = /* @__PURE__ */ new Map();
	/**
	* The current values of any signals that are updated in this batch.
	* Tuple format: [value, is_derived] (note: is_derived is false for deriveds, too, if they were overridden via assignment)
	* They keys of this map are identical to `this.#previous`
	* @type {Map<Value, [any, boolean]>}
	*/
	current = /* @__PURE__ */ new Map();
	/**
	* The values of any signals (sources and deriveds) that are updated in this batch _before_ those updates took place.
	* They keys of this map are identical to `this.#current`
	* @type {Map<Value, any>}
	*/
	previous = /* @__PURE__ */ new Map();
	/**
	* When the batch is committed (and the DOM is updated), we need to remove old branches
	* and append new ones by calling the functions added inside (if/each/key/etc) blocks
	* @type {Set<(batch: Batch) => void>}
	*/
	#commit_callbacks = /* @__PURE__ */ new Set();
	/**
	* If a fork is discarded, we need to destroy any effects that are no longer needed
	* @type {Set<(batch: Batch) => void>}
	*/
	#discard_callbacks = /* @__PURE__ */ new Set();
	/**
	* The number of async effects that are currently in flight
	*/
	#pending = 0;
	/**
	* Async effects that are currently in flight, _not_ inside a pending boundary
	* @type {Map<Effect, number>}
	*/
	#blocking_pending = /* @__PURE__ */ new Map();
	/**
	* A deferred that resolves when the batch is committed, used with `settled()`
	* TODO replace with Promise.withResolvers once supported widely enough
	* @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
	*/
	#deferred = null;
	/**
	* The root effects that need to be flushed
	* @type {Effect[]}
	*/
	#roots = [];
	/**
	* Effects created while this batch was active.
	* @type {Effect[]}
	*/
	#new_effects = [];
	/**
	* Deferred effects (which run after async work has completed) that are DIRTY
	* @type {Set<Effect>}
	*/
	#dirty_effects = /* @__PURE__ */ new Set();
	/**
	* Deferred effects that are MAYBE_DIRTY
	* @type {Set<Effect>}
	*/
	#maybe_dirty_effects = /* @__PURE__ */ new Set();
	/**
	* A map of branches that still exist, but will be destroyed when this batch
	* is committed — we skip over these during `process`.
	* The value contains child effects that were dirty/maybe_dirty before being reset,
	* so they can be rescheduled if the branch survives.
	* @type {Map<Effect, { d: Effect[], m: Effect[] }>}
	*/
	#skipped_branches = /* @__PURE__ */ new Map();
	/**
	* Inverse of #skipped_branches which we need to tell prior batches to unskip them when committing
	* @type {Set<Effect>}
	*/
	#unskipped_branches = /* @__PURE__ */ new Set();
	is_fork = false;
	#decrement_queued = false;
	constructor() {
		if (last_batch === null) first_batch = last_batch = this;
		else {
			last_batch.#next = this;
			this.#prev = last_batch;
		}
		last_batch = this;
	}
	#is_deferred() {
		if (this.is_fork) return true;
		for (const effect of this.#blocking_pending.keys()) {
			var e = effect;
			var skipped = false;
			while (e.parent !== null) {
				if (this.#skipped_branches.has(e)) {
					skipped = true;
					break;
				}
				e = e.parent;
			}
			if (!skipped) return true;
		}
		return false;
	}
	/**
	* Add an effect to the #skipped_branches map and reset its children
	* @param {Effect} effect
	*/
	skip_effect(effect) {
		if (!this.#skipped_branches.has(effect)) this.#skipped_branches.set(effect, {
			d: [],
			m: []
		});
		this.#unskipped_branches.delete(effect);
	}
	/**
	* Remove an effect from the #skipped_branches map and reschedule
	* any tracked dirty/maybe_dirty child effects
	* @param {Effect} effect
	* @param {(e: Effect) => void} callback
	*/
	unskip_effect(effect, callback = (e) => this.schedule(e)) {
		var tracked = this.#skipped_branches.get(effect);
		if (tracked) {
			this.#skipped_branches.delete(effect);
			for (var e of tracked.d) {
				set_signal_status(e, DIRTY);
				callback(e);
			}
			for (e of tracked.m) {
				set_signal_status(e, MAYBE_DIRTY);
				callback(e);
			}
		}
		this.#unskipped_branches.add(effect);
	}
	#process() {
		this.#started = true;
		if (flush_count++ > 1e3) {
			this.#unlink();
			infinite_loop_guard();
		}
		for (const e of this.#dirty_effects) {
			this.#maybe_dirty_effects.delete(e);
			set_signal_status(e, DIRTY);
			this.schedule(e);
		}
		for (const e of this.#maybe_dirty_effects) {
			set_signal_status(e, MAYBE_DIRTY);
			this.schedule(e);
		}
		const roots = this.#roots;
		this.#roots = [];
		this.apply();
		/** @type {Effect[]} */
		var effects = collected_effects = [];
		/** @type {Effect[]} */
		var render_effects = [];
		/**
		* @type {Effect[]}
		* @deprecated when we get rid of legacy mode and stores, we can get rid of this
		*/
		var updates = legacy_updates = [];
		for (const root of roots) try {
			this.#traverse(root, effects, render_effects);
		} catch (e) {
			reset_all(root);
			if (!this.#is_deferred()) this.discard();
			throw e;
		}
		current_batch = null;
		if (updates.length > 0) {
			var batch = Batch.ensure();
			for (const e of updates) batch.schedule(e);
		}
		collected_effects = null;
		legacy_updates = null;
		if (this.#is_deferred()) {
			this.#defer_effects(render_effects);
			this.#defer_effects(effects);
			for (const [e, t] of this.#skipped_branches) reset_branch(e, t);
			if (updates.length > 0)
 /** @type {Batch} */ current_batch.#process();
			return;
		}
		const earlier_batch = this.#find_earlier_batch();
		if (earlier_batch) {
			this.#defer_effects(render_effects);
			this.#defer_effects(effects);
			earlier_batch.#merge(this);
			return;
		}
		this.#dirty_effects.clear();
		this.#maybe_dirty_effects.clear();
		for (const fn of this.#commit_callbacks) fn(this);
		this.#commit_callbacks.clear();
		previous_batch = this;
		flush_queued_effects(render_effects);
		flush_queued_effects(effects);
		previous_batch = null;
		this.#deferred?.resolve();
		var next_batch = current_batch;
		if (this.#pending === 0 && (this.#roots.length === 0 || next_batch !== null)) {
			this.#unlink();
			if (async_mode_flag) {
				this.#commit();
				current_batch = next_batch;
			}
		}
		if (this.#roots.length > 0) if (next_batch !== null) {
			const batch = next_batch;
			batch.#roots.push(...this.#roots.filter((r) => !batch.#roots.includes(r)));
		} else next_batch = this;
		if (next_batch !== null) next_batch.#process();
	}
	/**
	* Traverse the effect tree, executing effects or stashing
	* them for later execution as appropriate
	* @param {Effect} root
	* @param {Effect[]} effects
	* @param {Effect[]} render_effects
	*/
	#traverse(root, effects, render_effects) {
		root.f ^= CLEAN;
		var effect = root.first;
		while (effect !== null) {
			var flags = effect.f;
			var is_branch = (flags & 96) !== 0;
			if (!(is_branch && (flags & 1024) !== 0 || (flags & 8192) !== 0 || this.#skipped_branches.has(effect)) && effect.fn !== null) {
				if (is_branch) effect.f ^= CLEAN;
				else if ((flags & 4) !== 0) effects.push(effect);
				else if (async_mode_flag && (flags & 16777224) !== 0) render_effects.push(effect);
				else if (is_dirty(effect)) {
					if ((flags & 16) !== 0) this.#maybe_dirty_effects.add(effect);
					update_effect(effect);
				}
				var child = effect.first;
				if (child !== null) {
					effect = child;
					continue;
				}
			}
			while (effect !== null) {
				var next = effect.next;
				if (next !== null) {
					effect = next;
					break;
				}
				effect = effect.parent;
			}
		}
	}
	#find_earlier_batch() {
		var batch = this.#prev;
		while (batch !== null) {
			if (!batch.is_fork) {
				for (const [value, [, is_derived]] of this.current) if (batch.current.has(value) && !is_derived) return batch;
			}
			batch = batch.#prev;
		}
		return null;
	}
	/**
	* @param {Batch} batch
	*/
	#merge(batch) {
		for (const [source, value] of batch.current) {
			if (!this.previous.has(source) && batch.previous.has(source)) this.previous.set(source, batch.previous.get(source));
			this.current.set(source, value);
		}
		for (const [effect, deferred] of batch.async_deriveds) {
			const d = this.async_deriveds.get(effect);
			if (d) deferred.promise.then(d.resolve).catch(d.reject);
		}
		batch.async_deriveds.clear();
		this.transfer_effects(batch.#dirty_effects, batch.#maybe_dirty_effects);
		/**
		* mark all effects that depend on `batch.current`, except the
		* async effects that we just resolved (TODO unless they depend
		* on values in this batch that are NOT in the later batch?).
		* Through this we also will populate the correct #skipped_branches,
		* oncommit callbacks etc, so we don't need to merge them separately.
		* @param {Value} value
		*/
		const mark = (value) => {
			var reactions = value.reactions;
			if (reactions === null) return;
			for (const reaction of reactions) {
				var flags = reaction.f;
				if ((flags & 2) !== 0) mark(reaction);
				else {
					var effect = reaction;
					if (flags & 4194320 && !this.async_deriveds.has(effect)) {
						this.#maybe_dirty_effects.delete(effect);
						set_signal_status(effect, DIRTY);
						this.schedule(effect);
					}
				}
			}
		};
		for (const source of this.current.keys()) mark(source);
		this.oncommit(() => batch.discard());
		batch.#unlink();
		current_batch = this;
		this.#process();
	}
	/**
	* @param {Effect[]} effects
	*/
	#defer_effects(effects) {
		for (var i = 0; i < effects.length; i += 1) defer_effect(effects[i], this.#dirty_effects, this.#maybe_dirty_effects);
	}
	/**
	* Associate a change to a given source with the current
	* batch, noting its previous and current values
	* @param {Value} source
	* @param {any} value
	* @param {boolean} [is_derived]
	*/
	capture(source, value, is_derived = false) {
		if (source.v !== UNINITIALIZED && !this.previous.has(source)) this.previous.set(source, source.v);
		if ((source.f & 8388608) === 0) {
			this.current.set(source, [value, is_derived]);
			batch_values?.set(source, value);
		}
		if (!this.is_fork) source.v = value;
	}
	activate() {
		current_batch = this;
	}
	deactivate() {
		current_batch = null;
		batch_values = null;
	}
	flush() {
		try {
			is_processing = true;
			current_batch = this;
			this.#process();
		} finally {
			flush_count = 0;
			last_scheduled_effect = null;
			collected_effects = null;
			legacy_updates = null;
			is_processing = false;
			current_batch = null;
			batch_values = null;
			old_values.clear();
		}
	}
	discard() {
		for (const fn of this.#discard_callbacks) fn(this);
		this.#discard_callbacks.clear();
		for (const deferred of this.async_deriveds.values()) deferred.reject(OBSOLETE);
		this.#unlink();
		this.#deferred?.resolve();
	}
	/**
	* @param {Effect} effect
	*/
	register_created_effect(effect) {
		this.#new_effects.push(effect);
	}
	#commit() {
		for (let batch = first_batch; batch !== null; batch = batch.#next) {
			var is_earlier = batch.id < this.id;
			/** @type {Source[]} */
			var sources = [];
			for (const [source, [value, is_derived]] of this.current) {
				if (batch.current.has(source)) {
					var batch_value = batch.current.get(source)[0];
					if (is_earlier && value !== batch_value) batch.current.set(source, [value, is_derived]);
					else continue;
				}
				sources.push(source);
			}
			if (is_earlier) for (const [effect, deferred] of this.async_deriveds) {
				const d = batch.async_deriveds.get(effect);
				if (d) deferred.promise.then(d.resolve).catch(d.reject);
			}
			var current = [...batch.current.keys()].filter((source) => !batch.current.get(source)[1]);
			if (!batch.#started || current.length === 0) continue;
			var others = current.filter((source) => !this.current.has(source));
			if (others.length === 0) {
				if (is_earlier) batch.discard();
			} else if (sources.length > 0) {
				if (is_earlier) for (const unskipped of this.#unskipped_branches) batch.unskip_effect(unskipped, (e) => {
					if ((e.f & 4194320) !== 0) batch.schedule(e);
					else batch.#defer_effects([e]);
				});
				batch.activate();
				/** @type {Set<Value>} */
				var marked = /* @__PURE__ */ new Set();
				/** @type {Map<Reaction, boolean>} */
				var checked = /* @__PURE__ */ new Map();
				for (var source of sources) mark_effects(source, others, marked, checked);
				checked = /* @__PURE__ */ new Map();
				var current_unequal = [...batch.current].filter(([c, v1]) => {
					const v2 = this.current.get(c);
					if (!v2) return true;
					return v2[0] !== v1[0] || v2[1] !== v1[1];
				}).map(([c]) => c);
				if (current_unequal.length > 0) {
					for (const effect of this.#new_effects) if ((effect.f & 155648) === 0 && depends_on(effect, current_unequal, checked)) if ((effect.f & 4194320) !== 0) {
						set_signal_status(effect, DIRTY);
						batch.schedule(effect);
					} else batch.#dirty_effects.add(effect);
				}
				if (batch.#roots.length > 0 && !batch.#decrement_queued) {
					batch.apply();
					for (var root of batch.#roots) batch.#traverse(root, [], []);
					batch.#roots = [];
				}
				batch.deactivate();
			}
		}
	}
	/**
	* @param {boolean} blocking
	* @param {Effect} effect
	*/
	increment(blocking, effect) {
		this.#pending += 1;
		if (blocking) {
			let blocking_pending_count = this.#blocking_pending.get(effect) ?? 0;
			this.#blocking_pending.set(effect, blocking_pending_count + 1);
		}
	}
	/**
	* @param {boolean} blocking
	* @param {Effect} effect
	*/
	decrement(blocking, effect) {
		this.#pending -= 1;
		if (blocking) {
			let blocking_pending_count = this.#blocking_pending.get(effect) ?? 0;
			if (blocking_pending_count === 1) this.#blocking_pending.delete(effect);
			else this.#blocking_pending.set(effect, blocking_pending_count - 1);
		}
		if (this.#decrement_queued) return;
		this.#decrement_queued = true;
		queue_micro_task(() => {
			this.#decrement_queued = false;
			if (this.linked) this.flush();
		});
	}
	/**
	* @param {Set<Effect>} dirty_effects
	* @param {Set<Effect>} maybe_dirty_effects
	*/
	transfer_effects(dirty_effects, maybe_dirty_effects) {
		for (const e of dirty_effects) this.#dirty_effects.add(e);
		for (const e of maybe_dirty_effects) this.#maybe_dirty_effects.add(e);
		dirty_effects.clear();
		maybe_dirty_effects.clear();
	}
	/** @param {(batch: Batch) => void} fn */
	oncommit(fn) {
		this.#commit_callbacks.add(fn);
	}
	/** @param {(batch: Batch) => void} fn */
	ondiscard(fn) {
		this.#discard_callbacks.add(fn);
	}
	settled() {
		return (this.#deferred ??= deferred()).promise;
	}
	static ensure() {
		if (current_batch === null) {
			const batch = current_batch = new Batch();
			if (!is_processing && !is_flushing_sync) queue_micro_task(() => {
				if (!batch.#started) batch.flush();
			});
		}
		return current_batch;
	}
	apply() {
		if (!async_mode_flag || !this.is_fork && this.#prev === null && this.#next === null) {
			batch_values = null;
			return;
		}
		batch_values = /* @__PURE__ */ new Map();
		for (const [source, [value]] of this.current) batch_values.set(source, value);
		for (let batch = first_batch; batch !== null; batch = batch.#next) {
			if (batch === this || batch.is_fork) continue;
			var intersects = false;
			if (batch.id < this.id) for (const [source, [, is_derived]] of batch.current) {
				if (is_derived) continue;
				if (this.current.has(source)) {
					intersects = true;
					break;
				}
			}
			if (!intersects) {
				for (const [source, previous] of batch.previous) if (!batch_values.has(source)) batch_values.set(source, previous);
			}
		}
	}
	/**
	*
	* @param {Effect} effect
	*/
	schedule(effect) {
		last_scheduled_effect = effect;
		if (effect.b?.is_pending && (effect.f & 16777228) !== 0 && (effect.f & 32768) === 0) {
			effect.b.defer_effect(effect);
			return;
		}
		var e = effect;
		while (e.parent !== null) {
			e = e.parent;
			var flags = e.f;
			if (collected_effects !== null && e === active_effect) {
				if (async_mode_flag) return;
				if ((active_reaction === null || (active_reaction.f & 2) === 0) && !legacy_is_updating_store) return;
			}
			if ((flags & 96) !== 0) {
				if ((flags & 1024) === 0) return;
				e.f ^= CLEAN;
			}
		}
		this.#roots.push(e);
	}
	#unlink() {
		if (!this.linked) return;
		var prev = this.#prev;
		var next = this.#next;
		if (prev === null) first_batch = next;
		else prev.#next = next;
		if (next === null) last_batch = prev;
		else next.#prev = prev;
		this.linked = false;
	}
};
/**
* Synchronously flush any pending updates.
* Returns void if no callback is provided, otherwise returns the result of calling the callback.
* @template [T=void]
* @param {(() => T) | undefined} [fn]
* @returns {T}
*/
function flushSync(fn) {
	var was_flushing_sync = is_flushing_sync;
	is_flushing_sync = true;
	try {
		var result;
		if (fn) {
			if (current_batch !== null && !current_batch.is_fork) current_batch.flush();
			result = fn();
		}
		while (true) {
			flush_tasks();
			if (current_batch === null) return result;
			current_batch.flush();
		}
	} finally {
		is_flushing_sync = was_flushing_sync;
	}
}
function infinite_loop_guard() {
	try {
		effect_update_depth_exceeded();
	} catch (error) {
		invoke_error_boundary(error, last_scheduled_effect);
	}
}
/** @type {Set<Effect> | null} */
var eager_block_effects = null;
/**
* @param {Array<Effect>} effects
* @returns {void}
*/
function flush_queued_effects(effects) {
	var length = effects.length;
	if (length === 0) return;
	var i = 0;
	while (i < length) {
		var effect = effects[i++];
		if ((effect.f & 24576) === 0 && is_dirty(effect)) {
			eager_block_effects = /* @__PURE__ */ new Set();
			update_effect(effect);
			if (effect.deps === null && effect.first === null && effect.nodes === null && effect.teardown === null && effect.ac === null) unlink_effect(effect);
			if (eager_block_effects?.size > 0) {
				old_values.clear();
				for (const e of eager_block_effects) {
					if ((e.f & 24576) !== 0) continue;
					/** @type {Effect[]} */
					const ordered_effects = [e];
					let ancestor = e.parent;
					while (ancestor !== null) {
						if (eager_block_effects.has(ancestor)) {
							eager_block_effects.delete(ancestor);
							ordered_effects.push(ancestor);
						}
						ancestor = ancestor.parent;
					}
					for (let j = ordered_effects.length - 1; j >= 0; j--) {
						const e = ordered_effects[j];
						if ((e.f & 24576) !== 0) continue;
						update_effect(e);
					}
				}
				eager_block_effects.clear();
			}
		}
	}
	eager_block_effects = null;
}
/**
* This is similar to `mark_reactions`, but it only marks async/block effects
* depending on `value` and at least one of the other `sources`, so that
* these effects can re-run after another batch has been committed
* @param {Value} value
* @param {Source[]} sources
* @param {Set<Value>} marked
* @param {Map<Reaction, boolean>} checked
*/
function mark_effects(value, sources, marked, checked) {
	if (marked.has(value)) return;
	marked.add(value);
	if (value.reactions !== null) for (const reaction of value.reactions) {
		const flags = reaction.f;
		if ((flags & 2) !== 0) mark_effects(reaction, sources, marked, checked);
		else if ((flags & 4194320) !== 0 && (flags & 2048) === 0 && depends_on(reaction, sources, checked)) {
			set_signal_status(reaction, DIRTY);
			schedule_effect(reaction);
		}
	}
}
/**
* @param {Reaction} reaction
* @param {Source[]} sources
* @param {Map<Reaction, boolean>} checked
*/
function depends_on(reaction, sources, checked) {
	const depends = checked.get(reaction);
	if (depends !== void 0) return depends;
	if (reaction.deps !== null) for (const dep of reaction.deps) {
		if (includes.call(sources, dep)) return true;
		if ((dep.f & 2) !== 0 && depends_on(dep, sources, checked)) {
			checked.set(dep, true);
			return true;
		}
	}
	checked.set(reaction, false);
	return false;
}
/**
* @param {Effect} effect
* @returns {void}
*/
function schedule_effect(effect) {
	/** @type {Batch} */ current_batch.schedule(effect);
}
/**
* Mark all the effects inside a skipped branch CLEAN, so that
* they can be correctly rescheduled later. Tracks dirty and maybe_dirty
* effects so they can be rescheduled if the branch survives.
* @param {Effect} effect
* @param {{ d: Effect[], m: Effect[] }} tracked
*/
function reset_branch(effect, tracked) {
	if ((effect.f & 32) !== 0 && (effect.f & 1024) !== 0) return;
	if ((effect.f & 2048) !== 0) tracked.d.push(effect);
	else if ((effect.f & 4096) !== 0) tracked.m.push(effect);
	set_signal_status(effect, CLEAN);
	var e = effect.first;
	while (e !== null) {
		reset_branch(e, tracked);
		e = e.next;
	}
}
/**
* Mark an entire effect tree clean following an error
* @param {Effect} effect
*/
function reset_all(effect) {
	set_signal_status(effect, CLEAN);
	var e = effect.first;
	while (e !== null) {
		reset_all(e);
		e = e.next;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/sources.js
/** @import { Derived, Effect, Source, Value } from '#client' */
/** @type {Set<Effect>} */
var eager_effects = /* @__PURE__ */ new Set();
/** @type {Map<Source, any>} */
var old_values = /* @__PURE__ */ new Map();
var eager_effects_deferred = false;
/**
* @template V
* @param {V} v
* @param {Error | null} [stack]
* @returns {Source<V>}
*/
function source(v, stack) {
	return {
		f: 0,
		v,
		reactions: null,
		equals,
		rv: 0,
		wv: 0
	};
}
/**
* @template V
* @param {V} v
* @param {Error | null} [stack]
*/
/*#__NO_SIDE_EFFECTS__*/
function state(v, stack) {
	const s = source(v, stack);
	push_reaction_value(s);
	return s;
}
/**
* @template V
* @param {V} initial_value
* @param {boolean} [immutable]
* @returns {Source<V>}
*/
/*#__NO_SIDE_EFFECTS__*/
function mutable_source(initial_value, immutable = false, trackable = true) {
	const s = source(initial_value);
	if (!immutable) s.equals = safe_equals;
	if (legacy_mode_flag && trackable && component_context !== null && component_context.l !== null) (component_context.l.s ??= []).push(s);
	return s;
}
/**
* @template V
* @param {Source<V>} source
* @param {V} value
* @param {boolean} [should_proxy]
* @returns {V}
*/
function set(source, value, should_proxy = false) {
	if (active_reaction !== null && (!untracking || (active_reaction.f & 131072) !== 0) && is_runes() && (active_reaction.f & 4325394) !== 0 && (current_sources === null || !current_sources.has(source))) state_unsafe_mutation();
	return internal_set(source, should_proxy ? proxy(value) : value, legacy_updates);
}
/**
* @template V
* @param {Source<V>} source
* @param {V} value
* @param {Effect[] | null} [updated_during_traversal]
* @returns {V}
*/
function internal_set(source, value, updated_during_traversal = null) {
	if (!source.equals(value)) {
		old_values.set(source, is_destroying_effect ? value : source.v);
		var batch = Batch.ensure();
		batch.capture(source, value);
		if ((source.f & 2) !== 0) {
			const derived = source;
			if ((source.f & 2048) !== 0) execute_derived(derived);
			if (batch_values === null) update_derived_status(derived);
		}
		source.wv = increment_write_version();
		mark_reactions(source, DIRTY, updated_during_traversal);
		if (is_runes() && active_effect !== null && (active_effect.f & 1024) !== 0 && (active_effect.f & 96) === 0) if (untracked_writes === null) set_untracked_writes([source]);
		else untracked_writes.push(source);
		if (!batch.is_fork && eager_effects.size > 0 && !eager_effects_deferred) flush_eager_effects();
	}
	return value;
}
function flush_eager_effects() {
	eager_effects_deferred = false;
	for (const effect of eager_effects) {
		if ((effect.f & 1024) !== 0) set_signal_status(effect, MAYBE_DIRTY);
		let dirty;
		try {
			dirty = is_dirty(effect);
		} catch {
			dirty = true;
		}
		if (dirty) update_effect(effect);
	}
	eager_effects.clear();
}
/**
* @template {number | bigint} T
* @param {Source<T>} source
* @param {1 | -1} [d]
* @returns {T}
*/
function update(source, d = 1) {
	var value = get(source);
	var result = d === 1 ? value++ : value--;
	set(source, value);
	return result;
}
/**
* Silently (without using `get`) increment a source
* @param {Source<number>} source
*/
function increment(source) {
	set(source, source.v + 1);
}
/**
* @param {Value} signal
* @param {number} status should be DIRTY or MAYBE_DIRTY
* @param {Effect[] | null} updated_during_traversal
* @returns {void}
*/
function mark_reactions(signal, status, updated_during_traversal) {
	var reactions = signal.reactions;
	if (reactions === null) return;
	var runes = is_runes();
	var length = reactions.length;
	for (var i = 0; i < length; i++) {
		var reaction = reactions[i];
		var flags = reaction.f;
		if (!runes && reaction === active_effect) continue;
		var not_dirty = (flags & DIRTY) === 0;
		if (not_dirty) set_signal_status(reaction, status);
		if ((flags & 131072) !== 0) eager_effects.add(reaction);
		else if ((flags & 2) !== 0) {
			var derived = reaction;
			batch_values?.delete(derived);
			if ((flags & 65536) === 0) {
				if (flags & 512 && (active_effect === null || (active_effect.f & 2097152) === 0)) reaction.f |= WAS_MARKED;
				mark_reactions(derived, MAYBE_DIRTY, updated_during_traversal);
			}
		} else if (not_dirty) {
			var effect = reaction;
			if ((flags & 16) !== 0 && eager_block_effects !== null) eager_block_effects.add(effect);
			if (updated_during_traversal !== null) updated_during_traversal.push(effect);
			else schedule_effect(effect);
		}
	}
}
/**
* @template T
* @param {T} value
* @returns {T}
*/
function proxy(value) {
	if (typeof value !== "object" || value === null || STATE_SYMBOL in value) return value;
	const prototype = get_prototype_of(value);
	if (prototype !== object_prototype && prototype !== array_prototype) return value;
	/** @type {Map<any, Source<any>>} */
	var sources = /* @__PURE__ */ new Map();
	var is_proxied_array = is_array(value);
	var version = /* @__PURE__ */ state(0);
	var stack = null;
	var parent_version = update_version;
	/**
	* Executes the proxy in the context of the reaction it was originally created in, if any
	* @template T
	* @param {() => T} fn
	*/
	var with_parent = (fn) => {
		if (update_version === parent_version) return fn();
		var reaction = active_reaction;
		var version = update_version;
		set_active_reaction(null);
		set_update_version(parent_version);
		var result = fn();
		set_active_reaction(reaction);
		set_update_version(version);
		return result;
	};
	if (is_proxied_array) sources.set("length", /* @__PURE__ */ state(
		/** @type {any[]} */
		value.length,
		stack
	));
	return new Proxy(value, {
		defineProperty(_, prop, descriptor) {
			if (!("value" in descriptor) || descriptor.configurable === false || descriptor.enumerable === false || descriptor.writable === false) state_descriptors_fixed();
			var s = sources.get(prop);
			if (s === void 0) with_parent(() => {
				var s = /* @__PURE__ */ state(descriptor.value, stack);
				sources.set(prop, s);
				return s;
			});
			else set(s, descriptor.value, true);
			return true;
		},
		deleteProperty(target, prop) {
			var s = sources.get(prop);
			if (s === void 0) {
				if (prop in target) {
					const s = with_parent(() => /* @__PURE__ */ state(UNINITIALIZED, stack));
					sources.set(prop, s);
					increment(version);
				}
			} else {
				set(s, UNINITIALIZED);
				increment(version);
			}
			return true;
		},
		get(target, prop, receiver) {
			if (prop === STATE_SYMBOL) return value;
			var s = sources.get(prop);
			var exists = prop in target;
			if (s === void 0 && (!exists || get_descriptor(target, prop)?.writable)) {
				s = with_parent(() => {
					return /* @__PURE__ */ state(proxy(exists ? target[prop] : UNINITIALIZED), stack);
				});
				sources.set(prop, s);
			}
			if (s !== void 0) {
				var v = get(s);
				return v === UNINITIALIZED ? void 0 : v;
			}
			return Reflect.get(target, prop, receiver);
		},
		getOwnPropertyDescriptor(target, prop) {
			var descriptor = Reflect.getOwnPropertyDescriptor(target, prop);
			if (descriptor && "value" in descriptor) {
				var s = sources.get(prop);
				if (s) descriptor.value = get(s);
			} else if (descriptor === void 0) {
				var source = sources.get(prop);
				var value = source?.v;
				if (source !== void 0 && value !== UNINITIALIZED) return {
					enumerable: true,
					configurable: true,
					value,
					writable: true
				};
			}
			return descriptor;
		},
		has(target, prop) {
			if (prop === STATE_SYMBOL) return true;
			var s = sources.get(prop);
			var has = s !== void 0 && s.v !== UNINITIALIZED || Reflect.has(target, prop);
			if (s !== void 0 || active_effect !== null && (!has || get_descriptor(target, prop)?.writable)) {
				if (s === void 0) {
					s = with_parent(() => {
						return /* @__PURE__ */ state(has ? proxy(target[prop]) : UNINITIALIZED, stack);
					});
					sources.set(prop, s);
				}
				if (get(s) === UNINITIALIZED) return false;
			}
			return has;
		},
		set(target, prop, value, receiver) {
			var s = sources.get(prop);
			var has = prop in target;
			if (is_proxied_array && prop === "length") for (var i = value; i < s.v; i += 1) {
				var other_s = sources.get(i + "");
				if (other_s !== void 0) set(other_s, UNINITIALIZED);
				else if (i in target) {
					other_s = with_parent(() => /* @__PURE__ */ state(UNINITIALIZED, stack));
					sources.set(i + "", other_s);
				}
			}
			if (s === void 0) {
				if (!has || get_descriptor(target, prop)?.writable) {
					s = with_parent(() => /* @__PURE__ */ state(void 0, stack));
					set(s, proxy(value));
					sources.set(prop, s);
				}
			} else {
				has = s.v !== UNINITIALIZED;
				var p = with_parent(() => proxy(value));
				set(s, p);
			}
			var descriptor = Reflect.getOwnPropertyDescriptor(target, prop);
			if (descriptor?.set) descriptor.set.call(receiver, value);
			if (!has) {
				if (is_proxied_array && typeof prop === "string") {
					var ls = sources.get("length");
					var n = Number(prop);
					if (Number.isInteger(n) && n >= ls.v) set(ls, n + 1);
				}
				increment(version);
			}
			return true;
		},
		ownKeys(target) {
			get(version);
			var own_keys = Reflect.ownKeys(target).filter((key) => {
				var source = sources.get(key);
				return source === void 0 || source.v !== UNINITIALIZED;
			});
			for (var [key, source] of sources) if (source.v !== UNINITIALIZED && !(key in target)) own_keys.push(key);
			return own_keys;
		},
		setPrototypeOf() {
			state_prototype_fixed();
		}
	});
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/operations.js
/** @import { Effect, TemplateNode } from '#client' */
/** @type {Window} */
var $window;
/** @type {boolean} */
var is_firefox;
/** @type {() => Node | null} */
var first_child_getter;
/** @type {() => Node | null} */
var next_sibling_getter;
/**
* Initialize these lazily to avoid issues when using the runtime in a server context
* where these globals are not available while avoiding a separate server entry point
*/
function init_operations() {
	if ($window !== void 0) return;
	$window = window;
	is_firefox = /Firefox/.test(navigator.userAgent);
	var element_prototype = Element.prototype;
	var node_prototype = Node.prototype;
	var text_prototype = Text.prototype;
	first_child_getter = get_descriptor(node_prototype, "firstChild").get;
	next_sibling_getter = get_descriptor(node_prototype, "nextSibling").get;
	if (is_extensible(element_prototype)) {
		/** @type {any} */ element_prototype[CLASS_CACHE] = void 0;
		/** @type {any} */ element_prototype[ATTRIBUTES_CACHE] = null;
		/** @type {any} */ element_prototype[STYLE_CACHE] = void 0;
		element_prototype.__e = void 0;
	}
	if (is_extensible(text_prototype))
 /** @type {any} */ text_prototype[TEXT_CACHE] = void 0;
}
/**
* @param {string} value
* @returns {Text}
*/
function create_text(value = "") {
	return document.createTextNode(value);
}
/**
* @template {Node} N
* @param {N} node
*/
/*@__NO_SIDE_EFFECTS__*/
function get_first_child(node) {
	return first_child_getter.call(node);
}
/**
* @template {Node} N
* @param {N} node
*/
/*@__NO_SIDE_EFFECTS__*/
function get_next_sibling(node) {
	return next_sibling_getter.call(node);
}
/**
* Don't mark this as side-effect-free, hydration needs to walk all nodes
* @template {Node} N
* @param {N} node
* @param {boolean} is_text
* @returns {TemplateNode | null}
*/
function child(node, is_text) {
	if (!hydrating) return /* @__PURE__ */ get_first_child(node);
	var child = /* @__PURE__ */ get_first_child(hydrate_node);
	if (child === null) child = hydrate_node.appendChild(create_text());
	else if (is_text && child.nodeType !== 3) {
		var text = create_text();
		child?.before(text);
		set_hydrate_node(text);
		return text;
	}
	if (is_text) merge_text_nodes(child);
	set_hydrate_node(child);
	return child;
}
/**
* Don't mark this as side-effect-free, hydration needs to walk all nodes
* @param {TemplateNode} node
* @param {boolean} [is_text]
* @returns {TemplateNode | null}
*/
function first_child(node, is_text = false) {
	if (!hydrating) {
		var first = /* @__PURE__ */ get_first_child(node);
		if (first instanceof Comment && first.data === "") return /* @__PURE__ */ get_next_sibling(first);
		return first;
	}
	if (is_text) {
		if (hydrate_node?.nodeType !== 3) {
			var text = create_text();
			hydrate_node?.before(text);
			set_hydrate_node(text);
			return text;
		}
		merge_text_nodes(hydrate_node);
	}
	return hydrate_node;
}
/**
* Don't mark this as side-effect-free, hydration needs to walk all nodes
* @param {TemplateNode} node
* @param {number} count
* @param {boolean} is_text
* @returns {TemplateNode | null}
*/
function sibling(node, count = 1, is_text = false) {
	let next_sibling = hydrating ? hydrate_node : node;
	var last_sibling;
	while (count--) {
		last_sibling = next_sibling;
		next_sibling = /* @__PURE__ */ get_next_sibling(next_sibling);
	}
	if (!hydrating) return next_sibling;
	if (is_text) {
		if (next_sibling?.nodeType !== 3) {
			var text = create_text();
			if (next_sibling === null) last_sibling?.after(text);
			else next_sibling.before(text);
			set_hydrate_node(text);
			return text;
		}
		merge_text_nodes(next_sibling);
	}
	set_hydrate_node(next_sibling);
	return next_sibling;
}
/**
* @template {Node} N
* @param {N} node
* @returns {void}
*/
function clear_text_content(node) {
	node.textContent = "";
}
/**
* Returns `true` if we're updating the current block, for example `condition` in
* an `{#if condition}` block just changed. In this case, the branch should be
* appended (or removed) at the same time as other updates within the
* current `<svelte:boundary>`
*/
function should_defer_append() {
	if (!async_mode_flag) return false;
	if (eager_block_effects !== null) return false;
	return (active_effect.f & REACTION_RAN) !== 0;
}
/**
* Branching here is intentional and load-bearing for perf. `createElement(tag)`
* hits a fast path in Blink that `createElementNS(NAMESPACE_HTML, tag)` doesn't,
* and passing an explicit `undefined` as the trailing options arg measurably
* slows both APIs. Funnelling every case through a single `createElementNS(ns,
* tag, options)` call would be smaller but slower on the HTML path.
*
* @template {keyof HTMLElementTagNameMap | string} T
* @param {T} tag
* @param {string} [namespace]
* @param {string} [is]
* @returns {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element}
*/
function create_element(tag, namespace, is) {
	if (namespace == null || namespace === "http://www.w3.org/1999/xhtml") return is ? document.createElement(tag, { is }) : document.createElement(tag);
	return is ? document.createElementNS(namespace, tag, { is }) : document.createElementNS(namespace, tag);
}
/**
* Browsers split text nodes larger than 65536 bytes when parsing.
* For hydration to succeed, we need to stitch them back together
* @param {Text} text
*/
function merge_text_nodes(text) {
	if (text.nodeValue.length < 65536) return;
	let next = text.nextSibling;
	while (next !== null && next.nodeType === 3) {
		next.remove();
		/** @type {string} */ text.nodeValue += next.nodeValue;
		next = text.nextSibling;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/misc.js
var listening_to_form_reset = false;
function add_form_reset_listener() {
	if (!listening_to_form_reset) {
		listening_to_form_reset = true;
		document.addEventListener("reset", (evt) => {
			Promise.resolve().then(() => {
				if (!evt.defaultPrevented) for (const e of evt.target.elements)
 /** @type {any} */ e[FORM_RESET_HANDLER]?.();
			});
		}, { capture: true });
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
/**
* @template T
* @param {() => T} fn
*/
function without_reactive_context(fn) {
	var previous_reaction = active_reaction;
	var previous_effect = active_effect;
	set_active_reaction(null);
	set_active_effect(null);
	try {
		return fn();
	} finally {
		set_active_reaction(previous_reaction);
		set_active_effect(previous_effect);
	}
}
/**
* Listen to the given event, and then instantiate a global form reset listener if not already done,
* to notify all bindings when the form is reset
* @param {HTMLElement} element
* @param {string} event
* @param {(is_reset?: true) => void} handler
* @param {(is_reset?: true) => void} [on_reset]
*/
function listen_to_event_and_reset_event(element, event, handler, on_reset = handler) {
	element.addEventListener(event, () => without_reactive_context(handler));
	const prev = element[FORM_RESET_HANDLER];
	if (prev)
 /** @type {any} */ element[FORM_RESET_HANDLER] = () => {
		prev();
		on_reset(true);
	};
	else
 /** @type {any} */ element[FORM_RESET_HANDLER] = () => on_reset(true);
	add_form_reset_listener();
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/effects.js
/** @import { Blocker, ComponentContext, ComponentContextLegacy, Derived, Effect, TemplateNode, TransitionManager } from '#client' */
/**
* @param {'$effect' | '$effect.pre' | '$inspect'} rune
*/
function validate_effect(rune) {
	if (active_effect === null) {
		if (active_reaction === null) effect_orphan(rune);
		effect_in_unowned_derived();
	}
	if (is_destroying_effect) effect_in_teardown(rune);
}
/**
* @param {Effect} effect
* @param {Effect} parent_effect
*/
function push_effect(effect, parent_effect) {
	var parent_last = parent_effect.last;
	if (parent_last === null) parent_effect.last = parent_effect.first = effect;
	else {
		parent_last.next = effect;
		effect.prev = parent_last;
		parent_effect.last = effect;
	}
}
/**
* @param {number} type
* @param {null | (() => void | (() => void))} fn
* @returns {Effect}
*/
function create_effect(type, fn) {
	var parent = active_effect;
	if (parent !== null && (parent.f & 8192) !== 0) type |= INERT;
	/** @type {Effect} */
	var effect = {
		ctx: component_context,
		deps: null,
		nodes: null,
		f: type | DIRTY | 512,
		first: null,
		fn,
		last: null,
		next: null,
		parent,
		b: parent && parent.b,
		prev: null,
		teardown: null,
		wv: 0,
		ac: null
	};
	current_batch?.register_created_effect(effect);
	/** @type {Effect | null} */
	var e = effect;
	if ((type & 4) !== 0) if (collected_effects !== null) collected_effects.push(effect);
	else Batch.ensure().schedule(effect);
	else if (fn !== null) {
		try {
			update_effect(effect);
		} catch (e) {
			destroy_effect(effect);
			throw e;
		}
		if (e.deps === null && e.teardown === null && e.nodes === null && e.first === e.last && (e.f & 524288) === 0) {
			e = e.first;
			if ((type & 16) !== 0 && (type & 65536) !== 0 && e !== null) e.f |= EFFECT_TRANSPARENT;
		}
	}
	if (e !== null) {
		e.parent = parent;
		if (parent !== null) push_effect(e, parent);
		if (active_reaction !== null && (active_reaction.f & 2) !== 0 && (type & 64) === 0) {
			var derived = active_reaction;
			(derived.effects ??= []).push(e);
		}
	}
	return effect;
}
/**
* Internal representation of `$effect.tracking()`
* @returns {boolean}
*/
function effect_tracking() {
	return active_reaction !== null && !untracking;
}
/**
* @param {() => void} fn
*/
function teardown(fn) {
	const effect = create_effect(8, null);
	set_signal_status(effect, CLEAN);
	effect.teardown = fn;
	return effect;
}
/**
* Internal representation of `$effect(...)`
* @param {() => void | (() => void)} fn
*/
function user_effect(fn) {
	validate_effect("$effect");
	var flags = active_effect.f;
	if (!active_reaction && (flags & 32) !== 0 && component_context !== null && !component_context.i) {
		var context = component_context;
		(context.e ??= []).push(fn);
	} else return create_user_effect(fn);
}
/**
* @param {() => void | (() => void)} fn
*/
function create_user_effect(fn) {
	return create_effect(4 | USER_EFFECT, fn);
}
/**
* Internal representation of `$effect.pre(...)`
* @param {() => void | (() => void)} fn
* @returns {Effect}
*/
function user_pre_effect(fn) {
	validate_effect("$effect.pre");
	return create_effect(8 | USER_EFFECT, fn);
}
/**
* An effect root whose children can transition out
* @param {() => void} fn
* @returns {(options?: { outro?: boolean }) => Promise<void>}
*/
function component_root(fn) {
	Batch.ensure();
	const effect = create_effect(64 | EFFECT_PRESERVED, fn);
	return (options = {}) => {
		return new Promise((fulfil) => {
			if (options.outro) pause_effect(effect, () => {
				destroy_effect(effect);
				fulfil(void 0);
			});
			else {
				destroy_effect(effect);
				fulfil(void 0);
			}
		});
	};
}
/**
* @param {() => void | (() => void)} fn
* @returns {Effect}
*/
function effect(fn) {
	return create_effect(4, fn);
}
/**
* @param {() => void | (() => void)} fn
* @returns {Effect}
*/
function async_effect(fn) {
	return create_effect(ASYNC | EFFECT_PRESERVED, fn);
}
/**
* @param {() => void | (() => void)} fn
* @returns {Effect}
*/
function render_effect(fn, flags = 0) {
	return create_effect(8 | flags, fn);
}
/**
* @param {(...expressions: any) => void | (() => void)} fn
* @param {Array<() => any>} sync
* @param {Array<() => Promise<any>>} async
* @param {Blocker[]} blockers
*/
function template_effect(fn, sync = [], async = [], blockers = []) {
	flatten(blockers, sync, async, (values) => {
		create_effect(8, () => {
			fn(...values.map(get));
		});
	});
}
/**
* @param {(() => void)} fn
* @param {number} flags
*/
function block(fn, flags = 0) {
	return create_effect(16 | flags, fn);
}
/**
* @param {(() => void)} fn
*/
function branch(fn) {
	return create_effect(32 | EFFECT_PRESERVED, fn);
}
/**
* @param {Effect} effect
*/
function execute_effect_teardown(effect) {
	var teardown = effect.teardown;
	if (teardown !== null) {
		const previously_destroying_effect = is_destroying_effect;
		const previous_reaction = active_reaction;
		set_is_destroying_effect(true);
		set_active_reaction(null);
		try {
			teardown.call(null);
		} finally {
			set_is_destroying_effect(previously_destroying_effect);
			set_active_reaction(previous_reaction);
		}
	}
}
/**
* @param {Effect} signal
* @param {boolean} remove_dom
* @returns {void}
*/
function destroy_effect_children(signal, remove_dom = false) {
	var effect = signal.first;
	signal.first = signal.last = null;
	while (effect !== null) {
		const controller = effect.ac;
		if (controller !== null) without_reactive_context(() => {
			controller.abort(STALE_REACTION);
		});
		var next = effect.next;
		if ((effect.f & 64) !== 0) effect.parent = null;
		else destroy_effect(effect, remove_dom);
		effect = next;
	}
}
/**
* @param {Effect} signal
* @returns {void}
*/
function destroy_block_effect_children(signal) {
	var effect = signal.first;
	while (effect !== null) {
		var next = effect.next;
		if ((effect.f & 32) === 0) destroy_effect(effect);
		effect = next;
	}
}
/**
* @param {Effect} effect
* @param {boolean} [remove_dom]
* @returns {void}
*/
function destroy_effect(effect, remove_dom = true) {
	var removed = false;
	if ((remove_dom || (effect.f & 262144) !== 0) && effect.nodes !== null && effect.nodes.end !== null) {
		remove_effect_dom(effect.nodes.start, effect.nodes.end);
		removed = true;
	}
	effect.f |= DESTROYING;
	destroy_effect_children(effect, remove_dom && !removed);
	remove_reactions(effect, 0);
	var transitions = effect.nodes && effect.nodes.t;
	if (transitions !== null) for (const transition of transitions) transition.stop();
	execute_effect_teardown(effect);
	effect.f ^= DESTROYING;
	effect.f |= DESTROYED;
	var parent = effect.parent;
	if (parent !== null && parent.first !== null) unlink_effect(effect);
	effect.next = effect.prev = effect.teardown = effect.ctx = effect.deps = effect.fn = effect.nodes = effect.ac = effect.b = null;
}
/**
*
* @param {TemplateNode | null} node
* @param {TemplateNode} end
*/
function remove_effect_dom(node, end) {
	while (node !== null) {
		/** @type {TemplateNode | null} */
		var next = node === end ? null : /* @__PURE__ */ get_next_sibling(node);
		node.remove();
		node = next;
	}
}
/**
* Detach an effect from the effect tree, freeing up memory and
* reducing the amount of work that happens on subsequent traversals
* @param {Effect} effect
*/
function unlink_effect(effect) {
	var parent = effect.parent;
	var prev = effect.prev;
	var next = effect.next;
	if (prev !== null) prev.next = next;
	if (next !== null) next.prev = prev;
	if (parent !== null) {
		if (parent.first === effect) parent.first = next;
		if (parent.last === effect) parent.last = prev;
	}
}
/**
* When a block effect is removed, we don't immediately destroy it or yank it
* out of the DOM, because it might have transitions. Instead, we 'pause' it.
* It stays around (in memory, and in the DOM) until outro transitions have
* completed, and if the state change is reversed then we _resume_ it.
* A paused effect does not update, and the DOM subtree becomes inert.
* @param {Effect} effect
* @param {() => void} [callback]
* @param {boolean} [destroy]
*/
function pause_effect(effect, callback, destroy = true) {
	/** @type {TransitionManager[]} */
	var transitions = [];
	pause_children(effect, transitions, true);
	var fn = () => {
		if (destroy) destroy_effect(effect);
		if (callback) callback();
	};
	var remaining = transitions.length;
	if (remaining > 0) {
		var check = () => --remaining || fn();
		for (var transition of transitions) transition.out(check);
	} else fn();
}
/**
* @param {Effect} effect
* @param {TransitionManager[]} transitions
* @param {boolean} local
*/
function pause_children(effect, transitions, local) {
	if ((effect.f & 8192) !== 0) return;
	effect.f ^= INERT;
	var t = effect.nodes && effect.nodes.t;
	if (t !== null) {
		for (const transition of t) if (transition.is_global || local) transitions.push(transition);
	}
	var child = effect.first;
	while (child !== null) {
		var sibling = child.next;
		if ((child.f & 64) === 0) {
			var transparent = (child.f & 65536) !== 0 || (child.f & 32) !== 0 && (effect.f & 16) !== 0;
			pause_children(child, transitions, transparent ? local : false);
		}
		child = sibling;
	}
}
/**
* The opposite of `pause_effect`. We call this if (for example)
* `x` becomes falsy then truthy: `{#if x}...{/if}`
* @param {Effect} effect
*/
function resume_effect(effect) {
	resume_children(effect, true);
}
/**
* @param {Effect} effect
* @param {boolean} local
*/
function resume_children(effect, local) {
	if ((effect.f & 8192) === 0) return;
	effect.f ^= INERT;
	if ((effect.f & 1024) === 0) {
		set_signal_status(effect, DIRTY);
		Batch.ensure().schedule(effect);
	}
	var child = effect.first;
	while (child !== null) {
		var sibling = child.next;
		var transparent = (child.f & 65536) !== 0 || (child.f & 32) !== 0;
		resume_children(child, transparent ? local : false);
		child = sibling;
	}
	var t = effect.nodes && effect.nodes.t;
	if (t !== null) {
		for (const transition of t) if (transition.is_global || local) transition.in();
	}
}
/**
* @param {Effect} effect
* @param {DocumentFragment} fragment
*/
function move_effect(effect, fragment) {
	if (!effect.nodes) return;
	/** @type {TemplateNode | null} */
	var node = effect.nodes.start;
	var end = effect.nodes.end;
	while (node !== null) {
		/** @type {TemplateNode | null} */
		var next = node === end ? null : /* @__PURE__ */ get_next_sibling(node);
		fragment.append(node);
		node = next;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/legacy.js
/**
* @type {Set<Value> | null}
* @deprecated
*/
var captured_signals = null;
//#endregion
//#region node_modules/svelte/src/internal/client/runtime.js
/** @import { Derived, Effect, Reaction, Source, Value } from '#client' */
var is_updating_effect = false;
var is_destroying_effect = false;
/** @param {boolean} value */
function set_is_destroying_effect(value) {
	is_destroying_effect = value;
}
/** @type {null | Reaction} */
var active_reaction = null;
var untracking = false;
/** @param {null | Reaction} reaction */
function set_active_reaction(reaction) {
	active_reaction = reaction;
}
/** @type {null | Effect} */
var active_effect = null;
/** @param {null | Effect} effect */
function set_active_effect(effect) {
	active_effect = effect;
}
/**
* When sources are created within a reaction, reading and writing
* them within that reaction should not cause a re-run
* @type {null | Set<Source>}
*/
var current_sources = null;
/** @param {Value} value */
function push_reaction_value(value) {
	if (active_reaction !== null && (!async_mode_flag || (active_reaction.f & 2) !== 0)) (current_sources ??= /* @__PURE__ */ new Set()).add(value);
}
/**
* The dependencies of the reaction that is currently being executed. In many cases,
* the dependencies are unchanged between runs, and so this will be `null` unless
* and until a new dependency is accessed — we track this via `skipped_deps`
* @type {null | Value[]}
*/
var new_deps = null;
var skipped_deps = 0;
/**
* Tracks writes that the effect it's executed in doesn't listen to yet,
* so that the dependency can be added to the effect later on if it then reads it
* @type {null | Source[]}
*/
var untracked_writes = null;
/** @param {null | Source[]} value */
function set_untracked_writes(value) {
	untracked_writes = value;
}
/**
* @type {number} Used by sources and deriveds for handling updates.
* Version starts from 1 so that unowned deriveds differentiate between a created effect and a run one for tracing
**/
var write_version = 1;
/** @type {number} Used to version each read of a source of derived to avoid duplicating depedencies inside a reaction */
var read_version = 0;
var update_version = read_version;
/** @param {number} value */
function set_update_version(value) {
	update_version = value;
}
function increment_write_version() {
	return ++write_version;
}
/**
* Determines whether a derived or effect is dirty.
* If it is MAYBE_DIRTY, will set the status to CLEAN
* @param {Reaction} reaction
* @returns {boolean}
*/
function is_dirty(reaction) {
	var flags = reaction.f;
	if ((flags & 2048) !== 0) return true;
	if (flags & 2) reaction.f &= ~WAS_MARKED;
	if ((flags & 4096) !== 0) {
		var dependencies = reaction.deps;
		var length = dependencies.length;
		for (var i = 0; i < length; i++) {
			var dependency = dependencies[i];
			if (is_dirty(dependency)) update_derived(dependency);
			if (dependency.wv > reaction.wv) return true;
		}
		if ((flags & 512) !== 0 && batch_values === null) set_signal_status(reaction, CLEAN);
	}
	return false;
}
/**
* @param {Value} signal
* @param {Effect} effect
* @param {boolean} [root]
*/
function schedule_possible_effect_self_invalidation(signal, effect, root = true) {
	var reactions = signal.reactions;
	if (reactions === null) return;
	if (!async_mode_flag && current_sources !== null && current_sources.has(signal)) return;
	for (var i = 0; i < reactions.length; i++) {
		var reaction = reactions[i];
		if ((reaction.f & 2) !== 0) schedule_possible_effect_self_invalidation(reaction, effect, false);
		else if (effect === reaction) {
			if (root) set_signal_status(reaction, DIRTY);
			else if ((reaction.f & 1024) !== 0) set_signal_status(reaction, MAYBE_DIRTY);
			schedule_effect(reaction);
		}
	}
}
/** @param {Reaction} reaction */
function update_reaction(reaction) {
	var previous_deps = new_deps;
	var previous_skipped_deps = skipped_deps;
	var previous_untracked_writes = untracked_writes;
	var previous_reaction = active_reaction;
	var previous_sources = current_sources;
	var previous_component_context = component_context;
	var previous_untracking = untracking;
	var previous_update_version = update_version;
	var flags = reaction.f;
	new_deps = null;
	skipped_deps = 0;
	untracked_writes = null;
	active_reaction = (flags & 96) === 0 ? reaction : null;
	current_sources = null;
	set_component_context(reaction.ctx);
	untracking = false;
	update_version = ++read_version;
	if (reaction.ac !== null) {
		without_reactive_context(() => {
			/** @type {AbortController} */ reaction.ac.abort(STALE_REACTION);
		});
		reaction.ac = null;
	}
	try {
		reaction.f |= REACTION_IS_UPDATING;
		var fn = reaction.fn;
		var result = fn();
		reaction.f |= REACTION_RAN;
		var deps = reaction.deps;
		var is_fork = current_batch?.is_fork;
		if (new_deps !== null) {
			var i;
			if (!is_fork) remove_reactions(reaction, skipped_deps);
			if (deps !== null && skipped_deps > 0) {
				deps.length = skipped_deps + new_deps.length;
				for (i = 0; i < new_deps.length; i++) deps[skipped_deps + i] = new_deps[i];
			} else reaction.deps = deps = new_deps;
			if (effect_tracking() && (reaction.f & 512) !== 0) for (i = skipped_deps; i < deps.length; i++) (deps[i].reactions ??= []).push(reaction);
		} else if (!is_fork && deps !== null && skipped_deps < deps.length) {
			remove_reactions(reaction, skipped_deps);
			deps.length = skipped_deps;
		}
		if (is_runes() && untracked_writes !== null && !untracking && deps !== null && (reaction.f & 6146) === 0) for (i = 0; i < untracked_writes.length; i++) schedule_possible_effect_self_invalidation(untracked_writes[i], reaction);
		if (previous_reaction !== null && previous_reaction !== reaction) {
			read_version++;
			if (previous_reaction.deps !== null) for (let i = 0; i < previous_skipped_deps; i += 1) previous_reaction.deps[i].rv = read_version;
			if (previous_deps !== null) for (const dep of previous_deps) dep.rv = read_version;
			if (untracked_writes !== null) if (previous_untracked_writes === null) previous_untracked_writes = untracked_writes;
			else previous_untracked_writes.push(...untracked_writes);
		}
		if ((reaction.f & 8388608) !== 0) reaction.f ^= ERROR_VALUE;
		return result;
	} catch (error) {
		return handle_error(error);
	} finally {
		reaction.f ^= REACTION_IS_UPDATING;
		new_deps = previous_deps;
		skipped_deps = previous_skipped_deps;
		untracked_writes = previous_untracked_writes;
		active_reaction = previous_reaction;
		current_sources = previous_sources;
		set_component_context(previous_component_context);
		untracking = previous_untracking;
		update_version = previous_update_version;
	}
}
/**
* @template V
* @param {Reaction} signal
* @param {Value<V>} dependency
* @returns {void}
*/
function remove_reaction(signal, dependency) {
	let reactions = dependency.reactions;
	if (reactions !== null) {
		var index = index_of.call(reactions, signal);
		if (index !== -1) {
			var new_length = reactions.length - 1;
			if (new_length === 0) reactions = dependency.reactions = null;
			else {
				reactions[index] = reactions[new_length];
				reactions.pop();
			}
		}
	}
	if (reactions === null && (dependency.f & 2) !== 0 && (new_deps === null || !includes.call(new_deps, dependency))) {
		var derived = dependency;
		if ((derived.f & 512) !== 0) {
			derived.f ^= 512;
			derived.f &= ~WAS_MARKED;
		}
		if (derived.v !== UNINITIALIZED) update_derived_status(derived);
		freeze_derived_effects(derived);
		remove_reactions(derived, 0);
	}
}
/**
* @param {Reaction} signal
* @param {number} start_index
* @returns {void}
*/
function remove_reactions(signal, start_index) {
	var dependencies = signal.deps;
	if (dependencies === null) return;
	for (var i = start_index; i < dependencies.length; i++) remove_reaction(signal, dependencies[i]);
}
/**
* @param {Effect} effect
* @returns {void}
*/
function update_effect(effect) {
	var flags = effect.f;
	if ((flags & 16384) !== 0) return;
	set_signal_status(effect, CLEAN);
	var previous_effect = active_effect;
	var was_updating_effect = is_updating_effect;
	active_effect = effect;
	is_updating_effect = true;
	try {
		if ((flags & 16777232) !== 0) destroy_block_effect_children(effect);
		else destroy_effect_children(effect);
		execute_effect_teardown(effect);
		var teardown = update_reaction(effect);
		effect.teardown = typeof teardown === "function" ? teardown : null;
		effect.wv = write_version;
	} finally {
		is_updating_effect = was_updating_effect;
		active_effect = previous_effect;
	}
}
/**
* Returns a promise that resolves once any pending state changes have been applied.
* @returns {Promise<void>}
*/
async function tick() {
	if (async_mode_flag) return new Promise((f) => {
		requestAnimationFrame(() => f());
		setTimeout(() => f());
	});
	await Promise.resolve();
	flushSync();
}
/**
* @template V
* @param {Value<V>} signal
* @returns {V}
*/
function get(signal) {
	var is_derived = (signal.f & 2) !== 0;
	captured_signals?.add(signal);
	if (active_reaction !== null && !untracking) {
		if (!(active_effect !== null && (active_effect.f & 16384) !== 0) && (current_sources === null || !current_sources.has(signal))) {
			var deps = active_reaction.deps;
			if ((active_reaction.f & 2097152) !== 0) {
				if (signal.rv < read_version) {
					signal.rv = read_version;
					if (new_deps === null && deps !== null && deps[skipped_deps] === signal) skipped_deps++;
					else if (new_deps === null) new_deps = [signal];
					else new_deps.push(signal);
				}
			} else {
				active_reaction.deps ??= [];
				if (!includes.call(active_reaction.deps, signal)) active_reaction.deps.push(signal);
				var reactions = signal.reactions;
				if (reactions === null) signal.reactions = [active_reaction];
				else if (!includes.call(reactions, active_reaction)) reactions.push(active_reaction);
			}
		}
	}
	if (is_destroying_effect && old_values.has(signal)) return old_values.get(signal);
	if (is_derived) {
		var derived = signal;
		if (is_destroying_effect) {
			var value = derived.v;
			if ((derived.f & 1024) === 0 && derived.reactions !== null || depends_on_old_values(derived)) value = execute_derived(derived);
			old_values.set(derived, value);
			return value;
		}
		var should_connect = (derived.f & 512) === 0 && !untracking && active_reaction !== null && (is_updating_effect || (active_reaction.f & 512) !== 0);
		var is_new = (derived.f & REACTION_RAN) === 0;
		if (is_dirty(derived)) {
			if (should_connect) derived.f |= 512;
			update_derived(derived);
		}
		if (should_connect && !is_new) {
			unfreeze_derived_effects(derived);
			reconnect(derived);
		}
	}
	if (batch_values?.has(signal)) return batch_values.get(signal);
	if ((signal.f & 8388608) !== 0) throw signal.v;
	return signal.v;
}
/**
* (Re)connect a disconnected derived, so that it is notified
* of changes in `mark_reactions`
* @param {Derived} derived
*/
function reconnect(derived) {
	derived.f |= 512;
	if (derived.deps === null) return;
	for (const dep of derived.deps) {
		(dep.reactions ??= []).push(derived);
		if ((dep.f & 2) !== 0 && (dep.f & 512) === 0) {
			unfreeze_derived_effects(dep);
			reconnect(dep);
		}
	}
}
/** @param {Derived} derived */
function depends_on_old_values(derived) {
	if (derived.v === UNINITIALIZED) return true;
	if (derived.deps === null) return false;
	for (const dep of derived.deps) {
		if (old_values.has(dep)) return true;
		if ((dep.f & 2) !== 0 && depends_on_old_values(dep)) return true;
	}
	return false;
}
/**
* When used inside a [`$derived`](https://svelte.dev/docs/svelte/$derived) or [`$effect`](https://svelte.dev/docs/svelte/$effect),
* any state read inside `fn` will not be treated as a dependency.
*
* ```ts
* $effect(() => {
*   // this will run when `data` changes, but not when `time` changes
*   save(data, {
*     timestamp: untrack(() => time)
*   });
* });
* ```
* @template T
* @param {() => T} fn
* @returns {T}
*/
function untrack(fn) {
	var previous_untracking = untracking;
	try {
		untracking = true;
		return fn();
	} finally {
		untracking = previous_untracking;
	}
}
/**
* Possibly traverse an object and read all its properties so that they're all reactive in case this is `$state`.
* Does only check first level of an object for performance reasons (heuristic should be good for 99% of all cases).
* @param {any} value
* @returns {void}
*/
function deep_read_state(value) {
	if (typeof value !== "object" || !value || value instanceof EventTarget) return;
	if (STATE_SYMBOL in value) deep_read(value);
	else if (!Array.isArray(value)) for (let key in value) {
		const prop = value[key];
		if (typeof prop === "object" && prop && STATE_SYMBOL in prop) deep_read(prop);
	}
}
/**
* Deeply traverse an object and read all its properties
* so that they're all reactive in case this is `$state`
* @param {any} value
* @param {Set<any>} visited
* @returns {void}
*/
function deep_read(value, visited = /* @__PURE__ */ new Set()) {
	if (typeof value === "object" && value !== null && !(value instanceof EventTarget) && !visited.has(value)) {
		visited.add(value);
		if (value instanceof Date) value.getTime();
		for (let key in value) try {
			deep_read(value[key], visited);
		} catch (e) {}
		const proto = get_prototype_of(value);
		if (proto !== Object.prototype && proto !== Array.prototype && proto !== Map.prototype && proto !== Set.prototype && proto !== Date.prototype) {
			const descriptors = get_descriptors(proto);
			for (let key in descriptors) {
				const get = descriptors[key].get;
				if (get) try {
					get.call(value);
				} catch (e) {}
			}
		}
	}
}
/**
* Subset of delegated events which should be passive by default.
* These two are already passive via browser defaults on window, document and body.
* But since
* - we're delegating them
* - they happen often
* - they apply to mobile which is generally less performant
* we're marking them as passive by default for other elements, too.
*/
var PASSIVE_EVENTS = ["touchstart", "touchmove"];
/**
* Returns `true` if `name` is a passive event
* @param {string} name
*/
function is_passive_event(name) {
	return PASSIVE_EVENTS.includes(name);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/events.js
/**
* Used on elements, as a map of event type -> event handler,
* and on events themselves to track which element handled an event
*/
var event_symbol = Symbol("events");
/** @type {Set<string>} */
var all_registered_events = /* @__PURE__ */ new Set();
/** @type {Set<(events: Array<string>) => void>} */
var root_event_handles = /* @__PURE__ */ new Set();
/**
* @param {string} event_name
* @param {EventTarget} dom
* @param {EventListener} [handler]
* @param {AddEventListenerOptions} [options]
*/
function create_event(event_name, dom, handler, options = {}) {
	/**
	* @this {EventTarget}
	*/
	function target_handler(event) {
		if (!options.capture) handle_event_propagation.call(dom, event);
		if (!event.cancelBubble) return without_reactive_context(() => {
			return handler?.call(this, event);
		});
	}
	if (event_name.startsWith("pointer") || event_name.startsWith("touch") || event_name === "wheel") queue_micro_task(() => {
		dom.addEventListener(event_name, target_handler, options);
	});
	else dom.addEventListener(event_name, target_handler, options);
	return target_handler;
}
/**
* @param {string} event_name
* @param {Element} dom
* @param {EventListener} [handler]
* @param {boolean} [capture]
* @param {boolean} [passive]
* @returns {void}
*/
function event(event_name, dom, handler, capture, passive) {
	var options = {
		capture,
		passive
	};
	var target_handler = create_event(event_name, dom, handler, options);
	if (dom === document.body || dom === window || dom === document || dom instanceof HTMLMediaElement) teardown(() => {
		dom.removeEventListener(event_name, target_handler, options);
	});
}
/**
* @param {string} event_name
* @param {Element} element
* @param {EventListener} [handler]
* @returns {void}
*/
function delegated(event_name, element, handler) {
	(element[event_symbol] ??= {})[event_name] = handler;
}
/**
* @param {Array<string>} events
* @returns {void}
*/
function delegate(events) {
	for (var i = 0; i < events.length; i++) all_registered_events.add(events[i]);
	for (var fn of root_event_handles) fn(events);
}
var last_propagated_event = null;
/**
* @this {EventTarget}
* @param {Event} event
* @returns {void}
*/
function handle_event_propagation(event) {
	var handler_element = this;
	var owner_document = handler_element.ownerDocument;
	var event_name = event.type;
	var path = event.composedPath?.() || [];
	var current_target = path[0] || event.target;
	last_propagated_event = event;
	var path_idx = 0;
	var handled_at = last_propagated_event === event && event[event_symbol];
	if (handled_at) {
		var at_idx = path.indexOf(handled_at);
		if (at_idx !== -1 && (handler_element === document || handler_element === window)) {
			event[event_symbol] = handler_element;
			return;
		}
		var handler_idx = path.indexOf(handler_element);
		if (handler_idx === -1) return;
		if (at_idx <= handler_idx) path_idx = at_idx;
	}
	current_target = path[path_idx] || event.target;
	if (current_target === handler_element) return;
	define_property(event, "currentTarget", {
		configurable: true,
		get() {
			return current_target || owner_document;
		}
	});
	var previous_reaction = active_reaction;
	var previous_effect = active_effect;
	set_active_reaction(null);
	set_active_effect(null);
	try {
		/**
		* @type {unknown}
		*/
		var throw_error;
		/**
		* @type {unknown[]}
		*/
		var other_errors = [];
		while (current_target !== null) {
			if (current_target === handler_element) break;
			try {
				var delegated = current_target[event_symbol]?.[event_name];
				if (delegated != null && (!current_target.disabled || event.target === current_target)) delegated.call(current_target, event);
			} catch (error) {
				if (throw_error) other_errors.push(error);
				else throw_error = error;
			}
			if (event.cancelBubble) break;
			path_idx++;
			current_target = path_idx < path.length ? path[path_idx] : null;
		}
		if (throw_error) {
			for (let error of other_errors) queueMicrotask(() => {
				throw error;
			});
			throw throw_error;
		}
	} finally {
		event[event_symbol] = handler_element;
		delete event.currentTarget;
		set_active_reaction(previous_reaction);
		set_active_effect(previous_effect);
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/reconciler.js
var policy = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { 
/** @param {string} html */
createHTML: (html) => {
	return html;
} });
/** @param {string} html */
function create_trusted_html(html) {
	return policy?.createHTML(html) ?? html;
}
/**
* @param {string} html
*/
function create_fragment_from_html(html) {
	var elem = create_element("template");
	elem.innerHTML = create_trusted_html(html.replaceAll("<!>", "<!---->"));
	return elem.content;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/template.js
/** @import { Effect, EffectNodes, TemplateNode } from '#client' */
/** @import { TemplateStructure } from './types' */
/**
* @param {TemplateNode} start
* @param {TemplateNode | null} end
*/
function assign_nodes(start, end) {
	var effect = active_effect;
	if (effect.nodes === null) effect.nodes = {
		start,
		end,
		a: null,
		t: null
	};
}
/**
* @param {string} content
* @param {number} flags
* @returns {() => Node | Node[]}
*/
/*#__NO_SIDE_EFFECTS__*/
function from_html(content, flags) {
	var is_fragment = (flags & 1) !== 0;
	var use_import_node = (flags & 2) !== 0;
	/** @type {Node} */
	var node;
	/**
	* Whether or not the first item is a text/element node. If not, we need to
	* create an additional comment node to act as `effect.nodes.start`
	*/
	var has_start = !content.startsWith("<!>");
	return () => {
		if (hydrating) {
			assign_nodes(hydrate_node, null);
			return hydrate_node;
		}
		if (node === void 0) {
			node = create_fragment_from_html(has_start ? content : "<!>" + content);
			if (!is_fragment) node = /* @__PURE__ */ get_first_child(node);
		}
		var clone = use_import_node || is_firefox ? document.importNode(node, true) : node.cloneNode(true);
		if (is_fragment) {
			var start = /* @__PURE__ */ get_first_child(clone);
			var end = clone.lastChild;
			assign_nodes(start, end);
		} else assign_nodes(clone, clone);
		return clone;
	};
}
/**
* @param {string} content
* @param {number} flags
* @param {'svg' | 'math'} ns
* @returns {() => Node | Node[]}
*/
/*#__NO_SIDE_EFFECTS__*/
function from_namespace(content, flags, ns = "svg") {
	/**
	* Whether or not the first item is a text/element node. If not, we need to
	* create an additional comment node to act as `effect.nodes.start`
	*/
	var has_start = !content.startsWith("<!>");
	var is_fragment = (flags & 1) !== 0;
	var wrapped = `<${ns}>${has_start ? content : "<!>" + content}</${ns}>`;
	/** @type {Element | DocumentFragment} */
	var node;
	return () => {
		if (hydrating) {
			assign_nodes(hydrate_node, null);
			return hydrate_node;
		}
		if (!node) {
			var root = /* @__PURE__ */ get_first_child(create_fragment_from_html(wrapped));
			if (is_fragment) {
				node = document.createDocumentFragment();
				while (/* @__PURE__ */ get_first_child(root)) node.appendChild(/* @__PURE__ */ get_first_child(root));
			} else node = /* @__PURE__ */ get_first_child(root);
		}
		var clone = node.cloneNode(true);
		if (is_fragment) {
			var start = /* @__PURE__ */ get_first_child(clone);
			var end = clone.lastChild;
			assign_nodes(start, end);
		} else assign_nodes(clone, clone);
		return clone;
	};
}
/**
* @param {string} content
* @param {number} flags
*/
/*#__NO_SIDE_EFFECTS__*/
function from_svg(content, flags) {
	return /* @__PURE__ */ from_namespace(content, flags, "svg");
}
/**
* Don't mark this as side-effect-free, hydration needs to walk all nodes
* @param {any} value
*/
function text(value = "") {
	if (!hydrating) {
		var t = create_text(value + "");
		assign_nodes(t, t);
		return t;
	}
	var node = hydrate_node;
	if (node.nodeType !== 3) {
		node.before(node = create_text());
		set_hydrate_node(node);
	} else merge_text_nodes(node);
	assign_nodes(node, node);
	return node;
}
/**
* @returns {TemplateNode | DocumentFragment}
*/
function comment() {
	if (hydrating) {
		assign_nodes(hydrate_node, null);
		return hydrate_node;
	}
	var frag = document.createDocumentFragment();
	var start = document.createComment("");
	var anchor = create_text();
	frag.append(start, anchor);
	assign_nodes(start, anchor);
	return frag;
}
/**
* Assign the created (or in hydration mode, traversed) dom elements to the current block
* and insert the elements into the dom (in client mode).
* @param {Text | Comment | Element} anchor
* @param {DocumentFragment | Element} dom
*/
function append(anchor, dom) {
	if (hydrating) {
		var effect = active_effect;
		if ((effect.f & 32768) === 0 || effect.nodes.end === null) effect.nodes.end = hydrate_node;
		hydrate_next();
		return;
	}
	if (anchor === null) return;
	anchor.before(dom);
}
/**
* @param {Element} text
* @param {string} value
* @returns {void}
*/
function set_text(text, value) {
	var str = value == null ? "" : typeof value === "object" ? `${value}` : value;
	if (str !== (text[TEXT_CACHE] ??= text.nodeValue)) {
		/** @type {any} */ text[TEXT_CACHE] = str;
		text.nodeValue = `${str}`;
	}
}
/**
* Mounts a component to the given target and returns the exports and potentially the props (if compiled with `accessors: true`) of the component.
* Transitions will play during the initial render unless the `intro` option is set to `false`.
*
* @template {Record<string, any>} Props
* @template {Record<string, any>} Exports
* @param {ComponentType<SvelteComponent<Props>> | Component<Props, Exports, any>} component
* @param {MountOptions<Props>} options
* @returns {Exports}
*/
function mount(component, options) {
	return _mount(component, options);
}
/** @type {Map<EventTarget, Map<string, number>>} */
var listeners = /* @__PURE__ */ new Map();
/**
* @template {Record<string, any>} Exports
* @param {ComponentType<SvelteComponent<any>> | Component<any>} Component
* @param {MountOptions} options
* @returns {Exports}
*/
function _mount(Component, { target, anchor, props = {}, events, context, intro = true, transformError }) {
	init_operations();
	/** @type {Exports} */
	var component = void 0;
	var unmount = component_root(() => {
		var anchor_node = anchor ?? target.appendChild(create_text());
		boundary(anchor_node, { pending: () => {} }, (anchor_node) => {
			push({});
			var ctx = component_context;
			if (context) ctx.c = context;
			if (events)
 /** @type {any} */ props.$$events = events;
			if (hydrating) assign_nodes(anchor_node, null);
			component = Component(anchor_node, props) || {};
			if (hydrating) {
				/** @type {Effect & { nodes: EffectNodes }} */ active_effect.nodes.end = hydrate_node;
				if (hydrate_node === null || hydrate_node.nodeType !== 8 || hydrate_node.data !== "]") {
					hydration_mismatch();
					throw HYDRATION_ERROR;
				}
			}
			pop();
		}, transformError);
		/** @type {Set<string>} */
		var registered_events = /* @__PURE__ */ new Set();
		/** @param {Array<string>} events */
		var event_handle = (events) => {
			for (var i = 0; i < events.length; i++) {
				var event_name = events[i];
				if (registered_events.has(event_name)) continue;
				registered_events.add(event_name);
				var passive = is_passive_event(event_name);
				for (const node of [target, document]) {
					var counts = listeners.get(node);
					if (counts === void 0) {
						counts = /* @__PURE__ */ new Map();
						listeners.set(node, counts);
					}
					var count = counts.get(event_name);
					if (count === void 0) {
						node.addEventListener(event_name, handle_event_propagation, { passive });
						counts.set(event_name, 1);
					} else counts.set(event_name, count + 1);
				}
			}
		};
		event_handle(array_from(all_registered_events));
		root_event_handles.add(event_handle);
		return () => {
			for (var event_name of registered_events) for (const node of [target, document]) {
				var counts = listeners.get(node);
				var count = counts.get(event_name);
				if (--count == 0) {
					node.removeEventListener(event_name, handle_event_propagation);
					counts.delete(event_name);
					if (counts.size === 0) listeners.delete(node);
				} else counts.set(event_name, count);
			}
			root_event_handles.delete(event_handle);
			if (anchor_node !== anchor) anchor_node.parentNode?.removeChild(anchor_node);
		};
	});
	mounted_components.set(component, unmount);
	return component;
}
/**
* References of the components that were mounted or hydrated.
* Uses a `WeakMap` to avoid memory leaks.
*/
var mounted_components = /* @__PURE__ */ new WeakMap();
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/branches.js
/** @import { Effect, TemplateNode } from '#client' */
/**
* @typedef {{ effect: Effect, fragment: DocumentFragment }} Branch
*/
/**
* @template Key
*/
var BranchManager = class {
	/** @type {TemplateNode} */
	anchor;
	/** @type {Map<Batch, Key>} */
	#batches = /* @__PURE__ */ new Map();
	/**
	* Map of keys to effects that are currently rendered in the DOM.
	* These effects are visible and actively part of the document tree.
	* Example:
	* ```
	* {#if condition}
	* 	foo
	* {:else}
	* 	bar
	* {/if}
	* ```
	* Can result in the entries `true->Effect` and `false->Effect`
	* @type {Map<Key, Effect>}
	*/
	#onscreen = /* @__PURE__ */ new Map();
	/**
	* Similar to #onscreen with respect to the keys, but contains branches that are not yet
	* in the DOM, because their insertion is deferred.
	* @type {Map<Key, Branch>}
	*/
	#offscreen = /* @__PURE__ */ new Map();
	/**
	* Keys of effects that are currently outroing
	* @type {Set<Key>}
	*/
	#outroing = /* @__PURE__ */ new Set();
	/**
	* Whether to pause (i.e. outro) on change, or destroy immediately.
	* This is necessary for `<svelte:element>`
	*/
	#transition = true;
	/**
	* @param {TemplateNode} anchor
	* @param {boolean} transition
	*/
	constructor(anchor, transition = true) {
		this.anchor = anchor;
		this.#transition = transition;
	}
	/**
	* @param {Batch} batch
	*/
	#commit = (batch) => {
		if (!this.#batches.has(batch)) return;
		var key = this.#batches.get(batch);
		var onscreen = this.#onscreen.get(key);
		if (onscreen) {
			resume_effect(onscreen);
			this.#outroing.delete(key);
		} else {
			var offscreen = this.#offscreen.get(key);
			if (offscreen) {
				resume_effect(offscreen.effect);
				this.#onscreen.set(key, offscreen.effect);
				this.#offscreen.delete(key);
				/** @type {TemplateNode} */ offscreen.fragment.lastChild.remove();
				this.anchor.before(offscreen.fragment);
				onscreen = offscreen.effect;
			}
		}
		for (const [b, k] of this.#batches) {
			this.#batches.delete(b);
			if (b === batch) break;
			const offscreen = this.#offscreen.get(k);
			if (offscreen) {
				destroy_effect(offscreen.effect);
				this.#offscreen.delete(k);
			}
		}
		for (const [k, effect] of this.#onscreen) {
			if (k === key || this.#outroing.has(k)) continue;
			const on_destroy = () => {
				if (Array.from(this.#batches.values()).includes(k)) {
					var fragment = document.createDocumentFragment();
					move_effect(effect, fragment);
					fragment.append(create_text());
					this.#offscreen.set(k, {
						effect,
						fragment
					});
				} else destroy_effect(effect);
				this.#outroing.delete(k);
				this.#onscreen.delete(k);
			};
			if (this.#transition || !onscreen) {
				this.#outroing.add(k);
				pause_effect(effect, on_destroy, false);
			} else on_destroy();
		}
	};
	/**
	* @param {Batch} batch
	*/
	#discard = (batch) => {
		this.#batches.delete(batch);
		const keys = Array.from(this.#batches.values());
		for (const [k, branch] of this.#offscreen) if (!keys.includes(k)) {
			destroy_effect(branch.effect);
			this.#offscreen.delete(k);
		}
	};
	/**
	*
	* @param {any} key
	* @param {null | ((target: TemplateNode) => void)} fn
	*/
	ensure(key, fn) {
		var batch = current_batch;
		var defer = should_defer_append();
		if (fn && !this.#onscreen.has(key) && !this.#offscreen.has(key)) if (defer) {
			var fragment = document.createDocumentFragment();
			var target = create_text();
			fragment.append(target);
			this.#offscreen.set(key, {
				effect: branch(() => fn(target)),
				fragment
			});
		} else this.#onscreen.set(key, branch(() => fn(this.anchor)));
		this.#batches.set(batch, key);
		if (defer) {
			for (const [k, effect] of this.#onscreen) if (k === key) batch.unskip_effect(effect);
			else batch.skip_effect(effect);
			for (const [k, branch] of this.#offscreen) if (k === key) batch.unskip_effect(branch.effect);
			else batch.skip_effect(branch.effect);
			batch.oncommit(this.#commit);
			batch.ondiscard(this.#discard);
		} else {
			if (hydrating) this.anchor = hydrate_node;
			this.#commit(batch);
		}
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/if.js
/** @import { TemplateNode } from '#client' */
/**
* @param {TemplateNode} node
* @param {(branch: (fn: (anchor: Node) => void, key?: number | false) => void) => void} fn
* @param {boolean} [elseif] True if this is an `{:else if ...}` block rather than an `{#if ...}`, as that affects which transitions are considered 'local'
* @returns {void}
*/
function if_block(node, fn, elseif = false) {
	/** @type {TemplateNode | undefined} */
	var marker;
	if (hydrating) {
		marker = hydrate_node;
		hydrate_next();
	}
	var branches = new BranchManager(node);
	var flags = elseif ? EFFECT_TRANSPARENT : 0;
	/**
	* @param {number | false} key
	* @param {null | ((anchor: Node) => void)} fn
	*/
	function update_branch(key, fn) {
		if (hydrating) {
			var data = read_hydration_instruction(marker);
			if (key !== parseInt(data.substring(1))) {
				var anchor = skip_nodes();
				set_hydrate_node(anchor);
				branches.anchor = anchor;
				set_hydrating(false);
				branches.ensure(key, fn);
				set_hydrating(true);
				return;
			}
		}
		branches.ensure(key, fn);
	}
	block(() => {
		var has_branch = false;
		fn((fn, key = 0) => {
			has_branch = true;
			update_branch(key, fn);
		});
		if (!has_branch) update_branch(-1, null);
	}, flags);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/each.js
/** @import { EachItem, EachOutroGroup, EachState, Effect, EffectNodes, MaybeSource, Source, TemplateNode, TransitionManager, Value } from '#client' */
/** @import { Batch } from '../../reactivity/batch.js'; */
/**
* @param {any} _
* @param {number} i
*/
function index(_, i) {
	return i;
}
/**
* Pause multiple effects simultaneously, and coordinate their
* subsequent destruction. Used in each blocks
* @param {EachState} state
* @param {Effect[]} to_destroy
* @param {null | Node} controlled_anchor
*/
function pause_effects(state, to_destroy, controlled_anchor) {
	/** @type {TransitionManager[]} */
	var transitions = [];
	var length = to_destroy.length;
	/** @type {EachOutroGroup} */
	var group;
	var remaining = to_destroy.length;
	for (var i = 0; i < length; i++) {
		let effect = to_destroy[i];
		pause_effect(effect, () => {
			if (group) {
				group.pending.delete(effect);
				group.done.add(effect);
				if (group.pending.size === 0) {
					var groups = state.outrogroups;
					destroy_effects(state, array_from(group.done));
					groups.delete(group);
					if (groups.size === 0) state.outrogroups = null;
				}
			} else remaining -= 1;
		}, false);
	}
	if (remaining === 0) {
		var fast_path = transitions.length === 0 && controlled_anchor !== null;
		if (fast_path) {
			var anchor = controlled_anchor;
			var parent_node = anchor.parentNode;
			clear_text_content(parent_node);
			parent_node.append(anchor);
			state.items.clear();
		}
		destroy_effects(state, to_destroy, !fast_path);
	} else {
		group = {
			pending: new Set(to_destroy),
			done: /* @__PURE__ */ new Set()
		};
		(state.outrogroups ??= /* @__PURE__ */ new Set()).add(group);
	}
}
/**
* @param {EachState} state
* @param {Effect[]} to_destroy
* @param {boolean} remove_dom
*/
function destroy_effects(state, to_destroy, remove_dom = true) {
	/** @type {Set<Effect> | undefined} */
	var preserved_effects;
	if (state.pending.size > 0) {
		preserved_effects = /* @__PURE__ */ new Set();
		for (const keys of state.pending.values()) for (const key of keys) preserved_effects.add(
			/** @type {EachItem} */
			state.items.get(key).e
		);
	}
	for (var i = 0; i < to_destroy.length; i++) {
		var e = to_destroy[i];
		if (preserved_effects?.has(e)) {
			e.f |= EFFECT_OFFSCREEN;
			move_effect(e, document.createDocumentFragment());
		} else destroy_effect(to_destroy[i], remove_dom);
	}
}
/** @type {TemplateNode} */
var offscreen_anchor;
/**
* @template V
* @param {Element | Comment} node The next sibling node, or the parent node if this is a 'controlled' block
* @param {number} flags
* @param {() => V[]} get_collection
* @param {(value: V, index: number) => any} get_key
* @param {(anchor: Node, item: MaybeSource<V>, index: MaybeSource<number>) => void} render_fn
* @param {null | ((anchor: Node) => void)} fallback_fn
* @returns {void}
*/
function each(node, flags, get_collection, get_key, render_fn, fallback_fn = null) {
	var anchor = node;
	/** @type {Map<any, EachItem>} */
	var items = /* @__PURE__ */ new Map();
	if ((flags & 4) !== 0) {
		var parent_node = node;
		anchor = hydrating ? set_hydrate_node(/* @__PURE__ */ get_first_child(parent_node)) : parent_node.appendChild(create_text());
	}
	if (hydrating) hydrate_next();
	/** @type {Effect | null} */
	var fallback = null;
	var each_array = /* @__PURE__ */ derived_safe_equal(() => {
		var collection = get_collection();
		return is_array(collection) ? collection : collection == null ? [] : array_from(collection);
	});
	/** @type {V[]} */
	var array;
	/** @type {Map<Batch, Set<any>>} */
	var pending = /* @__PURE__ */ new Map();
	var first_run = true;
	/**
	* @param {Batch} batch
	*/
	function commit(batch) {
		if ((state.effect.f & 16384) !== 0) return;
		state.pending.delete(batch);
		state.fallback = fallback;
		reconcile(state, array, anchor, flags, get_key);
		if (fallback !== null) if (array.length === 0) if ((fallback.f & 33554432) === 0) resume_effect(fallback);
		else {
			fallback.f ^= EFFECT_OFFSCREEN;
			move(fallback, null, anchor);
		}
		else pause_effect(fallback, () => {
			fallback = null;
		});
	}
	/**
	* @param {Batch} batch
	*/
	function discard(batch) {
		state.pending.delete(batch);
	}
	/** @type {EachState} */
	var state = {
		effect: block(() => {
			array = get(each_array);
			var length = array.length;
			/** `true` if there was a hydration mismatch. Needs to be a `let` or else it isn't treeshaken out */
			let mismatch = false;
			if (hydrating) {
				if (read_hydration_instruction(anchor) === "[!" !== (length === 0)) {
					anchor = skip_nodes();
					set_hydrate_node(anchor);
					set_hydrating(false);
					mismatch = true;
				}
			}
			var keys = /* @__PURE__ */ new Set();
			var batch = current_batch;
			var defer = should_defer_append();
			for (var index = 0; index < length; index += 1) {
				if (hydrating && hydrate_node.nodeType === 8 && hydrate_node.data === "]") {
					anchor = hydrate_node;
					mismatch = true;
					set_hydrating(false);
				}
				var value = array[index];
				var key = get_key(value, index);
				var item = first_run ? null : items.get(key);
				if (item) {
					if (item.v) internal_set(item.v, value);
					if (item.i) internal_set(item.i, index);
					if (defer) batch.unskip_effect(item.e);
				} else {
					item = create_item(items, first_run ? anchor : offscreen_anchor ??= create_text(), value, key, index, render_fn, flags, get_collection);
					if (!first_run) item.e.f |= EFFECT_OFFSCREEN;
					items.set(key, item);
				}
				keys.add(key);
			}
			if (length === 0 && fallback_fn && !fallback) if (first_run) fallback = branch(() => fallback_fn(anchor));
			else {
				fallback = branch(() => fallback_fn(offscreen_anchor ??= create_text()));
				fallback.f |= EFFECT_OFFSCREEN;
			}
			if (length > keys.size) each_key_duplicate("", "", "");
			if (hydrating && length > 0) set_hydrate_node(skip_nodes());
			if (!first_run) {
				pending.set(batch, keys);
				if (defer) {
					for (const [key, item] of items) if (!keys.has(key)) batch.skip_effect(item.e);
					batch.oncommit(commit);
					batch.ondiscard(discard);
				} else commit(batch);
			}
			if (mismatch) set_hydrating(true);
			get(each_array);
		}),
		flags,
		items,
		pending,
		outrogroups: null,
		fallback
	};
	first_run = false;
	if (hydrating) anchor = hydrate_node;
}
/**
* Skip past any non-branch effects (which could be created with `createSubscriber`, for example) to find the next branch effect
* @param {Effect | null} effect
* @returns {Effect | null}
*/
function skip_to_branch(effect) {
	while (effect !== null && (effect.f & 32) === 0) effect = effect.next;
	return effect;
}
/**
* Add, remove, or reorder items output by an each block as its input changes
* @template V
* @param {EachState} state
* @param {Array<V>} array
* @param {Element | Comment | Text} anchor
* @param {number} flags
* @param {(value: V, index: number) => any} get_key
* @returns {void}
*/
function reconcile(state, array, anchor, flags, get_key) {
	var is_animated = (flags & 8) !== 0;
	var length = array.length;
	var items = state.items;
	var current = skip_to_branch(state.effect.first);
	/** @type {undefined | Set<Effect>} */
	var seen;
	/** @type {Effect | null} */
	var prev = null;
	/** @type {undefined | Set<Effect>} */
	var to_animate;
	/** @type {Effect[]} */
	var matched = [];
	/** @type {Effect[]} */
	var stashed = [];
	/** @type {V} */
	var value;
	/** @type {any} */
	var key;
	/** @type {Effect | undefined} */
	var effect;
	/** @type {number} */
	var i;
	if (is_animated) for (i = 0; i < length; i += 1) {
		value = array[i];
		key = get_key(value, i);
		effect = items.get(key).e;
		if ((effect.f & 33554432) === 0) {
			effect.nodes?.a?.measure();
			(to_animate ??= /* @__PURE__ */ new Set()).add(effect);
		}
	}
	for (i = 0; i < length; i += 1) {
		value = array[i];
		key = get_key(value, i);
		effect = items.get(key).e;
		if (state.outrogroups !== null) for (const group of state.outrogroups) {
			group.pending.delete(effect);
			group.done.delete(effect);
		}
		if ((effect.f & 8192) !== 0) {
			resume_effect(effect);
			if (is_animated) {
				effect.nodes?.a?.unfix();
				(to_animate ??= /* @__PURE__ */ new Set()).delete(effect);
			}
		}
		if ((effect.f & 33554432) !== 0) {
			effect.f ^= EFFECT_OFFSCREEN;
			if (effect === current) move(effect, null, anchor);
			else {
				var next = prev ? prev.next : current;
				if (effect === state.effect.last) state.effect.last = effect.prev;
				if (effect.prev) effect.prev.next = effect.next;
				if (effect.next) effect.next.prev = effect.prev;
				link(state, prev, effect);
				link(state, effect, next);
				move(effect, next, anchor);
				prev = effect;
				matched = [];
				stashed = [];
				current = skip_to_branch(prev.next);
				continue;
			}
		}
		if (effect !== current) {
			if (seen !== void 0 && seen.has(effect)) {
				if (matched.length < stashed.length) {
					var start = stashed[0];
					var j;
					prev = start.prev;
					var a = matched[0];
					var b = matched[matched.length - 1];
					for (j = 0; j < matched.length; j += 1) move(matched[j], start, anchor);
					for (j = 0; j < stashed.length; j += 1) seen.delete(stashed[j]);
					link(state, a.prev, b.next);
					link(state, prev, a);
					link(state, b, start);
					current = start;
					prev = b;
					i -= 1;
					matched = [];
					stashed = [];
				} else {
					seen.delete(effect);
					move(effect, current, anchor);
					link(state, effect.prev, effect.next);
					link(state, effect, prev === null ? state.effect.first : prev.next);
					link(state, prev, effect);
					prev = effect;
				}
				continue;
			}
			matched = [];
			stashed = [];
			while (current !== null && current !== effect) {
				(seen ??= /* @__PURE__ */ new Set()).add(current);
				stashed.push(current);
				current = skip_to_branch(current.next);
			}
			if (current === null) continue;
		}
		if ((effect.f & 33554432) === 0) matched.push(effect);
		prev = effect;
		current = skip_to_branch(effect.next);
	}
	if (state.outrogroups !== null) {
		for (const group of state.outrogroups) if (group.pending.size === 0) {
			destroy_effects(state, array_from(group.done));
			state.outrogroups?.delete(group);
		}
		if (state.outrogroups.size === 0) state.outrogroups = null;
	}
	if (current !== null || seen !== void 0) {
		/** @type {Effect[]} */
		var to_destroy = [];
		if (seen !== void 0) {
			for (effect of seen) if ((effect.f & 8192) === 0) to_destroy.push(effect);
		}
		while (current !== null) {
			if ((current.f & 8192) === 0 && current !== state.fallback) to_destroy.push(current);
			current = skip_to_branch(current.next);
		}
		var destroy_length = to_destroy.length;
		if (destroy_length > 0) {
			var controlled_anchor = (flags & 4) !== 0 && length === 0 ? anchor : null;
			if (is_animated) {
				for (i = 0; i < destroy_length; i += 1) to_destroy[i].nodes?.a?.measure();
				for (i = 0; i < destroy_length; i += 1) to_destroy[i].nodes?.a?.fix();
			}
			pause_effects(state, to_destroy, controlled_anchor);
		}
	}
	if (is_animated) queue_micro_task(() => {
		if (to_animate === void 0) return;
		for (effect of to_animate) effect.nodes?.a?.apply();
	});
}
/**
* @template V
* @param {Map<any, EachItem>} items
* @param {Node} anchor
* @param {V} value
* @param {unknown} key
* @param {number} index
* @param {(anchor: Node, item: V | Source<V>, index: number | Value<number>, collection: () => V[]) => void} render_fn
* @param {number} flags
* @param {() => V[]} get_collection
* @returns {EachItem}
*/
function create_item(items, anchor, value, key, index, render_fn, flags, get_collection) {
	var v = (flags & 1) !== 0 ? (flags & 16) === 0 ? /* @__PURE__ */ mutable_source(value, false, false) : source(value) : null;
	var i = (flags & 2) !== 0 ? source(index) : null;
	return {
		v,
		i,
		e: branch(() => {
			render_fn(anchor, v ?? value, i ?? index, get_collection);
			return () => {
				items.delete(key);
			};
		})
	};
}
/**
* @param {Effect} effect
* @param {Effect | null} next
* @param {Text | Element | Comment} anchor
*/
function move(effect, next, anchor) {
	if (!effect.nodes) return;
	var node = effect.nodes.start;
	var end = effect.nodes.end;
	var dest = next && (next.f & 33554432) === 0 ? next.nodes.start : anchor;
	while (node !== null) {
		var next_node = /* @__PURE__ */ get_next_sibling(node);
		dest.before(node);
		if (node === end) return;
		node = next_node;
	}
}
/**
* @param {EachState} state
* @param {Effect | null} prev
* @param {Effect | null} next
*/
function link(state, prev, next) {
	if (prev === null) state.effect.first = next;
	else prev.next = next;
	if (next === null) state.effect.last = prev;
	else next.prev = prev;
}
/**
* @param {Element | Text | Comment} node
* @param {() => string | TrustedHTML} get_value
* @param {boolean} [is_controlled]
* @param {boolean} [svg]
* @param {boolean} [mathml]
* @param {boolean} [skip_warning]
* @returns {void}
*/
function html(node, get_value, is_controlled = false, svg = false, mathml = false, skip_warning = false) {
	var anchor = node;
	/** @type {string | TrustedHTML} */
	var value = "";
	if (is_controlled) {
		var parent_node = node;
		if (hydrating) anchor = set_hydrate_node(/* @__PURE__ */ get_first_child(parent_node));
	}
	template_effect(() => {
		var effect = active_effect;
		if (value === (value = get_value() ?? "")) {
			if (hydrating) hydrate_next();
			return;
		}
		if (is_controlled && !hydrating) {
			effect.nodes = null;
			parent_node.innerHTML = value;
			if (value !== "") assign_nodes(/* @__PURE__ */ get_first_child(parent_node), parent_node.lastChild);
			return;
		}
		if (effect.nodes !== null) {
			remove_effect_dom(effect.nodes.start, effect.nodes.end);
			effect.nodes = null;
		}
		if (value === "") return;
		if (hydrating) {
			hydrate_node.data;
			/** @type {TemplateNode | null} */
			var next = hydrate_next();
			var last = next;
			while (next !== null && (next.nodeType !== 8 || next.data !== "")) {
				last = next;
				next = /* @__PURE__ */ get_next_sibling(next);
			}
			if (next === null) {
				hydration_mismatch();
				throw HYDRATION_ERROR;
			}
			assign_nodes(hydrate_node, last);
			anchor = set_hydrate_node(next);
			return;
		}
		var wrapper = create_element(svg ? "svg" : mathml ? "math" : "template", svg ? NAMESPACE_SVG : mathml ? NAMESPACE_MATHML : void 0);
		wrapper.innerHTML = value;
		/** @type {DocumentFragment | Element} */
		var node = svg || mathml ? wrapper : 		/** @type {HTMLTemplateElement} */ wrapper.content;
		assign_nodes(/* @__PURE__ */ get_first_child(node), node.lastChild);
		if (svg || mathml) while (/* @__PURE__ */ get_first_child(node)) anchor.before(/* @__PURE__ */ get_first_child(node));
		else anchor.before(node);
	});
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/actions.js
/** @import { ActionPayload } from '#client' */
/**
* @template P
* @param {Element} dom
* @param {(dom: Element, value?: P) => ActionPayload<P>} action
* @param {() => P} [get_value]
* @returns {void}
*/
function action(dom, action, get_value) {
	effect(() => {
		var payload = untrack(() => action(dom, get_value?.()) || {});
		if (get_value && payload?.update) {
			var inited = false;
			/** @type {P} */
			var prev = {};
			render_effect(() => {
				var value = get_value();
				deep_read_state(value);
				if (inited && safe_not_equal(prev, value)) {
					prev = value;
					/** @type {Function} */ payload.update(value);
				}
			});
			inited = true;
		}
		if (payload?.destroy) return () => payload.destroy();
	});
}
//#endregion
//#region node_modules/svelte/src/internal/shared/attributes.js
var whitespace = [..." 	\n\r\f\xA0\v﻿"];
/**
* @param {any} value
* @param {string | null} [hash]
* @param {Record<string, boolean>} [directives]
* @returns {string | null}
*/
function to_class(value, hash, directives) {
	var classname = value == null ? "" : "" + value;
	if (hash) classname = classname ? classname + " " + hash : hash;
	if (directives) {
		for (var key of Object.keys(directives)) if (directives[key]) classname = classname ? classname + " " + key : key;
		else if (classname.length) {
			var len = key.length;
			var a = 0;
			while ((a = classname.indexOf(key, a)) >= 0) {
				var b = a + len;
				if ((a === 0 || whitespace.includes(classname[a - 1])) && (b === classname.length || whitespace.includes(classname[b]))) classname = (a === 0 ? "" : classname.substring(0, a)) + classname.substring(b + 1);
				else a = b;
			}
		}
	}
	return classname === "" ? null : classname;
}
/**
*
* @param {Record<string,any>} styles
* @param {boolean} important
*/
function append_styles(styles, important = false) {
	var separator = important ? " !important;" : ";";
	var css = "";
	for (var key of Object.keys(styles)) {
		var value = styles[key];
		if (value != null && value !== "") css += " " + key + ": " + value + separator;
	}
	return css;
}
/**
* @param {string} name
* @returns {string}
*/
function to_css_name(name) {
	if (name[0] !== "-" || name[1] !== "-") return name.toLowerCase();
	return name;
}
/**
* @param {any} value
* @param {Record<string, any> | [Record<string, any>, Record<string, any>]} [styles]
* @returns {string | null}
*/
function to_style(value, styles) {
	if (styles) {
		var new_style = "";
		/** @type {Record<string,any> | undefined} */
		var normal_styles;
		/** @type {Record<string,any> | undefined} */
		var important_styles;
		if (Array.isArray(styles)) {
			normal_styles = styles[0];
			important_styles = styles[1];
		} else normal_styles = styles;
		if (value) {
			value = String(value).replaceAll(/\s*\/\*.*?\*\/\s*/g, "").trim();
			/** @type {boolean | '"' | "'"} */
			var in_str = false;
			var in_apo = 0;
			var in_comment = false;
			var reserved_names = [];
			if (normal_styles) reserved_names.push(...Object.keys(normal_styles).map(to_css_name));
			if (important_styles) reserved_names.push(...Object.keys(important_styles).map(to_css_name));
			var start_index = 0;
			var name_index = -1;
			const len = value.length;
			for (var i = 0; i < len; i++) {
				var c = value[i];
				if (in_comment) {
					if (c === "/" && value[i - 1] === "*") in_comment = false;
				} else if (in_str) {
					if (in_str === c) in_str = false;
				} else if (c === "/" && value[i + 1] === "*") in_comment = true;
				else if (c === "\"" || c === "'") in_str = c;
				else if (c === "(") in_apo++;
				else if (c === ")") in_apo--;
				if (!in_comment && in_str === false && in_apo === 0) {
					if (c === ":" && name_index === -1) name_index = i;
					else if (c === ";" || i === len - 1) {
						if (name_index !== -1) {
							var name = to_css_name(value.substring(start_index, name_index).trim());
							if (!reserved_names.includes(name)) {
								if (c !== ";") i++;
								var property = value.substring(start_index, i).trim();
								new_style += " " + property + ";";
							}
						}
						start_index = i + 1;
						name_index = -1;
					}
				}
			}
		}
		if (normal_styles) new_style += append_styles(normal_styles);
		if (important_styles) new_style += append_styles(important_styles, true);
		new_style = new_style.trim();
		return new_style === "" ? null : new_style;
	}
	return value == null ? null : String(value);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/class.js
/**
* @param {Element} dom
* @param {boolean | number} is_html
* @param {string | null} value
* @param {string} [hash]
* @param {Record<string, any>} [prev_classes]
* @param {Record<string, any>} [next_classes]
* @returns {Record<string, boolean> | undefined}
*/
function set_class(dom, is_html, value, hash, prev_classes, next_classes) {
	var prev = dom[CLASS_CACHE];
	if (hydrating || prev !== value || prev === void 0) {
		var next_class_name = to_class(value, hash, next_classes);
		if (!hydrating || next_class_name !== dom.getAttribute("class")) if (next_class_name == null) dom.removeAttribute("class");
		else if (is_html) dom.className = next_class_name;
		else dom.setAttribute("class", next_class_name);
		/** @type {any} */ dom[CLASS_CACHE] = value;
	} else if (next_classes && prev_classes !== next_classes) for (var key in next_classes) {
		var is_present = !!next_classes[key];
		if (prev_classes == null || is_present !== !!prev_classes[key]) dom.classList.toggle(key, is_present);
	}
	return next_classes;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/style.js
/**
* @param {Element & ElementCSSInlineStyle} dom
* @param {Record<string, any>} prev
* @param {Record<string, any>} next
* @param {string} [priority]
*/
function update_styles(dom, prev = {}, next, priority) {
	for (var key in next) {
		var value = next[key];
		if (prev[key] !== value) if (next[key] == null) dom.style.removeProperty(key);
		else dom.style.setProperty(key, value, priority);
	}
}
/**
* @param {Element & ElementCSSInlineStyle} dom
* @param {string | null} value
* @param {Record<string, any> | [Record<string, any>, Record<string, any>]} [prev_styles]
* @param {Record<string, any> | [Record<string, any>, Record<string, any>]} [next_styles]
*/
function set_style(dom, value, prev_styles, next_styles) {
	var prev = dom[STYLE_CACHE];
	if (hydrating || prev !== value) {
		var next_style_attr = to_style(value, next_styles);
		if (!hydrating || next_style_attr !== dom.getAttribute("style")) if (next_style_attr == null) dom.removeAttribute("style");
		else dom.style.cssText = next_style_attr;
		/** @type {any} */ dom[STYLE_CACHE] = value;
	} else if (next_styles) if (Array.isArray(next_styles)) {
		update_styles(dom, prev_styles?.[0], next_styles[0]);
		update_styles(dom, prev_styles?.[1], next_styles[1], "important");
	} else update_styles(dom, prev_styles, next_styles);
	return next_styles;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attributes.js
/** @import { Blocker, Effect } from '#client' */
var IS_CUSTOM_ELEMENT = Symbol("is custom element");
var IS_HTML = Symbol("is html");
var LINK_TAG = IS_XHTML ? "link" : "LINK";
var PROGRESS_TAG = IS_XHTML ? "progress" : "PROGRESS";
/**
* The value/checked attribute in the template actually corresponds to the defaultValue property, so we need
* to remove it upon hydration to avoid a bug when someone resets the form value.
* @param {HTMLInputElement} input
* @returns {void}
*/
function remove_input_defaults(input) {
	if (!hydrating) return;
	var already_removed = false;
	var remove_defaults = () => {
		if (already_removed) return;
		already_removed = true;
		if (input.hasAttribute("value")) {
			var value = input.value;
			set_attribute(input, "value", null);
			input.value = value;
		}
		if (input.hasAttribute("checked")) {
			var checked = input.checked;
			set_attribute(input, "checked", null);
			input.checked = checked;
		}
	};
	/** @type {any} */ input[FORM_RESET_HANDLER] = remove_defaults;
	queue_micro_task(remove_defaults);
	add_form_reset_listener();
}
/**
* @param {Element} element
* @param {any} value
*/
function set_value(element, value) {
	var attributes = get_attributes(element);
	if (attributes.value === (attributes.value = value ?? void 0) || element.value === value && (value !== 0 || element.nodeName !== PROGRESS_TAG)) return;
	element.value = value ?? "";
}
/**
* @param {Element} element
* @param {string} attribute
* @param {string | null} value
* @param {boolean} [skip_warning]
*/
function set_attribute(element, attribute, value, skip_warning) {
	var attributes = get_attributes(element);
	if (hydrating) {
		attributes[attribute] = element.getAttribute(attribute);
		if (attribute === "src" || attribute === "srcset" || attribute === "href" && element.nodeName === LINK_TAG) {
			if (!skip_warning);
			return;
		}
	}
	if (attributes[attribute] === (attributes[attribute] = value)) return;
	if (attribute === "loading") element[LOADING_ATTR_SYMBOL] = value;
	if (value == null) element.removeAttribute(attribute);
	else if (typeof value !== "string" && get_setters(element).includes(attribute)) element[attribute] = value;
	else element.setAttribute(attribute, value);
}
/**
*
* @param {Element} element
*/
function get_attributes(element) {
	return element[ATTRIBUTES_CACHE] ??= {
		[IS_CUSTOM_ELEMENT]: element.nodeName.includes("-"),
		[IS_HTML]: element.namespaceURI === NAMESPACE_HTML
	};
}
/** @type {Map<string, string[]>} */
var setters_cache = /* @__PURE__ */ new Map();
/** @param {Element} element */
function get_setters(element) {
	var cache_key = element.getAttribute("is") || element.nodeName;
	var setters = setters_cache.get(cache_key);
	if (setters) return setters;
	setters_cache.set(cache_key, setters = []);
	var descriptors;
	var proto = element;
	var element_proto = Element.prototype;
	while (element_proto !== proto) {
		descriptors = get_descriptors(proto);
		for (var key in descriptors) if (descriptors[key].set && key !== "innerHTML" && key !== "textContent" && key !== "innerText") setters.push(key);
		proto = get_prototype_of(proto);
	}
	return setters;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/input.js
/** @import { Batch } from '../../../reactivity/batch.js' */
/**
* @param {HTMLInputElement} input
* @param {() => unknown} get
* @param {(value: unknown) => void} set
* @returns {void}
*/
function bind_value(input, get, set = get) {
	var batches = /* @__PURE__ */ new WeakSet();
	listen_to_event_and_reset_event(input, "input", async (is_reset) => {
		/** @type {any} */
		var value = is_reset ? input.defaultValue : input.value;
		value = is_numberlike_input(input) ? to_number(value) : value;
		set(value);
		if (current_batch !== null) batches.add(current_batch);
		await tick();
		if (value !== (value = get())) {
			var start = input.selectionStart;
			var end = input.selectionEnd;
			var length = input.value.length;
			input.value = value ?? "";
			if (end !== null) {
				var new_length = input.value.length;
				if (start === end && end === length && new_length > length) {
					input.selectionStart = new_length;
					input.selectionEnd = new_length;
				} else {
					input.selectionStart = start;
					input.selectionEnd = Math.min(end, new_length);
				}
			}
		}
	});
	if (hydrating && input.defaultValue !== input.value || untrack(get) == null && input.value) {
		set(is_numberlike_input(input) ? to_number(input.value) : input.value);
		if (current_batch !== null) batches.add(current_batch);
	}
	render_effect(() => {
		var value = get();
		if (input === document.activeElement) {
			var batch = async_mode_flag ? previous_batch : current_batch;
			if (batches.has(batch)) return;
		}
		if (is_numberlike_input(input) && value === to_number(input.value)) return;
		if (input.type === "date" && !value && !input.value) return;
		if (value !== input.value) input.value = value ?? "";
	});
}
/**
* @param {HTMLInputElement} input
*/
function is_numberlike_input(input) {
	var type = input.type;
	return type === "number" || type === "range";
}
/**
* @param {string} value
*/
function to_number(value) {
	return value === "" ? null : +value;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
/** @import { ComponentContext, Effect } from '#client' */
/**
* @param {any} bound_value
* @param {Element} element_or_component
* @returns {boolean}
*/
function is_bound_this(bound_value, element_or_component) {
	return bound_value === element_or_component || bound_value?.[STATE_SYMBOL] === element_or_component;
}
/**
* @param {any} element_or_component
* @param {(value: unknown, ...parts: unknown[]) => void} update
* @param {(...parts: unknown[]) => unknown} get_value
* @param {() => unknown[]} [get_parts] Set if the this binding is used inside an each block,
* 										returns all the parts of the each block context that are used in the expression
* @returns {void}
*/
function bind_this(element_or_component = {}, update, get_value, get_parts) {
	var component_effect = component_context.r;
	var parent = active_effect;
	effect(() => {
		/** @type {unknown[]} */
		var old_parts;
		/** @type {unknown[]} */
		var parts;
		render_effect(() => {
			old_parts = parts;
			parts = get_parts?.() || [];
			untrack(() => {
				if (!is_bound_this(get_value(...parts), element_or_component)) {
					update(element_or_component, ...parts);
					if (old_parts && is_bound_this(get_value(...old_parts), element_or_component)) update(null, ...old_parts);
				}
			});
		});
		return () => {
			let p = parent;
			while (p !== component_effect && p.parent !== null && p.parent.f & 33554432) p = p.parent;
			const teardown = () => {
				if (parts && is_bound_this(get_value(...parts), element_or_component)) update(null, ...parts);
			};
			const original_teardown = p.teardown;
			p.teardown = () => {
				teardown();
				original_teardown?.();
			};
		};
	});
	return element_or_component;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/legacy/lifecycle.js
/** @import { ComponentContextLegacy } from '#client' */
/**
* Legacy-mode only: Call `onMount` callbacks and set up `beforeUpdate`/`afterUpdate` effects
* @param {boolean} [immutable]
*/
function init(immutable = false) {
	const context = component_context;
	const callbacks = context.l.u;
	if (!callbacks) return;
	let props = () => deep_read_state(context.s);
	if (immutable) {
		let version = 0;
		let prev = {};
		const d = /* @__PURE__ */ derived(() => {
			let changed = false;
			const props = context.s;
			for (const key in props) if (props[key] !== prev[key]) {
				prev[key] = props[key];
				changed = true;
			}
			if (changed) version++;
			return version;
		});
		props = () => get(d);
	}
	if (callbacks.b.length) user_pre_effect(() => {
		observe_all(context, props);
		run_all(callbacks.b);
	});
	user_effect(() => {
		const fns = untrack(() => callbacks.m.map(run));
		return () => {
			for (const fn of fns) if (typeof fn === "function") fn();
		};
	});
	if (callbacks.a.length) user_effect(() => {
		observe_all(context, props);
		run_all(callbacks.a);
	});
}
/**
* Invoke the getter of all signals associated with a component
* so they can be registered to the effect this function is called in.
* @param {ComponentContextLegacy} context
* @param {(() => void)} props
*/
function observe_all(context, props) {
	if (context.l.s) for (const signal of context.l.s) get(signal);
	props();
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/props.js
/** @import { Derived, Effect, Source } from './types.js' */
/**
* This function is responsible for synchronizing a possibly bound prop with the inner component state.
* It is used whenever the compiler sees that the component writes to the prop, or when it has a default prop_value.
* @template V
* @param {Record<string, unknown>} props
* @param {string} key
* @param {number} flags
* @param {V | (() => V)} [fallback]
* @returns {(() => V | ((arg: V) => V) | ((arg: V, mutation: boolean) => V))}
*/
function prop(props, key, flags, fallback) {
	var runes = !legacy_mode_flag || (flags & 2) !== 0;
	var bindable = (flags & 8) !== 0;
	var lazy = (flags & 16) !== 0;
	var fallback_value = fallback;
	var fallback_dirty = true;
	var fallback_signal = void 0;
	var get_fallback = () => {
		if (lazy && runes) {
			fallback_signal ??= /* @__PURE__ */ derived(fallback);
			return get(fallback_signal);
		}
		if (fallback_dirty) {
			fallback_dirty = false;
			fallback_value = lazy ? untrack(fallback) : fallback;
		}
		return fallback_value;
	};
	/** @type {((v: V) => void) | undefined} */
	let setter;
	if (bindable) {
		var is_entry_props = STATE_SYMBOL in props || LEGACY_PROPS in props;
		setter = get_descriptor(props, key)?.set ?? (is_entry_props && key in props ? (v) => props[key] = v : void 0);
	}
	/** @type {V} */
	var initial_value;
	var is_store_sub = false;
	if (bindable) [initial_value, is_store_sub] = capture_store_binding(() => props[key]);
	else initial_value = props[key];
	if (initial_value === void 0 && fallback !== void 0) {
		initial_value = get_fallback();
		if (setter) {
			if (runes) props_invalid_value(key);
			setter(initial_value);
		}
	}
	/** @type {() => V} */
	var getter;
	if (runes) getter = () => {
		var value = props[key];
		if (value === void 0) return get_fallback();
		fallback_dirty = true;
		return value;
	};
	else getter = () => {
		var value = props[key];
		if (value !== void 0) fallback_value = void 0;
		return value === void 0 ? fallback_value : value;
	};
	if (runes && (flags & 4) === 0) return getter;
	if (setter) {
		var legacy_parent = props.$$legacy;
		return (function(value, mutation) {
			if (arguments.length > 0) {
				if (!runes || !mutation || legacy_parent || is_store_sub)
 /** @type {Function} */ setter(mutation ? getter() : value);
				return value;
			}
			return getter();
		});
	}
	var overridden = false;
	var d = ((flags & 1) !== 0 ? derived : derived_safe_equal)(() => {
		overridden = false;
		return getter();
	});
	if (bindable) get(d);
	var parent_effect = active_effect;
	return (function(value, mutation) {
		if (arguments.length > 0) {
			const new_value = mutation ? get(d) : runes && bindable ? proxy(value) : value;
			set(d, new_value);
			overridden = true;
			if (fallback_value !== void 0) fallback_value = new_value;
			return value;
		}
		if (is_destroying_effect && overridden || (parent_effect.f & 16384) !== 0) return d.v;
		return get(d);
	});
}
if (typeof HTMLElement === "function");
/**
* `onMount`, like [`$effect`](https://svelte.dev/docs/svelte/$effect), schedules a function to run as soon as the component has been mounted to the DOM.
* Unlike `$effect`, the provided function only runs once.
*
* It must be called during the component's initialisation (but doesn't need to live _inside_ the component;
* it can be called from an external module). If a function is returned _synchronously_ from `onMount`,
* it will be called when the component is unmounted.
*
* `onMount` functions do not run during [server-side rendering](https://svelte.dev/docs/svelte/svelte-server#render).
*
* @template T
* @param {() => NotFunction<T> | Promise<NotFunction<T>> | (() => any)} fn
* @returns {void}
*/
function onMount(fn) {
	if (component_context === null) lifecycle_outside_component("onMount");
	if (legacy_mode_flag && component_context.l !== null) init_update_callbacks(component_context).m.push(fn);
	else user_effect(() => {
		const cleanup = untrack(fn);
		if (typeof cleanup === "function") return cleanup;
	});
}
/**
* Legacy-mode: Init callbacks object for onMount/beforeUpdate/afterUpdate
* @param {ComponentContext} context
*/
function init_update_callbacks(context) {
	var l = context.l;
	return l.u ??= {
		a: [],
		b: [],
		m: []
	};
}
//#endregion
//#region src/lib/sources.js
var sources = writable({});
var REG = {};
var _t = null;
function publish$1() {
	if (_t) return;
	_t = setTimeout(() => {
		_t = null;
		const o = {};
		for (const k in REG) o[k] = { ...REG[k] };
		sources.set(o);
	}, 60);
}
function declare(id, meta = {}) {
	if (!REG[id]) REG[id] = {
		id,
		name: id,
		group: "live",
		host: "",
		state: "idle",
		at: 0,
		ms: 0,
		n: null,
		msg: "",
		size: null,
		modified: "",
		optional: false
	};
	for (const k of Object.keys(meta)) if (meta[k] !== void 0) REG[id][k] = meta[k];
	publish$1();
	return REG[id];
}
function mark(id, patch) {
	const s = REG[id] || declare(id);
	Object.assign(s, patch);
	s.at = Date.now();
	publish$1();
}
function count(id, n) {
	if (REG[id] && n !== void 0 && n !== null) {
		REG[id].n = n;
		publish$1();
	}
}
var hostOf = (u) => {
	try {
		return new URL(u, location.href).host;
	} catch (e) {
		return "";
	}
};
async function tfetch(id, meta, url, init) {
	declare(id, {
		host: meta.host || hostOf(url),
		...meta
	});
	const t0 = performance.now();
	mark(id, {
		state: "busy",
		msg: ""
	});
	try {
		const r = await fetch(url, init), ms = Math.round(performance.now() - t0);
		if (!r.ok) {
			const why = r.status === 429 ? "rate limit" : r.status === 403 ? "forbidden" : r.status === 404 ? "not found" : r.status >= 500 ? "server error" : "";
			mark(id, {
				state: REG[id].optional && r.status === 404 ? "absent" : "error",
				ms,
				msg: "HTTP " + r.status + (why ? " · " + why : "")
			});
			return r;
		}
		mark(id, {
			state: "ok",
			ms,
			modified: r.headers.get("last-modified") || REG[id].modified,
			size: +(r.headers.get("content-length") || 0) || REG[id].size
		});
		return r;
	} catch (e) {
		mark(id, {
			state: "error",
			ms: Math.round(performance.now() - t0),
			msg: e && e.name === "AbortError" ? "timeout" : "no answer (network or CORS)"
		});
		throw e;
	}
}
async function tracked(id, meta, fn) {
	declare(id, meta);
	const t0 = performance.now();
	mark(id, {
		state: "busy",
		msg: ""
	});
	try {
		const r = await fn();
		const st = r && r.__stat ? r.__stat : {};
		mark(id, {
			state: st.state || "ok",
			ms: Math.round(performance.now() - t0),
			...st
		});
		return r;
	} catch (e) {
		mark(id, {
			state: "error",
			ms: Math.round(performance.now() - t0),
			msg: String(e && e.message || e)
		});
		throw e;
	}
}
var TALLY = {};
function tally(id, meta, ok) {
	const c = TALLY[id] || (TALLY[id] = {
		ok: 0,
		failed: 0
	});
	if (ok) c.ok++;
	else c.failed++;
	mark(id, {
		...meta,
		n: c.ok,
		state: c.failed === 0 ? "ok" : c.failed > c.ok ? "error" : "warn",
		msg: c.failed ? `${c.failed} failed` : ""
	});
}
function timg(id, meta, im) {
	declare(id, meta);
	const ol = im.onload, oe = im.onerror;
	const t0 = performance.now();
	mark(id, {
		state: "busy",
		msg: ""
	});
	im.onload = (e) => {
		mark(id, {
			state: "ok",
			ms: Math.round(performance.now() - t0),
			size: im.naturalWidth ? im.naturalWidth * im.naturalHeight : null,
			msg: im.naturalWidth ? im.naturalWidth + "×" + im.naturalHeight + " px" : ""
		});
		if (ol) ol(e);
	};
	im.onerror = (e) => {
		mark(id, {
			state: "error",
			ms: Math.round(performance.now() - t0),
			msg: "image failed (not found, or no CORS)"
		});
		if (oe) oe(e);
	};
}
//#endregion
//#region node_modules/svelte/src/internal/disclose-version.js
if (typeof window !== "undefined") ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region src/lib/api.js
var api = {};
//#endregion
//#region src/lib/stores.js
var toggleState = writable({});
var labels = writable({});
var searchMsg = writable("");
var facList = writable([]);
var facHidden = writable(/* @__PURE__ */ new Set());
var facColor = writable(false);
var timeBar = writable(false);
var selection = writable(null);
var stats = writable({
	sys: 0,
	pl: 0,
	nearLy: null,
	farLy: null
});
var camera = writable({
	distPc: 0,
	distText: "",
	band: "",
	real: true,
	inSolar: false,
	camZ: 0,
	sky: false,
	skyFrom: null,
	fov: 0,
	ra: 0,
	dec: 0
});
var nav = writable(null);
var tour = writable(null);
var timeline = writable({
	v: 0,
	label: "today",
	playing: false
});
var measure = writable(false);
var encounters = writable([]);
var transit = writable(null);
var survey = writable({
	id: null,
	blink: false,
	blinkWith: "ps1"
});
var userLayer = writable({
	sets: [],
	n: 0,
	warn: "",
	saved: false
});
var fieldQuery = writable({
	busy: null,
	msg: ""
});
var skyCursor = writable(null);
var movers = writable({
	list: [],
	a: "",
	b: "",
	ea: 0,
	eb: 0,
	dt: 0
});
var crossmatch = writable({
	busy: null,
	msg: "",
	set: -1,
	radius: 3,
	remote: null,
	known: 0,
	unknown: 0,
	n: 0,
	rows: []
});
var measureLog = writable([]);
var samp = writable({
	state: "off",
	msg: "",
	hub: null,
	clients: 0,
	sent: 0,
	received: 0
});
var observer = writable({
	on: false,
	lat: 0,
	lon: 0,
	elev: 0,
	name: "",
	frame: "icrs",
	refract: true,
	frameOn: false,
	fl: 1e3,
	sw: 23.5,
	sh: 15.6,
	px: 3.76,
	pa: 0,
	instr: "",
	fov: null,
	msg: ""
});
var lightcurve = writable({
	busy: null,
	msg: "",
	target: "",
	obs: [],
	data: null,
	analysis: null
});
var kinematics = writable({
	star: null,
	msg: ""
});
var fielddiag = writable({
	n: 0,
	msg: "",
	cmd: [],
	vpd: [],
	box: null,
	members: 0
});
//#endregion
//#region src/lib/icons.js
var ICONS = {
	search: "<circle cx=\"11\" cy=\"11\" r=\"6.5\"/><path d=\"M15.8 15.8 21 21\"/>",
	layers: "<path d=\"M12 3 3 7.6l9 4.6 9-4.6z\"/><path d=\"M3 12.2 12 16.8l9-4.6\"/><path d=\"M3 16.6 12 21.2l9-4.6\"/>",
	clock: "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M12 7.2V12l3.2 2\"/>",
	compass: "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"m15.4 8.6-2 4.8-4.8 2 2-4.8z\"/>",
	link: "<path d=\"M10 13.6a3.6 3.6 0 0 0 5.3.4l2.6-2.6a3.6 3.6 0 0 0-5.1-5.1l-1.5 1.5\"/><path d=\"M14 10.4a3.6 3.6 0 0 0-5.3-.4l-2.6 2.6a3.6 3.6 0 0 0 5.1 5.1l1.5-1.5\"/>",
	ruler: "<path d=\"m4.8 14.6 9.8-9.8a1.4 1.4 0 0 1 2 0l2.6 2.6a1.4 1.4 0 0 1 0 2l-9.8 9.8a1.4 1.4 0 0 1-2 0l-2.6-2.6a1.4 1.4 0 0 1 0-2z\"/><path d=\"m8.4 11 1.7 1.7M11 8.4l1.7 1.7M13.6 5.8l1.7 1.7M5.8 13.6l1.7 1.7\"/>",
	reset: "<path d=\"M3.8 12a8.2 8.2 0 1 0 2.5-5.9\"/><path d=\"M3.4 4.6v4.2h4.2\"/>",
	close: "<path d=\"m6.4 6.4 11.2 11.2M17.6 6.4 6.4 17.6\"/>",
	plus: "<path d=\"M12 5.6v12.8M5.6 12h12.8\"/>",
	minus: "<path d=\"M5.6 12h12.8\"/>",
	chevron: "<path d=\"m9.5 5.5 6.5 6.5-6.5 6.5\"/>",
	sliders: "<path d=\"M4 8h9M17 8h3M4 16h3M11 16h9\"/><circle cx=\"15\" cy=\"8\" r=\"2.1\"/><circle cx=\"9\" cy=\"16\" r=\"2.1\"/>",
	scope: "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M12 1.8v3.4M12 18.8v3.4M1.8 12h3.4M18.8 12h3.4\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/>",
	db: "<ellipse cx=\"12\" cy=\"6\" rx=\"7\" ry=\"2.6\"/><path d=\"M5 6v12c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6V6\"/><path d=\"M5 12c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6\"/>",
	live: "<path d=\"M2.8 12h3.6l2.6-6.4L12.6 18l2.4-6h6.2\"/>",
	legend: "<circle cx=\"5.4\" cy=\"6.6\" r=\"2.1\"/><path d=\"M10.6 6.6H21\"/><circle cx=\"5.4\" cy=\"12\" r=\"2.1\"/><path d=\"M10.6 12H21\"/><circle cx=\"5.4\" cy=\"17.4\" r=\"2.1\"/><path d=\"M10.6 17.4H21\"/>",
	lock: "<rect x=\"4.6\" y=\"10.2\" width=\"14.8\" height=\"9.8\" rx=\"2.2\"/><path d=\"M8 10.2V7.4a4 4 0 0 1 8 0v2.8\"/>",
	unlock: "<rect x=\"4.6\" y=\"10.2\" width=\"14.8\" height=\"9.8\" rx=\"2.2\"/><path d=\"M8 10.2V7.4a4 4 0 0 1 7.6-1.7\"/>",
	play: "<path d=\"M7.6 4.8 19 12 7.6 19.2z\" fill=\"currentColor\" stroke-linejoin=\"round\"/>",
	pause: "<rect x=\"7\" y=\"5\" width=\"3.6\" height=\"14\" rx=\"1.2\" fill=\"currentColor\"/><rect x=\"13.4\" y=\"5\" width=\"3.6\" height=\"14\" rx=\"1.2\" fill=\"currentColor\"/>",
	check: "<path d=\"m5 12.6 4.6 4.6L19 7.6\"/>",
	eyeoff: "<path d=\"M3 3l18 18\"/><path d=\"M10.6 6.3A9.6 9.6 0 0 1 12 6.2c5 0 9 5.8 9 5.8a17 17 0 0 1-2.7 3.3M6.6 8.1A17 17 0 0 0 3 12s4 5.8 9 5.8c1.2 0 2.3-.3 3.3-.8\"/><path d=\"M9.9 9.9a3 3 0 0 0 4.2 4.2\"/>",
	sun: "<circle cx=\"12\" cy=\"12\" r=\"4.2\"/><path d=\"M12 2.6v2.4M12 19v2.4M2.6 12H5M19 12h2.4M5.4 5.4 7 7M17 17l1.6 1.6M18.6 5.4 17 7M7 17l-1.6 1.6\"/>",
	globe: "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M3.5 12h17M12 3.5c2.2 2.4 3.4 5.4 3.4 8.5s-1.2 6.1-3.4 8.5c-2.2-2.4-3.4-5.4-3.4-8.5S9.8 5.9 12 3.5z\"/>",
	planet: "<circle cx=\"12\" cy=\"12\" r=\"6.4\"/><path d=\"M8.4 8.4a12 12 0 0 1 4.2 3.1 12 12 0 0 1 2.6 4.6\" opacity=\".55\"/>",
	ringed: "<circle cx=\"12\" cy=\"11\" r=\"5.2\"/><ellipse cx=\"12\" cy=\"11\" rx=\"10\" ry=\"3.2\" transform=\"rotate(-18 12 11)\"/>",
	ice: "<circle cx=\"12\" cy=\"12\" r=\"5.6\"/><path d=\"M12 6.4v11.2M7.2 9.2l9.6 5.6M16.8 9.2l-9.6 5.6\" opacity=\".5\"/>",
	probe: "<path d=\"M12 8.6V15\"/><rect x=\"3.4\" y=\"8.2\" width=\"5.2\" height=\"7.6\" rx=\"1\"/><rect x=\"15.4\" y=\"8.2\" width=\"5.2\" height=\"7.6\" rx=\"1\"/><circle cx=\"12\" cy=\"7\" r=\"2.2\"/>",
	comet: "<circle cx=\"16\" cy=\"8\" r=\"3.4\"/><path d=\"m12.6 11.4-8 8M9.4 10.2 5.6 14M13.8 14.6 10 18.4\"/>",
	star: "<path d=\"m12 3.4 2.5 5.6 6.1.6-4.6 4 1.4 6-5.4-3.2-5.4 3.2 1.4-6-4.6-4 6.1-.6z\"/>",
	system: "<circle cx=\"12\" cy=\"12\" r=\"2.4\"/><ellipse cx=\"12\" cy=\"12\" rx=\"9\" ry=\"4.4\" transform=\"rotate(-20 12 12)\"/><circle cx=\"20\" cy=\"9.6\" r=\"1.5\"/>",
	blackhole: "<circle cx=\"12\" cy=\"12\" r=\"3.6\"/><ellipse cx=\"12\" cy=\"12\" rx=\"9.4\" ry=\"3\" transform=\"rotate(-14 12 12)\" opacity=\".8\"/>",
	chart: "<path d=\"M3 3v18h18\"/><path d=\"M7 15l4-5 3 3 5-7\"/>",
	galaxy: "<circle cx=\"12\" cy=\"12\" r=\"1.7\"/><path d=\"M13.4 10.4c3.4-1.4 6.6.4 6.6 3 0 3.2-4.2 6-8 6-4.6 0-8-2.4-8-5.4\"/><path d=\"M10.6 13.6c-3.4 1.4-6.6-.4-6.6-3 0-3.2 4.2-6 8-6 4.6 0 8 2.4 8 5.4\"/>"
};
//#endregion
//#region src/components/Icon.svelte
var root$21 = /* @__PURE__ */ from_svg(`<svg class="ic svelte-13so817" viewBox="0 0 24 24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></svg>`);
function Icon($$anchor, $$props) {
	push($$props, true);
	let size = prop($$props, "size", 3, 16), stroke = prop($$props, "stroke", 3, 1.6), fill = prop($$props, "fill", 3, "none"), label = prop($$props, "label", 3, null);
	var svg = root$21();
	html(svg, () => ICONS[$$props.name] ?? "", true);
	reset(svg);
	template_effect(() => {
		set_attribute(svg, "width", size());
		set_attribute(svg, "height", size());
		set_attribute(svg, "fill", fill());
		set_attribute(svg, "stroke-width", stroke());
		set_attribute(svg, "aria-hidden", label() ? void 0 : "true");
		set_attribute(svg, "role", label() ? "img" : void 0);
		set_attribute(svg, "aria-label", label());
	});
	append($$anchor, svg);
	pop();
}
//#endregion
//#region src/components/ContextHeader.svelte
var root$20 = /* @__PURE__ */ from_html(`<div class="ctx-where mono"> <span class="ctx-mode"> </span></div>`);
var root_1$15 = /* @__PURE__ */ from_html(`<button type="button" class="ctx-solar on"><!>Leave the telescope</button>`);
var root_2$11 = /* @__PURE__ */ from_html(`<button type="button"><!> </button>`);
var root_3$10 = /* @__PURE__ */ from_html(`<div id="hud-head"><div class="ctx-app"><span class="dot" aria-hidden="true"></span>Known Universe</div> <div class="ctx-band"> </div> <!> <!></div>`);
function ContextHeader($$anchor, $$props) {
	push($$props, true);
	const $camera = () => store_get(camera, "$camera", $$stores);
	const [$$stores, $$cleanup] = setup_stores();
	let compact = prop($$props, "compact", 3, false);
	var div = root_3$10();
	let classes;
	var div_1 = sibling(child(div), 2);
	var text = child(div_1, true);
	reset(div_1);
	var node = sibling(div_1, 2);
	var consequent = ($$anchor) => {
		var div_2 = root$20();
		var text_1 = child(div_2);
		var span = sibling(text_1);
		var text_2 = child(span);
		reset(span);
		reset(div_2);
		template_effect(($0, $1, $2) => {
			set_text(text_1, `FOV ${$0 ?? ""}`);
			set_text(text_2, ` · RA ${$1 ?? ""}h · Dec ${$camera().dec >= 0 ? "+" : ""}${$2 ?? ""}°`);
		}, [
			() => $camera().fov >= 1 ? $camera().fov.toFixed($camera().fov < 10 ? 1 : 0) + "°" : $camera().fov >= 1 / 60 ? ($camera().fov * 60).toFixed(1) + "′" : ($camera().fov * 3600).toFixed(0) + "″",
			() => ($camera().ra / 15).toFixed(2),
			() => $camera().dec.toFixed(1)
		]);
		append($$anchor, div_2);
	};
	var alternate = ($$anchor) => {
		var div_3 = root$20();
		var text_3 = child(div_3);
		var span_1 = sibling(text_3);
		var text_4 = child(span_1);
		reset(span_1);
		reset(div_3);
		template_effect(() => {
			set_text(text_3, `${$camera().distText ?? ""}${$camera().distText && $camera().distText !== "at the Sun" ? " from the Sun" : ""}`);
			set_text(text_4, ` · ${$camera().real ? "real scale" : "compact view"}`);
		});
		append($$anchor, div_3);
	};
	if_block(node, ($$render) => {
		if ($camera().sky) $$render(consequent);
		else $$render(alternate, -1);
	});
	var node_1 = sibling(node, 2);
	var consequent_1 = ($$anchor) => {
		var button = root_1$15();
		Icon(child(button), {
			name: "scope",
			size: 15
		});
		next();
		reset(button);
		delegated("click", button, () => api.skyView?.(false));
		append($$anchor, button);
	};
	var consequent_2 = ($$anchor) => {
		var button_1 = root_2$11();
		let classes_1;
		var node_3 = child(button_1);
		{
			let $0 = /* @__PURE__ */ user_derived(() => $camera().inSolar ? "scope" : "sun");
			Icon(node_3, {
				get name() {
					return get($0);
				},
				size: 15
			});
		}
		var text_5 = sibling(node_3, 1, true);
		reset(button_1);
		template_effect(() => {
			classes_1 = set_class(button_1, 1, "ctx-solar", null, classes_1, { on: $camera().inSolar });
			set_text(text_5, $camera().inSolar ? "Back out to the stars" : "Into the solar system");
		});
		delegated("click", button_1, () => api.toggleSolar());
		append($$anchor, button_1);
	};
	if_block(node_1, ($$render) => {
		if (!compact() && $camera().sky) $$render(consequent_1);
		else if (!compact()) $$render(consequent_2, 1);
	});
	reset(div);
	template_effect(() => {
		classes = set_class(div, 1, "panel ctx", null, classes, { compact: compact() });
		set_text(text, $camera().band || "…");
	});
	append($$anchor, div);
	pop();
	$$cleanup();
}
delegate(["click"]);
//#endregion
//#region src/components/SearchBox.svelte
var root$19 = /* @__PURE__ */ from_html(`<button type="button" class="s-x" aria-label="Clear search"><!></button>`);
var root_1$14 = /* @__PURE__ */ from_html(`<button type="button" role="option"><span class="sg-n"> </span><span class="sg-k"> </span></button>`);
var root_2$10 = /* @__PURE__ */ from_html(`<div class="sugbox" id="search-sugs" role="listbox"></div>`);
var root_3$9 = /* @__PURE__ */ from_html(`<div class="searchMsg" role="status"> </div>`);
var root_4$6 = /* @__PURE__ */ from_html(`<div class="searchwrap"><div class="searchfield"><!> <input class="searchIn" type="text" spellcheck="false" role="combobox" aria-controls="search-sugs" aria-autocomplete="list" aria-label="Search for an object" placeholder="Search Earth, Sirius, TRAPPIST-1…"/> <!></div> <!> <!></div>`);
function SearchBox($$anchor, $$props) {
	push($$props, true);
	const $searchMsg = () => store_get(searchMsg, "$searchMsg", $$stores);
	const [$$stores, $$cleanup] = setup_stores();
	let mode = prop($$props, "mode", 3, "desktop"), onpick = prop($$props, "onpick", 3, () => {});
	let q = /* @__PURE__ */ state("");
	let sel = /* @__PURE__ */ state(-1);
	let sugs = /* @__PURE__ */ user_derived(() => get(q).trim().length >= 2 && api.suggest ? api.suggest(get(q)) : []);
	function go(name) {
		if (api.doSearch) api.doSearch(name);
		set(q, "");
		set(sel, -1);
		onpick()(name);
	}
	function key(e) {
		if (e.key === "ArrowDown" && get(sugs).length) {
			e.preventDefault();
			set(sel, (get(sel) + 1) % get(sugs).length);
			return;
		}
		if (e.key === "ArrowUp" && get(sugs).length) {
			e.preventDefault();
			set(sel, (get(sel) - 1 + get(sugs).length) % get(sugs).length);
			return;
		}
		if (e.key === "Enter") {
			const pick = get(sel) >= 0 && get(sugs)[get(sel)] ? get(sugs)[get(sel)][0] : get(q).trim();
			if (pick) go(pick);
		}
		if (e.key === "Escape") {
			set(q, "");
			set(sel, -1);
		}
	}
	var div = root_4$6();
	var div_1 = child(div);
	var node = child(div_1);
	Icon(node, {
		name: "search",
		size: 15
	});
	var input = sibling(node, 2);
	remove_input_defaults(input);
	var node_1 = sibling(input, 2);
	var consequent = ($$anchor) => {
		var button = root$19();
		Icon(child(button), {
			name: "close",
			size: 14
		});
		reset(button);
		delegated("click", button, () => {
			set(q, "");
			set(sel, -1);
		});
		append($$anchor, button);
	};
	if_block(node_1, ($$render) => {
		if (get(q)) $$render(consequent);
	});
	reset(div_1);
	var node_3 = sibling(div_1, 2);
	var consequent_1 = ($$anchor) => {
		var div_2 = root_2$10();
		each(div_2, 21, () => get(sugs), index, ($$anchor, sg, si) => {
			var button_1 = root_1$14();
			let classes;
			var span = child(button_1);
			var text = child(span, true);
			reset(span);
			var span_1 = sibling(span);
			var text_1 = child(span_1, true);
			reset(span_1);
			reset(button_1);
			template_effect(() => {
				set_attribute(button_1, "aria-selected", si === get(sel));
				classes = set_class(button_1, 1, "", null, classes, { sel: si === get(sel) });
				set_text(text, get(sg)[0]);
				set_text(text_1, get(sg)[2]);
			});
			delegated("click", button_1, () => go(get(sg)[0]));
			event("pointerenter", button_1, () => set(sel, si, true));
			append($$anchor, button_1);
		});
		reset(div_2);
		append($$anchor, div_2);
	};
	if_block(node_3, ($$render) => {
		if (get(sugs).length) $$render(consequent_1);
	});
	var node_4 = sibling(node_3, 2);
	var consequent_2 = ($$anchor) => {
		var div_3 = root_3$9();
		var text_2 = child(div_3, true);
		reset(div_3);
		template_effect(() => set_text(text_2, $searchMsg()));
		append($$anchor, div_3);
	};
	if_block(node_4, ($$render) => {
		if ($searchMsg()) $$render(consequent_2);
	});
	reset(div);
	template_effect(() => {
		set_attribute(div, "id", mode() === "desktop" ? "hud-search" : void 0);
		set_attribute(input, "aria-expanded", get(sugs).length > 0);
	});
	delegated("keydown", input, key);
	bind_value(input, () => get(q), ($$value) => set(q, $$value));
	append($$anchor, div);
	pop();
	$$cleanup();
}
delegate(["keydown", "click"]);
//#endregion
//#region node_modules/svelte/src/internal/flags/legacy.js
enable_legacy_mode_flag();
//#endregion
//#region src/lib/reserve.js
var RESERVED = /* @__PURE__ */ new Map();
function reserve(node, id) {
	const report = () => {
		const r = node.getBoundingClientRect();
		if (r.width > 0 && r.height > 0 && getComputedStyle(node).display !== "none") RESERVED.set(id, [
			r.left,
			r.top,
			r.right,
			r.bottom
		]);
		else RESERVED.delete(id);
	};
	const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(report) : null;
	ro?.observe(node);
	window.addEventListener("resize", report);
	report();
	return { destroy() {
		ro?.disconnect();
		window.removeEventListener("resize", report);
		RESERVED.delete(id);
	} };
}
//#endregion
//#region src/components/InfoCard.svelte
var root$18 = /* @__PURE__ */ from_html(`<button type="button" class="ib" aria-label="Release" title="Release (Esc)"><!></button>`);
var root_1$13 = /* @__PURE__ */ from_html(`<dt> </dt><dd> </dd>`, 1);
var root_2$9 = /* @__PURE__ */ from_html(`<li><b> </b><span> </span></li>`);
var root_3$8 = /* @__PURE__ */ from_html(`<li class="more"> </li>`);
var root_4$5 = /* @__PURE__ */ from_html(`<div class="in-sub"> </div> <ul class="in-planets"><!> <!></ul>`, 1);
var root_5$5 = /* @__PURE__ */ from_html(`<a target="_blank" rel="noopener"> </a>`);
var root_6$4 = /* @__PURE__ */ from_html(`<div class="in-links"></div>`);
var root_7$4 = /* @__PURE__ */ from_html(`<button type="button" title="Keep it centred while you zoom"><!> </button>`);
var root_8$4 = /* @__PURE__ */ from_html(`<button type="button" title="Set a course and see distance, light time and bearing"><!> </button>`);
var root_9$4 = /* @__PURE__ */ from_html(`<button type="button" title="A 1 g starship from Earth: how long would it take?"><!> </button>`);
var root_10$4 = /* @__PURE__ */ from_html(`<button type="button" title="Minimum-Δv transfer orbit from Earth"><!> </button>`);
var root_11$4 = /* @__PURE__ */ from_html(`<div class="in-actions" role="group" aria-label="Actions"><!> <!> <!> <!></div>`);
var root_12$4 = /* @__PURE__ */ from_html(`<div class="in-hint"> </div>`);
var root_13$3 = /* @__PURE__ */ from_html(`<section id="info" aria-live="polite"><header class="in-h"><span class="in-dot"></span> <div class="in-t"><div class="in-name"> </div> <div class="in-kind"> </div></div> <!></header> <dl class="in-rows"></dl> <!> <!> <!> <!></section>`);
function InfoCard($$anchor, $$props) {
	push($$props, false);
	const $selection = () => store_get(selection, "$selection", $$stores);
	const [$$stores, $$cleanup] = setup_stores();
	const rgb = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;
	const KIND = {
		gpick: "Catalogue point",
		cluster: "Cluster",
		pulsar: "Pulsar",
		lagrange: "Lagrange point",
		cme: "Solar storm",
		route: "Interstellar route",
		transfer: "Transfer orbit",
		spot: "Active region",
		satellite: "Satellite",
		fireball: "Fireball",
		sun: "Star",
		planet: "Planet",
		dwarf: "Dwarf planet",
		moon: "Moon",
		tno: "Trans-Neptunian object",
		probe: "Spacecraft",
		comet: "Comet",
		asteroid: "Asteroid",
		iso: "Interstellar object",
		neo: "Near-Earth object",
		dso: "Deep-sky object",
		sgra: "Black hole",
		exoplanet: "Exoplanet",
		galaxy: "Galaxy",
		star: "Star",
		host: "Exoplanet host"
	};
	init();
	var fragment = comment();
	var node = first_child(fragment);
	var consequent_10 = ($$anchor) => {
		const s = /* @__PURE__ */ derived_safe_equal($selection);
		const c = /* @__PURE__ */ derived_safe_equal(() => get(s).card);
		var section = root_13$3();
		let classes;
		var header = child(section);
		var span = child(header);
		var div = sibling(span, 2);
		var div_1 = child(div);
		var text = child(div_1, true);
		reset(div_1);
		var div_2 = sibling(div_1, 2);
		var text_1 = child(div_2, true);
		reset(div_2);
		reset(div);
		var node_1 = sibling(div, 2);
		var consequent = ($$anchor) => {
			var button = root$18();
			Icon(child(button), {
				name: "close",
				size: 15
			});
			reset(button);
			delegated("click", button, () => api.deselect());
			append($$anchor, button);
		};
		if_block(node_1, ($$render) => {
			if (get(s).pinned) $$render(consequent);
		});
		reset(header);
		var dl = sibling(header, 2);
		each(dl, 5, () => get(c).rows, ([k, v]) => k + v, ($$anchor, $$item) => {
			var $$array = /* @__PURE__ */ user_derived(() => to_array(get($$item), 2));
			let k = () => get($$array)[0];
			let v = () => get($$array)[1];
			var fragment_1 = root_1$13();
			var dt = first_child(fragment_1);
			var text_2 = child(dt, true);
			reset(dt);
			var dd = sibling(dt);
			let classes_1;
			var text_3 = child(dd, true);
			reset(dd);
			template_effect(($0) => {
				set_text(text_2, k());
				set_style(dd, $0);
				classes_1 = set_class(dd, 1, "", null, classes_1, { acc: k() === "Instrument" });
				set_text(text_3, v());
			}, [() => k() === "Instrument" && get(c).instrumentColor ? `color:${rgb(get(c).instrumentColor)}` : ""]);
			append($$anchor, fragment_1);
		});
		reset(dl);
		var node_3 = sibling(dl, 2);
		var consequent_2 = ($$anchor) => {
			var fragment_2 = root_4$5();
			var div_3 = first_child(fragment_2);
			var text_4 = child(div_3);
			reset(div_3);
			var ul = sibling(div_3, 2);
			var node_4 = child(ul);
			each(node_4, 1, () => get(c).planets, (p) => p.n, ($$anchor, p) => {
				var li = root_2$9();
				var b = child(li);
				var text_5 = child(b, true);
				reset(b);
				var span_1 = sibling(b);
				var text_6 = child(span_1);
				reset(span_1);
				reset(li);
				template_effect(() => {
					set_text(text_5, get(p).n);
					set_text(text_6, `${get(p).y ?? ""}${get(p).y && get(p).extra ? " · " : ""}${get(p).extra ?? ""}`);
				});
				append($$anchor, li);
			});
			var node_5 = sibling(node_4, 2);
			var consequent_1 = ($$anchor) => {
				var li_1 = root_3$8();
				var text_7 = child(li_1);
				reset(li_1);
				template_effect(() => set_text(text_7, `… and ${get(c).planetsTotal - get(c).planets.length} more`));
				append($$anchor, li_1);
			};
			if_block(node_5, ($$render) => {
				if (get(c).planetsTotal > get(c).planets.length) $$render(consequent_1);
			});
			reset(ul);
			template_effect(() => set_text(text_4, `${get(c).planetsTotal ?? ""} planet${get(c).planetsTotal === 1 ? "" : "s"}`));
			append($$anchor, fragment_2);
		};
		if_block(node_3, ($$render) => {
			if (get(c).planets) $$render(consequent_2);
		});
		var node_6 = sibling(node_3, 2);
		var consequent_3 = ($$anchor) => {
			var div_4 = root_6$4();
			each(div_4, 5, () => get(c).links, (l) => l.u, ($$anchor, l) => {
				var a = root_5$5();
				var text_8 = child(a, true);
				reset(a);
				template_effect(() => {
					set_attribute(a, "href", get(l).u);
					set_text(text_8, get(l).t);
				});
				append($$anchor, a);
			});
			reset(div_4);
			append($$anchor, div_4);
		};
		if_block(node_6, ($$render) => {
			if (get(c).links.length) $$render(consequent_3);
		});
		var node_7 = sibling(node_6, 2);
		var consequent_8 = ($$anchor) => {
			var div_5 = root_11$4();
			var node_8 = child(div_5);
			var consequent_4 = ($$anchor) => {
				var button_1 = root_7$4();
				let classes_2;
				var node_9 = child(button_1);
				{
					let $0 = /* @__PURE__ */ derived_safe_equal(() => get(s).locked ? "unlock" : "lock");
					Icon(node_9, {
						get name() {
							return get($0);
						},
						size: 14
					});
				}
				var text_9 = sibling(node_9, 1, true);
				reset(button_1);
				template_effect(() => {
					classes_2 = set_class(button_1, 1, "", null, classes_2, { on: get(s).locked });
					set_text(text_9, get(s).locked ? "Unlock" : "Lock");
				});
				delegated("click", button_1, () => api.lock());
				append($$anchor, button_1);
			};
			if_block(node_8, ($$render) => {
				if (get(s).lockable) $$render(consequent_4);
			});
			var node_10 = sibling(node_8, 2);
			var consequent_5 = ($$anchor) => {
				var button_2 = root_8$4();
				let classes_3;
				var node_11 = child(button_2);
				{
					let $0 = /* @__PURE__ */ derived_safe_equal(() => get(s).isNav ? "check" : "scope");
					Icon(node_11, {
						get name() {
							return get($0);
						},
						size: 14
					});
				}
				var text_10 = sibling(node_11, 1, true);
				reset(button_2);
				template_effect(() => {
					classes_3 = set_class(button_2, 1, "", null, classes_3, { on: get(s).isNav });
					set_text(text_10, get(s).isNav ? "Course set" : "Course");
				});
				delegated("click", button_2, () => get(s).isNav ? api.clearCourse() : api.setCourse());
				append($$anchor, button_2);
			};
			if_block(node_10, ($$render) => {
				if (get(s).navigable) $$render(consequent_5);
			});
			var node_12 = sibling(node_10, 2);
			var consequent_6 = ($$anchor) => {
				var button_3 = root_9$4();
				let classes_4;
				var node_13 = child(button_3);
				Icon(node_13, {
					name: "probe",
					size: 14
				});
				var text_11 = sibling(node_13, 1, true);
				reset(button_3);
				template_effect(() => {
					classes_4 = set_class(button_3, 1, "", null, classes_4, { on: get(s).routeOn });
					set_text(text_11, get(s).routeOn ? "Clear route" : "1 g route");
				});
				delegated("click", button_3, () => api.route());
				append($$anchor, button_3);
			};
			if_block(node_12, ($$render) => {
				if (get(s).routable) $$render(consequent_6);
			});
			var node_14 = sibling(node_12, 2);
			var consequent_7 = ($$anchor) => {
				var button_4 = root_10$4();
				let classes_5;
				var node_15 = child(button_4);
				Icon(node_15, {
					name: "probe",
					size: 14
				});
				var text_12 = sibling(node_15, 1, true);
				reset(button_4);
				template_effect(() => {
					classes_5 = set_class(button_4, 1, "", null, classes_5, { on: get(s).transferOn });
					set_text(text_12, get(s).transferOn ? "Clear transfer" : "Transfer");
				});
				delegated("click", button_4, () => api.transfer());
				append($$anchor, button_4);
			};
			if_block(node_14, ($$render) => {
				if (get(s).transferable) $$render(consequent_7);
			});
			reset(div_5);
			append($$anchor, div_5);
		};
		if_block(node_7, ($$render) => {
			if (get(s).lockable || get(s).navigable || get(s).routable || get(s).transferable) $$render(consequent_8);
		});
		var node_16 = sibling(node_7, 2);
		var consequent_9 = ($$anchor) => {
			var div_6 = root_12$4();
			var text_13 = child(div_6, true);
			reset(div_6);
			template_effect(() => set_text(text_13, get(c).hint));
			append($$anchor, div_6);
		};
		if_block(node_16, ($$render) => {
			if (get(c).hint) $$render(consequent_9);
		});
		reset(section);
		action(section, ($$node, $$action_arg) => reserve?.($$node, $$action_arg), () => "info");
		template_effect(($0, $1) => {
			classes = set_class(section, 1, "panel info", null, classes, { pinned: get(s).pinned });
			set_style(span, `background:${$0 ?? ""};box-shadow:0 0 10px ${$1 ?? ""}`);
			set_text(text, get(c).title);
			set_text(text_1, get(c).kindLabel ?? KIND[get(c).kind] ?? get(c).kind);
		}, [() => rgb(get(c).color), () => rgb(get(c).color)]);
		append($$anchor, section);
	};
	if_block(node, ($$render) => {
		if ($selection()) $$render(consequent_10);
	});
	append($$anchor, fragment);
	pop();
	$$cleanup();
}
delegate(["click"]);
//#endregion
//#region src/components/MwMap.svelte
var root$17 = /* @__PURE__ */ from_html(`<div class="panel" id="hud-mwmap"><div class="label">Milky Way · top-down</div> <canvas style="width:198px;height:150px;display:block" aria-label="Schematic top-down map of the Milky Way with the Sun marked"></canvas> <div class="mwcap">Schematic · ~100,000 light-years across</div></div>`);
function MwMap($$anchor, $$props) {
	push($$props, true);
	prop($$props, "collapsible", 3, true);
	let cv;
	onMount(() => {
		const W2 = 198, H2 = 150, cx = W2 / 2, cy = H2 * .54, Rd = 68, dpr = window.devicePixelRatio || 1;
		cv.width = W2 * dpr;
		cv.height = H2 * dpr;
		const g = cv.getContext("2d");
		if (!g) return;
		g.setTransform(dpr, 0, 0, dpr, 0, 0);
		g.save();
		g.translate(cx, cy);
		g.scale(1, .62);
		g.fillStyle = "rgba(90,110,175,0.07)";
		g.beginPath();
		g.arc(0, 0, Rd, 0, 6.2832);
		g.fill();
		for (let a = 0; a < 4; a++) {
			g.beginPath();
			for (let i = 0; i <= 130; i++) {
				const th = i / 130 * 3.7, r = 7 * Math.exp(.24 * th);
				if (r > Rd) break;
				const ang = th + a * Math.PI / 2, x = Math.cos(ang) * r, y = Math.sin(ang) * r;
				if (i === 0) g.moveTo(x, y);
				else g.lineTo(x, y);
			}
			g.strokeStyle = "rgba(150,180,240,0.32)";
			g.lineWidth = 3.4;
			g.stroke();
		}
		g.rotate(.5);
		g.fillStyle = "rgba(255,222,150,0.5)";
		g.beginPath();
		g.ellipse(0, 0, 24, 10, 0, 0, 6.2832);
		g.fill();
		g.restore();
		g.beginPath();
		g.arc(cx, cy, 3, 0, 6.2832);
		g.fillStyle = "#0a0a12";
		g.fill();
		g.strokeStyle = "rgba(255,205,130,0.95)";
		g.lineWidth = 1;
		g.stroke();
		g.font = "9px ui-monospace,monospace";
		g.fillStyle = "rgba(255,205,150,0.9)";
		g.fillText("Sgr A*", 104, cy - 3);
		const sr = Rd * .52, sa = -.85, sx = cx + Math.cos(sa) * sr, sy = cy + Math.sin(sa) * sr * .62;
		g.beginPath();
		g.arc(sx, sy, 3, 0, 6.2832);
		g.fillStyle = "#eafffb";
		g.fill();
		g.fillStyle = "rgba(233,237,250,0.9)";
		g.fillText("Sun", sx + 5, sy + 3);
	});
	var div = root$17();
	bind_this(sibling(child(div), 2), ($$value) => cv = $$value, () => cv);
	next(2);
	reset(div);
	append($$anchor, div);
	pop();
}
//#endregion
//#region src/lib/prefs.js
var KEY = "ku_layers_v2";
var SOLAR = [
	"t-moons",
	"t-ast",
	"t-belt",
	"t-tno",
	"t-probes",
	"t-iso",
	"t-helio",
	"t-lag",
	"t-cme",
	"t-neo",
	"t-sat",
	"t-sun",
	"t-size"
];
var STARS = [
	"t-hyg",
	"t-gpu",
	"t-gaia",
	"t-ruwe",
	"t-ob",
	"t-var",
	"t-radio"
];
var DEEP = [
	"t-dso",
	"t-oclu",
	"t-psr",
	"t-con",
	"t-met",
	"t-bubble",
	"t-mw",
	"t-mw3d",
	"t-lens",
	"t-hz"
];
var COSMOS = [
	"t-gal",
	"t-web",
	"t-qso",
	"t-edge"
];
var CONTENT_IDS = [
	...SOLAR,
	...STARS,
	...DEEP,
	...COSMOS
];
var PRESETS = [
	{
		k: "solar",
		n: "Solar system",
		icon: "sun",
		on: [
			...SOLAR,
			"t-hyg",
			"t-mw"
		]
	},
	{
		k: "near",
		n: "Neighbourhood",
		icon: "star",
		on: [
			...STARS,
			"t-bubble",
			"t-con",
			"t-hz",
			"t-size",
			"t-mw",
			"t-moons",
			"t-probes"
		]
	},
	{
		k: "deep",
		n: "Deep sky",
		icon: "galaxy",
		on: [
			...DEEP,
			"t-hyg",
			"t-gpu"
		]
	},
	{
		k: "cosmos",
		n: "Cosmos",
		icon: "scope",
		on: [
			...COSMOS,
			"t-mw",
			"t-mw3d",
			"t-qso"
		]
	},
	{
		k: "all",
		n: "Everything",
		icon: "layers",
		on: CONTENT_IDS
	}
];
function applyPreset(k) {
	const p = PRESETS.find((x) => x.k === k);
	if (!p || !api.setToggle) return;
	const on = new Set(p.on);
	for (const id of CONTENT_IDS) api.setToggle(id, on.has(id));
	save();
}
function matchPreset(state) {
	for (const p of PRESETS) {
		const on = new Set(p.on);
		if (CONTENT_IDS.every((id) => !!state[id] === on.has(id))) return p.k;
	}
	return null;
}
function save() {
	if (!api.readToggles) return;
	try {
		localStorage.setItem(KEY, JSON.stringify(api.readToggles()));
	} catch (e) {}
}
function restore() {
	if (!api.setToggle || !api.readToggles) return;
	let saved = null;
	try {
		saved = JSON.parse(localStorage.getItem(KEY) || "null");
	} catch (e) {}
	if (!saved) return;
	const live = api.readToggles();
	for (const id in saved) {
		if (!(id in live)) continue;
		if (id === "t-real") continue;
		api.setToggle(id, !!saved[id]);
	}
	toggleState.set(api.readToggles());
}
//#endregion
//#region src/components/Toggle.svelte
var root$16 = /* @__PURE__ */ from_html(`<button type="button" role="switch"><span class="tg-l"></span> <span class="sw" aria-hidden="true"></span></button>`);
function Toggle($$anchor, $$props) {
	let checked = prop($$props, "checked", 3, false), label = prop($$props, "label", 3, ""), onchange = prop($$props, "onchange", 3, () => {});
	var button = root$16();
	let classes;
	var span = child(button);
	html(span, label, true);
	reset(span);
	next(2);
	reset(button);
	template_effect(() => {
		classes = set_class(button, 1, "toggle", null, classes, { on: checked() });
		set_attribute(button, "aria-checked", checked());
	});
	delegated("click", button, function(...$$args) {
		onchange()?.apply(this, $$args);
	});
	append($$anchor, button);
}
delegate(["click"]);
//#endregion
//#region src/components/Controls.svelte
var root$15 = /* @__PURE__ */ from_html(`<button type="button"><!><span> </span></button>`);
var root_1$12 = /* @__PURE__ */ from_html(`<button type="button" class="lf-x" aria-label="Clear filter"><!></button>`);
var root_2$8 = /* @__PURE__ */ from_html(`<div><button type="button" class="ctl-h"><span class="ctl-hl"><!><!></span> <span class="caret"><!></span></button> <!></div>`);
var root_3$7 = /* @__PURE__ */ from_html(`<div class="lf-none"> </div>`);
var root_4$4 = /* @__PURE__ */ from_html(`<button type="button"><span class="cdot"></span> <span class="cl"> </span><span class="cn"> </span></button>`);
var root_5$4 = /* @__PURE__ */ from_html(`<div class="panel"><div class="presets" role="group" aria-label="Layer presets"></div> <div class="lfilter"><!> <input type="text" spellcheck="false" placeholder="Filter layers…" aria-label="Filter layers"/> <!></div> <!> <!> <div class="ctl-inst"><div class="label" style="margin-bottom:8px">Discovery instrument</div> <button type="button" role="switch"><span>colour by it</span><span class="sw" aria-hidden="true"></span></button> <div class="chips"></div></div> <div class="hint">Drag to orbit · right-drag to pan · scroll to zoom · double-click to focus<br/>WASD to fly · [.] frame selection · [Home] reset · [Esc] release</div></div>`);
function Controls($$anchor, $$props) {
	push($$props, true);
	const $labels = () => store_get(labels, "$labels", $$stores);
	const $toggleState = () => store_get(toggleState, "$toggleState", $$stores);
	const $timeBar = () => store_get(timeBar, "$timeBar", $$stores);
	const $facColor = () => store_get(facColor, "$facColor", $$stores);
	const $facList = () => store_get(facList, "$facList", $$stores);
	const $facHidden = () => store_get(facHidden, "$facHidden", $$stores);
	const [$$stores, $$cleanup] = setup_stores();
	let legend = prop($$props, "legend", 3, true);
	const groups = [
		{
			h: "Solar system",
			icon: "sun",
			items: [
				{
					id: "t-moons",
					label: "Moons",
					on: true
				},
				{
					id: "t-ast",
					label: "Asteroids &amp; comets",
					on: true
				},
				{
					id: "t-belt",
					label: "Asteroid field",
					on: true
				},
				{
					id: "t-tno",
					label: "Trans-Neptunian objects",
					on: true
				},
				{
					id: "t-probes",
					label: "Spacecraft",
					on: true
				},
				{
					id: "t-iso",
					label: "Interstellar visitors",
					on: true
				},
				{
					id: "t-helio",
					label: "Heliosphere",
					on: true
				},
				{
					id: "t-lag",
					label: "Lagrange points · Hill spheres",
					on: true
				},
				{
					id: "t-cme",
					label: "Solar storms · live",
					on: true
				},
				{
					id: "t-neo",
					label: "Asteroid flybys · live",
					on: true
				},
				{
					id: "t-sat",
					label: "Satellites · live",
					on: true
				},
				{
					id: "t-sun",
					label: "Sunspots · live",
					on: true
				},
				{
					id: "t-size",
					label: "Star size by real radius",
					on: true
				}
			]
		},
		{
			h: "Stars",
			icon: "star",
			items: [
				{
					id: "t-hyg",
					label: "Bright stars · HYG",
					on: true
				},
				{
					id: "t-user",
					label: "Your data · imported CSV",
					on: true
				},
				{
					id: "t-gaia",
					label: "Gaia stars · 100 pc",
					on: true
				},
				{
					id: "t-ruwe",
					label: "Hide suspect astrometry · RUWE > 1.4",
					on: false
				},
				{
					id: "t-ob",
					label: "OB stars · spiral-arm tracers",
					on: true
				},
				{
					id: "t-var",
					label: "Variable stars",
					on: true
				},
				{
					id: "t-radio",
					label: "Our radio bubble",
					on: true
				}
			]
		},
		{
			h: "Deep sky &amp; galaxy",
			icon: "galaxy",
			items: [
				{
					id: "t-dso",
					label: "Nebulae &amp; famous clusters",
					on: true
				},
				{
					id: "t-oclu",
					label: "Open clusters · globulars · FRBs",
					on: true
				},
				{
					id: "t-psr",
					label: "Pulsars",
					on: true
				},
				{
					id: "t-con",
					label: "Constellations",
					on: true
				},
				{
					id: "t-met",
					label: "Meteor showers · active now",
					on: true
				},
				{
					id: "t-bubble",
					label: "Local Bubble",
					on: true
				},
				{
					id: "t-mw",
					label: "Milky Way · Sgr A*",
					on: true
				},
				{
					id: "t-mw3d",
					label: "Milky Way structure",
					on: true
				},
				{
					id: "t-lens",
					label: "Lensing at Sgr A*",
					on: true
				},
				{
					id: "t-hz",
					label: "Habitable zone",
					on: true
				}
			]
		},
		{
			h: "Cosmos",
			icon: "scope",
			items: [
				{
					id: "t-gal",
					label: "Galaxies · Local Volume",
					on: true
				},
				{
					id: "t-web",
					label: "Cosmic web · 2MRS",
					on: true
				},
				{
					id: "t-qso",
					label: "Quasars",
					on: true
				},
				{
					id: "t-edge",
					label: "Observable universe · CMB",
					on: true
				}
			]
		},
		{
			h: "View",
			icon: "sliders",
			items: [
				{
					id: "t-real",
					label: "Compact view · distances compressed",
					on: false,
					inv: 1
				},
				{
					id: "t-rot",
					label: "Auto-rotate",
					on: false
				},
				{
					id: "t-freelook",
					label: "Free-look flight",
					on: false
				},
				{
					id: "t-veil",
					label: "Red veil beyond the charted stars",
					on: true
				},
				{
					id: "t-rings",
					label: "Distance rings",
					on: true
				},
				{
					id: "t-labels",
					label: "Labels",
					on: true
				},
				{
					id: "t-grid",
					label: "Celestial grid",
					on: false
				},
				{
					id: "t-ggrid",
					label: "Galactic grid",
					on: false
				},
				{
					id: "t-eht",
					label: "Sgr A* as the EHT image",
					on: false
				},
				{
					id: "t-timebar",
					label: "Timeline",
					on: false,
					ui: 1
				}
			]
		}
	];
	let closed = proxy({
		0: true,
		1: true,
		2: true,
		3: true
	});
	let filter = /* @__PURE__ */ state("");
	const plain = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").toLowerCase();
	let q = /* @__PURE__ */ user_derived(() => get(filter).trim().toLowerCase());
	function shown(g) {
		if (!get(q)) return g.items;
		return g.items.filter((d) => plain($labels()[d.id] ?? d.label).includes(get(q)));
	}
	let active = /* @__PURE__ */ user_derived(() => matchPreset($toggleState()));
	function isOn(d) {
		if (d.ui) return $timeBar();
		const v = $toggleState()[d.id] ?? d.on;
		return d.inv ? !v : v;
	}
	function tgl(id) {
		if (id === "t-timebar") {
			timeBar.update((v) => !v);
			return;
		}
		if (api.clickToggle) api.clickToggle(id);
		save();
	}
	function chip(k) {
		if (!api.toggleFac) return;
		const hidden = api.toggleFac(k);
		facHidden.update((s) => {
			const n = new Set(s);
			hidden ? n.add(k) : n.delete(k);
			return n;
		});
	}
	function colby() {
		if (api.facColorToggle) facColor.set(api.facColorToggle());
	}
	var div = root_5$4();
	var div_1 = child(div);
	each(div_1, 21, () => PRESETS, (p) => p.k, ($$anchor, p) => {
		var button = root$15();
		let classes;
		var node = child(button);
		Icon(node, {
			get name() {
				return get(p).icon;
			},
			size: 14
		});
		var span = sibling(node);
		var text = child(span, true);
		reset(span);
		reset(button);
		template_effect(() => {
			classes = set_class(button, 1, "preset", null, classes, { on: get(active) === get(p).k });
			set_attribute(button, "aria-pressed", get(active) === get(p).k);
			set_attribute(button, "title", `Show only: ${get(p).n ?? ""}`);
			set_text(text, get(p).n);
		});
		delegated("click", button, () => {
			applyPreset(get(p).k);
			toggleState.set(api.readToggles ? api.readToggles() : {});
		});
		append($$anchor, button);
	});
	reset(div_1);
	var div_2 = sibling(div_1, 2);
	var node_1 = child(div_2);
	Icon(node_1, {
		name: "search",
		size: 13
	});
	var input = sibling(node_1, 2);
	remove_input_defaults(input);
	var node_2 = sibling(input, 2);
	var consequent = ($$anchor) => {
		var button_1 = root_1$12();
		Icon(child(button_1), {
			name: "close",
			size: 13
		});
		reset(button_1);
		delegated("click", button_1, () => set(filter, ""));
		append($$anchor, button_1);
	};
	if_block(node_2, ($$render) => {
		if (get(filter)) $$render(consequent);
	});
	reset(div_2);
	var node_4 = sibling(div_2, 2);
	each(node_4, 17, () => groups, index, ($$anchor, g, gi) => {
		const items = /* @__PURE__ */ user_derived(() => shown(get(g)));
		var fragment = comment();
		var node_5 = first_child(fragment);
		var consequent_1 = ($$anchor) => {
			var div_3 = root_2$8();
			let classes_1;
			var button_2 = child(div_3);
			var span_1 = child(button_2);
			var node_6 = child(span_1);
			Icon(node_6, {
				get name() {
					return get(g).icon;
				},
				size: 14
			});
			html(sibling(node_6), () => get(g).h);
			reset(span_1);
			var span_2 = sibling(span_1, 2);
			Icon(child(span_2), {
				name: "chevron",
				size: 12
			});
			reset(span_2);
			reset(button_2);
			each(sibling(button_2, 2), 17, () => get(items), (d) => d.id, ($$anchor, d) => {
				{
					let $0 = /* @__PURE__ */ user_derived(() => isOn(get(d)));
					let $1 = /* @__PURE__ */ user_derived(() => $labels()[get(d).id] ?? get(d).label);
					Toggle($$anchor, {
						get checked() {
							return get($0);
						},
						get label() {
							return get($1);
						},
						onchange: () => tgl(get(d).id)
					});
				}
			});
			reset(div_3);
			template_effect(() => {
				classes_1 = set_class(div_3, 1, "ctl-group", null, classes_1, { closed: closed[gi] && !get(q) });
				set_attribute(button_2, "aria-expanded", !(closed[gi] && !get(q)));
			});
			delegated("click", button_2, () => {
				closed[gi] = !closed[gi];
			});
			append($$anchor, div_3);
		};
		if_block(node_5, ($$render) => {
			if (get(items).length) $$render(consequent_1);
		});
		append($$anchor, fragment);
	});
	var node_10 = sibling(node_4, 2);
	var consequent_2 = ($$anchor) => {
		var div_4 = root_3$7();
		var text_1 = child(div_4);
		reset(div_4);
		template_effect(() => set_text(text_1, `No layer matches “${get(filter) ?? ""}”.`));
		append($$anchor, div_4);
	};
	var d_1 = /* @__PURE__ */ user_derived(() => get(q) && groups.every((g) => !shown(g).length));
	if_block(node_10, ($$render) => {
		if (get(d_1)) $$render(consequent_2);
	});
	var div_5 = sibling(node_10, 2);
	var button_3 = sibling(child(div_5), 2);
	let classes_2;
	var div_6 = sibling(button_3, 2);
	each(div_6, 5, $facList, (f) => f.k, ($$anchor, f) => {
		var button_4 = root_4$4();
		let classes_3;
		var span_3 = child(button_4);
		var span_4 = sibling(span_3, 2);
		var text_2 = child(span_4, true);
		reset(span_4);
		var span_5 = sibling(span_4);
		var text_3 = child(span_5, true);
		reset(span_5);
		reset(button_4);
		template_effect(($0, $1, $2) => {
			classes_3 = set_class(button_4, 1, "chip", null, classes_3, $0);
			set_attribute(button_4, "aria-pressed", $1);
			set_style(span_3, `background:rgb(${get(f).c[0] ?? ""},${get(f).c[1] ?? ""},${get(f).c[2] ?? ""})`);
			set_text(text_2, get(f).l);
			set_text(text_3, $2);
		}, [
			() => ({ off: $facHidden().has(get(f).k) }),
			() => !$facHidden().has(get(f).k),
			() => get(f).n.toLocaleString("en-US")
		]);
		delegated("click", button_4, () => chip(get(f).k));
		append($$anchor, button_4);
	});
	reset(div_6);
	reset(div_5);
	next(2);
	reset(div);
	template_effect(() => {
		set_attribute(div, "id", legend() ? "hud-ctl" : void 0);
		classes_2 = set_class(button_3, 1, "colby", null, classes_2, { on: $facColor() });
		set_attribute(button_3, "aria-checked", $facColor());
	});
	bind_value(input, () => get(filter), ($$value) => set(filter, $$value));
	delegated("click", button_3, colby);
	append($$anchor, div);
	pop();
	$$cleanup();
}
delegate(["click"]);
//#endregion
//#region src/components/Legend.svelte
var root$14 = /* @__PURE__ */ from_html(`<button type="button" class="label lbl-btn"><span>Legend</span><span><!></span></button>`);
var root_1$11 = /* @__PURE__ */ from_html(`<div class="label">Legend</div>`);
var root_2$7 = /* @__PURE__ */ from_html(`<div class="label lg-sub">Star colour = temperature</div> <div class="spectrum"></div> <div class="spectrum-ax"><span>hot · 30,000 K</span><span>cool · 3,000 K</span></div> <div class="leg-row"><span style="display:flex;align-items:center;gap:5px;flex:0 0 auto"><span class="mk" style="width:4px;height:4px;background:var(--txt-2)"></span><span class="mk" style="width:11px;height:11px;background:var(--txt-2)"></span></span>Size = star radius</div> <div class="leg-row"><span class="mk" style="background:#eafffb;box-shadow:0 0 8px #fff"></span>Sun — you are here</div> <div class="leg-row"><span class="mk" style="background:var(--cyan)"></span>discovered in the selected year</div> <div class="leg-row"><span class="mk" style="background:#e6473c;box-shadow:0 0 8px #e6473c"></span>beyond the neighbourhood</div> <div class="leg-row"><span class="mk" style="width:5px;height:5px;background:#cfe0ff"></span>real stars · HYG catalogue</div> <div class="leg-row lg-grp"><span style="display:flex;gap:5px;flex:0 0 auto"><span class="mk" style="background:#c7dbff"></span> <span class="mk" style="background:#ffdeb0"></span> <span class="mk" style="background:#acc6ee"></span></span>Galaxies: spiral · elliptical · irregular</div> <div class="leg-row" style="flex-wrap:wrap"><span style="display:flex;gap:5px;flex:0 0 auto"><span class="mk" style="background:#ce966c"></span><span class="mk" style="background:#6ec4b8"></span> <span class="mk" style="background:#6e96e0"></span><span class="mk" style="background:#e2b484"></span></span>Planets: rocky · super-Earth · Neptune · gas giant</div> <div class="leg-row" style="flex-wrap:wrap"><span style="display:flex;gap:5px;flex:0 0 auto"><span class="mk" style="background:#96beff"></span><span class="mk" style="background:#ffe2a0"></span> <span class="mk" style="background:#ff7676"></span><span class="mk" style="background:#6ee6c6"></span></span>Deep-sky: open · globular · nebula · planetary</div>`, 1);
var root_3$6 = /* @__PURE__ */ from_html(`<div id="hud-tr"><!> <!></div>`);
function Legend($$anchor, $$props) {
	push($$props, true);
	let collapsible = prop($$props, "collapsible", 3, false);
	let open = /* @__PURE__ */ state(proxy(untrack(() => !collapsible())));
	var div = root_3$6();
	let classes;
	var node = child(div);
	var consequent = ($$anchor) => {
		var button = root$14();
		var span = sibling(child(button));
		let classes_1;
		Icon(child(span), {
			name: "chevron",
			size: 13
		});
		reset(span);
		reset(button);
		template_effect(() => {
			set_attribute(button, "aria-expanded", get(open));
			classes_1 = set_class(span, 1, "caret", null, classes_1, { open: get(open) });
		});
		delegated("click", button, () => set(open, !get(open)));
		append($$anchor, button);
	};
	var alternate = ($$anchor) => {
		append($$anchor, root_1$11());
	};
	if_block(node, ($$render) => {
		if (collapsible()) $$render(consequent);
		else $$render(alternate, -1);
	});
	var node_2 = sibling(node, 2);
	var consequent_1 = ($$anchor) => {
		var fragment = root_2$7();
		next(20);
		append($$anchor, fragment);
	};
	if_block(node_2, ($$render) => {
		if (get(open)) $$render(consequent_1);
	});
	reset(div);
	template_effect(() => classes = set_class(div, 1, "panel", null, classes, { mini: collapsible() && !get(open) }));
	append($$anchor, div);
	pop();
}
delegate(["click"]);
//#endregion
//#region src/components/NavConsole.svelte
var root$13 = /* @__PURE__ */ from_html(`<div class="panel navc" id="hud-nav" role="status"><span class="nv-name"><!> </span> <span class="nv-cell"><b class="mono"> </b><small>distance</small></span> <span class="nv-cell"><b class="mono"> </b><small>at light speed</small></span> <span class="nv-cell"><b class="mono"> </b><small>bearing</small></span> <button type="button" class="nv-go">Engage</button> <button type="button" class="ib" aria-label="Clear course"><!></button></div>`);
function NavConsole($$anchor, $$props) {
	push($$props, false);
	const $nav = () => store_get(nav, "$nav", $$stores);
	const [$$stores, $$cleanup] = setup_stores();
	init();
	var fragment = comment();
	var node = first_child(fragment);
	var consequent = ($$anchor) => {
		var div = root$13();
		var span = child(div);
		var node_1 = child(span);
		Icon(node_1, {
			name: "scope",
			size: 14
		});
		var text = sibling(node_1, 1, true);
		reset(span);
		var span_1 = sibling(span, 2);
		var b = child(span_1);
		var text_1 = child(b, true);
		reset(b);
		next();
		reset(span_1);
		var span_2 = sibling(span_1, 2);
		var b_1 = child(span_2);
		var text_2 = child(b_1, true);
		reset(b_1);
		next();
		reset(span_2);
		var span_3 = sibling(span_2, 2);
		var b_2 = child(span_3);
		var text_3 = child(b_2, true);
		reset(b_2);
		next();
		reset(span_3);
		var button = sibling(span_3, 2);
		var button_1 = sibling(button, 2);
		Icon(child(button_1), {
			name: "close",
			size: 14
		});
		reset(button_1);
		reset(div);
		action(div, ($$node, $$action_arg) => reserve?.($$node, $$action_arg), () => "nav");
		template_effect(() => {
			set_text(text, $nav().name);
			set_text(text_1, $nav().dist);
			set_text(text_2, $nav().light);
			set_text(text_3, $nav().bearing);
		});
		delegated("click", button, () => api.engage());
		delegated("click", button_1, () => api.clearCourse());
		append($$anchor, div);
	};
	if_block(node, ($$render) => {
		if ($nav()) $$render(consequent);
	});
	append($$anchor, fragment);
	pop();
	$$cleanup();
}
delegate(["click"]);
//#endregion
//#region src/components/Timeline.svelte
var root$12 = /* @__PURE__ */ from_html(`<div class="panel tl" id="hud-uni" role="group" aria-label="Time"><button type="button" class="ib"><!></button> <button type="button" class="ib" aria-label="Back to today" title="Back to today"><!></button> <span class="tl-val mono"> </span> <input type="range" class="tl-range" min="-1000" max="1000" step="1" aria-label="Time"/> <span class="tl-cap">−2 Myr · +2 Myr</span></div>`);
function Timeline($$anchor, $$props) {
	push($$props, false);
	const $timeline = () => store_get(timeline, "$timeline", $$stores);
	const [$$stores, $$cleanup] = setup_stores();
	init();
	var div = root$12();
	var button = child(div);
	var node = child(button);
	{
		let $0 = /* @__PURE__ */ derived_safe_equal(() => $timeline().playing ? "pause" : "play");
		Icon(node, {
			get name() {
				return get($0);
			},
			size: 15
		});
	}
	reset(button);
	var button_1 = sibling(button, 2);
	Icon(child(button_1), {
		name: "reset",
		size: 14
	});
	reset(button_1);
	var span = sibling(button_1, 2);
	var text = child(span, true);
	reset(span);
	var input = sibling(span, 2);
	remove_input_defaults(input);
	next(2);
	reset(div);
	action(div, ($$node, $$action_arg) => reserve?.($$node, $$action_arg), () => "timeline");
	template_effect(() => {
		set_attribute(button, "aria-label", $timeline().playing ? "Pause" : "Play time");
		set_text(text, $timeline().label);
		set_value(input, $timeline().v);
	});
	delegated("click", button, () => api.timeline?.play());
	delegated("click", button_1, () => api.timeline?.now());
	delegated("input", input, (e) => api.timeline?.set(+e.target.value));
	append($$anchor, div);
	pop();
	$$cleanup();
}
delegate(["click", "input"]);
//#endregion
//#region src/components/TourPanel.svelte
var root$11 = /* @__PURE__ */ from_html(`<div class="panel tourp" id="tourPanel" role="dialog" aria-label="Cosmic tour"><div class="tp-head"><span class="tp-step mono"> </span> <span class="tp-title"> </span> <button type="button" class="ib" aria-label="End tour"><!></button></div> <p class="tp-text"> </p> <div class="tp-nav"><button type="button"><!> Back</button> <button type="button" class="primary"> <!></button></div></div>`);
function TourPanel($$anchor, $$props) {
	push($$props, false);
	const $tour = () => store_get(tour, "$tour", $$stores);
	const [$$stores, $$cleanup] = setup_stores();
	init();
	var fragment = comment();
	var node = first_child(fragment);
	var consequent = ($$anchor) => {
		var div = root$11();
		var div_1 = child(div);
		var span = child(div_1);
		var text = child(span);
		reset(span);
		var span_1 = sibling(span, 2);
		var text_1 = child(span_1, true);
		reset(span_1);
		var button = sibling(span_1, 2);
		Icon(child(button), {
			name: "close",
			size: 15
		});
		reset(button);
		reset(div_1);
		var p = sibling(div_1, 2);
		var text_2 = child(p, true);
		reset(p);
		var div_2 = sibling(p, 2);
		var button_1 = child(div_2);
		Icon(child(button_1), {
			name: "chevron",
			size: 14
		});
		next();
		reset(button_1);
		var button_2 = sibling(button_1, 2);
		var text_3 = child(button_2);
		Icon(sibling(text_3), {
			name: "chevron",
			size: 14
		});
		reset(button_2);
		reset(div_2);
		reset(div);
		action(div, ($$node, $$action_arg) => reserve?.($$node, $$action_arg), () => "tour");
		template_effect(() => {
			set_text(text, `${$tour().idx + 1} / ${$tour().total ?? ""}`);
			set_text(text_1, $tour().title);
			set_text(text_2, $tour().text);
			button_1.disabled = $tour().idx === 0;
			set_text(text_3, `${$tour().idx + 1 >= $tour().total ? "Finish" : "Next"} `);
		});
		delegated("click", button, () => api.tour.end());
		delegated("click", button_1, () => api.tour.prev());
		delegated("click", button_2, () => api.tour.next());
		append($$anchor, div);
	};
	if_block(node, ($$render) => {
		if ($tour()) $$render(consequent);
	});
	append($$anchor, fragment);
	pop();
	$$cleanup();
}
delegate(["click"]);
//#endregion
//#region src/components/TimePane.svelte
var root$10 = /* @__PURE__ */ from_html(`<li><button type="button"><span class="enc-n"> </span> <span class="enc-t mono"> </span> <span class="enc-d mono"> </span> <span class="enc-v mono"> </span></button></li>`);
var root_1$10 = /* @__PURE__ */ from_html(`<div class="panel" id="hud-time"><div class="label">Time</div> <p class="hint">One slider for all of time. Within ±100 years the planets and moons run on
    their orbits; beyond that the stars fly along their measured velocities, out to ±2 million years.</p> <button type="button" role="switch"><span class="tg-l">Timeline strip</span><span class="sw" aria-hidden="true"></span></button> <div class="tl-now mono"> </div> <div class="label lg-sub">Close encounters</div> <p class="hint">Stars whose straight-line path brings them within 1.5 pc of the Sun. Click one to
    jump to the moment and fly there. From HYG proper motions and radial velocities — a catalogue's
    tenth of a milliarcsecond decides the miss distance, so treat the AU as rough.</p> <ul class="enc"></ul> <button type="button" class="enc-reset"><!>Back to today</button></div>`);
function TimePane($$anchor, $$props) {
	push($$props, false);
	const $timeBar = () => store_get(timeBar, "$timeBar", $$stores);
	const $timeline = () => store_get(timeline, "$timeline", $$stores);
	const $encounters = () => store_get(encounters, "$encounters", $$stores);
	const [$$stores, $$cleanup] = setup_stores();
	const PC2LY = 3.261564;
	const when = (t) => {
		const a = Math.abs(t), s = t < 0 ? "−" : "+";
		return a >= 1e6 ? `${s}${(a / 1e6).toFixed(2)} Myr` : `${s}${Math.round(a / 1e3)},000 yr`;
	};
	const dist = (d) => d < .3 ? `${(d * 206265).toLocaleString("en-US", { maximumFractionDigits: 0 })} AU` : `${(d * PC2LY).toFixed(2)} ly`;
	init();
	var div = root_1$10();
	var button = sibling(child(div), 4);
	let classes;
	var div_1 = sibling(button, 2);
	var text = child(div_1, true);
	reset(div_1);
	var ul = sibling(div_1, 6);
	each(ul, 5, $encounters, (e) => e.i, ($$anchor, e) => {
		var li = root$10();
		var button_1 = child(li);
		var span = child(button_1);
		var text_1 = child(span, true);
		reset(span);
		var span_1 = sibling(span, 2);
		var text_2 = child(span_1, true);
		reset(span_1);
		var span_2 = sibling(span_1, 2);
		var text_3 = child(span_2, true);
		reset(span_2);
		var span_3 = sibling(span_2, 2);
		var text_4 = child(span_3);
		reset(span_3);
		reset(button_1);
		reset(li);
		template_effect(($0, $1, $2) => {
			set_text(text_1, get(e).name);
			set_text(text_2, $0);
			set_text(text_3, $1);
			set_text(text_4, `${$2 ?? ""} km/s`);
		}, [
			() => when(get(e).t),
			() => dist(get(e).d),
			() => Math.round(get(e).v)
		]);
		delegated("click", button_1, () => api.gotoEncounter?.(get(e).i));
		append($$anchor, li);
	});
	reset(ul);
	var button_2 = sibling(ul, 2);
	Icon(child(button_2), {
		name: "reset",
		size: 13
	});
	next();
	reset(button_2);
	reset(div);
	template_effect(() => {
		classes = set_class(button, 1, "toggle", null, classes, { on: $timeBar() });
		set_attribute(button, "aria-checked", $timeBar());
		set_text(text, $timeline().label);
	});
	delegated("click", button, () => timeBar.update((v) => !v));
	delegated("click", button_2, () => api.timeline?.now());
	append($$anchor, div);
	pop();
	$$cleanup();
}
delegate(["click"]);
//#endregion
//#region src/components/SkyPane.svelte
var root$9 = /* @__PURE__ */ from_html(`<p class="hint">Standing at <b> </b>: every star's brightness follows its distance from there, the Sun
      is one of them. The photographs, the jump list and the catalogue queries belong to the Sun's sky and stay off here.</p> <button type="button" class="sky-aim"><!>Back to the Sun's sky</button>`, 1);
var root_1$9 = /* @__PURE__ */ from_html(`<button type="button" class="sky-aim"><!> </button>`);
var root_2$6 = /* @__PURE__ */ from_html(`<button type="button" class="chip"> </button>`);
var root_3$5 = /* @__PURE__ */ from_html(`<div class="sky-ro mono"><span> </span> <span> </span> <span> </span></div> <div class="sky-fov"></div> <!>`, 1);
var root_4$3 = /* @__PURE__ */ from_html(`<button type="button"><span class="sv-n"> <span class="sv-b mono"> </span></span><span class="sv-s"> </span></button>`);
var root_5$3 = /* @__PURE__ */ from_html(`<button type="button"><span class="sv-n">Your image<span class="sv-b mono">FITS</span></span> <span class="sv-s"> </span></button>`);
var root_6$3 = /* @__PURE__ */ from_html(`<button type="button" class="chip">Remove</button> <button type="button" class="chip">Point at it</button>`, 1);
var root_7$3 = /* @__PURE__ */ from_html(`<p class="hint warn"> </p>`);
var root_8$3 = /* @__PURE__ */ from_html(`<button type="button"> </button>`);
var root_9$3 = /* @__PURE__ */ from_html(`<button type="button">Your image</button>`);
var root_10$3 = /* @__PURE__ */ from_html(`<li><button type="button"><span> </span> <span class="enc-t mono"> </span> <span class="enc-d mono"> </span> <span class="enc-v mono"> </span></button></li>`);
var root_11$3 = /* @__PURE__ */ from_html(`<ul class="enc mov"></ul>`);
var root_12$3 = /* @__PURE__ */ from_html(`<p class="hint">Nothing in this field moves by half an arcsecond or more — or zoom in: only stars on screen are listed.</p>`);
var root_13$2 = /* @__PURE__ */ from_html(`<div class="label lg-sub">Expected jumps</div> <p class="hint"> </p> <!>`, 1);
var root_14$2 = /* @__PURE__ */ from_html(`<div class="label lg-sub">Go deeper</div> <p class="hint"><a target="_blank" rel="noopener">Open this field in Aladin Lite</a> for every survey and catalogue the CDS holds.
      Hunt for moving objects with real data at <a href="https://www.zooniverse.org/projects/marckuchner/backyard-worlds-planet-9" target="_blank" rel="noopener">Backyard Worlds</a> (WISE blinks) or transits at <a href="https://www.zooniverse.org/projects/nora-dot-eisner/planet-hunters-tess" target="_blank" rel="noopener">Planet Hunters TESS</a>.</p>`, 1);
var root_15$2 = /* @__PURE__ */ from_html(`<div class="usr-row"><span class="usr-n"> </span> <span class="usr-c mono"> </span> <button type="button" class="usr-x"><!></button></div> <div class="sky-fov xm-tools"><button type="button" class="chip">CSV</button> <button type="button" class="chip">VOTable</button> <button type="button" class="chip">Check against loaded catalogues</button> <button type="button" class="chip">Identify · Gaia DR3</button> <button type="button" class="chip">Identify · SIMBAD</button></div>`, 1);
var root_16$1 = /* @__PURE__ */ from_html(`<label class="xm-r mono">radius <input type="number" min="0.1" max="60" step="0.5"/> ″</label> <p class="hint">Cross-identification: each row is compared with the loaded HYG and Gaia clouds at once, or sent to the CDS X-Match
      service for Gaia DR3 (J2016.0) or SIMBAD (J2000.0) identifiers. Rows with proper motion are moved to the catalogue's epoch
      first; rows without one need a radius that covers their motion. A row with no counterpart is drawn <span class="xm-unk">red</span>.</p>`, 1);
var root_17$1 = /* @__PURE__ */ from_html(`<p> </p>`);
var root_18$1 = /* @__PURE__ */ from_html(`<span> </span>`);
var root_19 = /* @__PURE__ */ from_html(`<span class="xm-doubt"> </span>`);
var root_20 = /* @__PURE__ */ from_html(`<li><button type="button"><span> </span> <span class="enc-t mono"> </span> <span> </span> <span class="enc-v mono"> </span></button></li>`);
var root_21 = /* @__PURE__ */ from_html(`<ul class="enc mov xm-list"></ul>`);
var root_22 = /* @__PURE__ */ from_html(`<div class="sky-ro mono xm-sum"><span class="xm-unk"> </span><span> </span><!><!><span> </span></div> <!>`, 1);
var root_23 = /* @__PURE__ */ from_html(`<p class="hint warn">Not kept after a reload: too large for this browser's storage.</p>`);
var root_24 = /* @__PURE__ */ from_html(`<p class="hint">Switch the telescope on to ask for a field.</p>`);
var root_25 = /* @__PURE__ */ from_html(`<span class="xm-unk">below the horizon</span>`);
var root_26 = /* @__PURE__ */ from_html(`<div class="sky-ro mono"><span> </span><span> </span><!></div>`);
var root_27 = /* @__PURE__ */ from_html(`<span class="mono obs-fov"> </span>`);
var root_28 = /* @__PURE__ */ from_html(`<button type="button" class="chip on">Disconnect</button> <button type="button" class="chip">Point hub clients here</button> <!>`, 1);
var root_29 = /* @__PURE__ */ from_html(`<button type="button" class="chip">Connect to the hub</button>`);
var root_30 = /* @__PURE__ */ from_html(`<div class="panel" id="hud-sky"><div class="label">Sky</div> <p class="hint">The sky as the surveys photographed it, under the catalogue. From the Sun the view
    direction is the sky direction. Catalogue positions are propagated to the displayed epoch
    (HYG from J2000, Gaia from 2016, your rows from their own), the photographs keep theirs —
    so a fast star stands off its plate by its motion since. The arrows say how far.</p> <button type="button" role="switch"><span class="tg-l">Telescope view</span><span class="sw" aria-hidden="true"></span></button> <!> <!> <!> <div class="label lg-sub">Survey</div> <div class="sky-list"><button type="button"><span class="sv-n">None</span><span class="sv-s">catalogue only</span></button> <!> <!></div> <div class="sky-fov"><input type="file" accept=".fits,.fit,.fts,application/fits" hidden=""/> <button type="button" class="chip"> </button> <!></div> <!> <p class="hint">A FITS image with a TAN WCS (any plate-solved exposure: astrometry.net, PixInsight, a survey cutout) is drawn on the
    sky like a survey and can be blinked against one. Your exposure's epoch comes from DATE-OBS, so the expected jumps are computed against it.</p> <div class="label lg-sub">Blink</div> <p class="hint">Alternate two epochs. A star that jumps between them has a large proper motion:
    close, or fast, or both. Nearby brown dwarfs and white dwarfs still turn up this way.</p> <button type="button" role="switch"><span class="tg-l"> </span><span class="sw" aria-hidden="true"></span></button> <div class="sky-fov"><!> <!></div> <!> <!> <div class="label lg-sub">Your data</div> <p class="hint">Drop a CSV or TSV anywhere on the map, or pick a file. Columns by name: <span class="mono">ra, dec</span> (degrees or 03:47:24 / +24 07 00), a distance (<span class="mono">dist</span> pc, <span class="mono">plx</span> mas or <span class="mono">ly</span>), <span class="mono">mag</span>, <span class="mono">name</span>, <span class="mono">pmra, pmdec</span>.
    Rows become amber rings you can click, search and point the telescope at; the file stays in this browser only.</p> <!> <!> <!> <!> <!> <!> <div class="sky-fov"><input type="file" accept=".csv,.tsv,.txt,text/csv,text/plain" hidden=""/> <button type="button" class="chip">Import a file…</button> <a class="chip" href="./data/sample-stars.csv" download="">Example CSV</a></div> <div class="label lg-sub">Ask the catalogues</div> <p class="hint">Fetch what Gaia DR3 or SIMBAD hold in the field the telescope shows, straight from the CDS into this
    layer: positions, parallaxes, proper motions, magnitudes. Gaia returns the brightest 4,000 of the cone, SIMBAD 2,000.</p> <div class="sky-fov"><button type="button" class="chip">Gaia DR3 in this field</button> <button type="button" class="chip">SIMBAD in this field</button></div> <!> <!> <div class="label lg-sub">Observer</div> <p class="hint">A place on Earth turns the telescope into an instrument that knows where up is: altitude, azimuth and airmass for the
    field, the cursor and every card; rise, transit and set; the horizon across the sky. The clock is the timeline's. The maths is
    IAU 2006/2000B, checked against astropy (<span class="mono">npm run test:astro</span>).</p> <div class="obs-grid"><label class="mono">lat <input type="number" step="0.0001" min="-90" max="90" placeholder="48.137"/></label> <label class="mono">lon <input type="number" step="0.0001" min="-180" max="180" placeholder="11.575 (east +)"/></label> <label class="mono">elev <input type="number" step="1" placeholder="m"/></label> <label class="mono">name <input type="text" placeholder="Munich"/></label></div> <div class="sky-fov"><button type="button" class="chip">Use my location</button> <button type="button"> </button> <button type="button"> </button> <button type="button"> </button></div> <!> <!> <div class="label lg-sub">Instrument</div> <p class="hint">Your telescope and camera as a frame on the sky, and a finder chart to take to the eyepiece: the field as drawn,
    with north, east, centre, scale and time in a strip below.</p> <div class="sky-fov"></div> <div class="obs-grid"><label class="mono">f <input type="number" step="1" min="1"/> mm</label> <label class="mono">sensor <input type="number" step="0.1" min="0.1"/> × <input type="number" step="0.1" min="0.1"/> mm</label> <label class="mono">pixel <input type="number" step="0.01" min="0.1"/> µm</label> <label class="mono">PA <input type="number" step="1"/> °</label></div> <div class="sky-fov"><button type="button"> </button> <!> <button type="button" class="chip">Finder chart · PNG</button></div> <div class="label lg-sub">Export</div> <p class="hint">Tables leave as CSV or VOTable (TOPCAT, Aladin, astropy). Positions are ICRS at the stated epoch.</p> <div class="sky-fov"><button type="button" class="chip">Expected jumps · CSV</button> <button type="button" class="chip">VOTable</button> <button type="button" class="chip"> </button> <button type="button" class="chip">VOTable</button> <button type="button" class="chip">View → SVG</button></div> <p class="hint">SVG: the view as a vector drawing — every line, ring, grid, orbit and label stays editable, the point clouds and the sky
    image sit underneath as one raster. For figures.</p> <div class="label lg-sub">SAMP · TOPCAT, Aladin, DS9</div> <p class="hint">A hub on this machine (TOPCAT and Aladin start one) links the tools: the telescope's field goes out as <span class="mono">coord.pointAt.sky</span>, a set as <span class="mono">table.load.votable</span>, and a point sent by
    another tool turns the telescope. The hub asks for your permission in its own window.</p> <div class="sky-fov"><!></div> <!> <p class="hint src">Tiles: CDS/HiPS (DSS2 © STScI/ROE/AAO/UKSTU, 2MASS/IPAC-Caltech, WISE/NASA-JPL, Pan-STARRS/IfA). Loaded on demand; nothing is stored.</p></div>`);
function SkyPane($$anchor, $$props) {
	push($$props, true);
	const $survey = () => store_get(survey, "$survey", $$stores);
	const $observer = () => store_get(observer, "$observer", $$stores);
	const $camera = () => store_get(camera, "$camera", $$stores);
	const $selection = () => store_get(selection, "$selection", $$stores);
	const $movers = () => store_get(movers, "$movers", $$stores);
	const $userLayer = () => store_get(userLayer, "$userLayer", $$stores);
	const $crossmatch = () => store_get(crossmatch, "$crossmatch", $$stores);
	const $fieldQuery = () => store_get(fieldQuery, "$fieldQuery", $$stores);
	const $measureLog = () => store_get(measureLog, "$measureLog", $$stores);
	const $samp = () => store_get(samp, "$samp", $$stores);
	const [$$stores, $$cleanup] = setup_stores();
	const SURVEYS = [
		{
			id: "dss",
			n: "DSS2",
			sub: "photographic plates, 1983–1999",
			band: "visible"
		},
		{
			id: "2mass",
			n: "2MASS",
			sub: "near-infrared, 1997–2001",
			band: "J·H·K"
		},
		{
			id: "wise",
			n: "AllWISE",
			sub: "mid-infrared, 2010",
			band: "W1·W2·W4"
		},
		{
			id: "ps1",
			n: "Pan-STARRS",
			sub: "DR1, 2010–2014",
			band: "g·r·z"
		}
	];
	const fovText = (f) => f >= 1 ? `${f.toFixed(f < 10 ? 1 : 0)}°` : f >= 1 / 60 ? `${(f * 60).toFixed(1)}′` : `${(f * 3600).toFixed(0)}″`;
	const hms = (ra) => {
		const h = ra / 15, hh = Math.floor(h), m = (h - hh) * 60, mm = Math.floor(m);
		return `${hh}h ${String(mm).padStart(2, "0")}m ${((m - mm) * 60).toFixed(0).padStart(2, "0")}s`;
	};
	const dms = (d) => {
		const s = d < 0 ? "−" : "+", a = Math.abs(d), dd = Math.floor(a), m = (a - dd) * 60;
		return `${s}${dd}° ${String(Math.floor(m)).padStart(2, "0")}′`;
	};
	let other = /* @__PURE__ */ user_derived(() => $survey().blinkWith === $survey().id ? $survey().id === "dss" ? "ps1" : "dss" : $survey().blinkWith);
	const svName = (id) => SURVEYS.find((s) => s.id === id)?.n ?? (id === "fits" ? "your image" : "…");
	let fitsEl = /* @__PURE__ */ state(null);
	async function pickFits(e) {
		const f = e.target.files?.[0];
		if (!f) return;
		api.importFits?.(await f.arrayBuffer(), f.name);
		e.target.value = "";
	}
	let fileEl = /* @__PURE__ */ state(null);
	let xmRadius = /* @__PURE__ */ state(3);
	let oLat = /* @__PURE__ */ state("");
	let oLon = /* @__PURE__ */ state("");
	let oElev = /* @__PURE__ */ state("");
	let oName = /* @__PURE__ */ state("");
	let iFl = /* @__PURE__ */ state("");
	let iSw = /* @__PURE__ */ state("");
	let iSh = /* @__PURE__ */ state("");
	let iPx = /* @__PURE__ */ state("");
	let iPa = /* @__PURE__ */ state("");
	user_effect(() => {
		const o = $observer();
		set(oLat, o.on ? String(o.lat) : get(oLat), true);
		set(oLon, o.on ? String(o.lon) : get(oLon), true);
		set(oElev, String(o.elev), true);
		set(oName, o.name, true);
		set(iFl, String(o.fl), true);
		set(iSw, String(o.sw), true);
		set(iSh, String(o.sh), true);
		set(iPx, String(o.px), true);
		set(iPa, String(o.pa), true);
	});
	const PRESETS = [
		{ n: "APS-C DSLR · 200 mm" },
		{ n: "APS-C · 80 mm refractor (f/6)" },
		{ n: "ASI533MC · 8″ SCT (f/10)" },
		{ n: "ASI294MC · 8″ Newton (f/5)" },
		{ n: "Full frame · 135 mm" },
		{ n: "1.2 m Schmidt plate (6.4°)" }
	];
	const fovT = (v) => v >= 1 ? `${v.toFixed(2)}°` : `${(v * 60).toFixed(1)}′`;
	const sepText = (v) => v === null || v === void 0 ? "" : v >= 60 ? (v / 60).toFixed(1) + "′" : v.toFixed(2) + "″";
	async function pickFile(e) {
		const f = e.target.files?.[0];
		if (!f) return;
		api.importUser?.(await f.text(), f.name);
		e.target.value = "";
	}
	const aladin = () => `https://aladin.cds.unistra.fr/AladinLite/?target=${$camera().ra.toFixed(4)}%20${$camera().dec.toFixed(4)}&fov=${Math.max(.01, $camera().fov).toFixed(3)}&survey=P%2FDSS2%2Fcolor`;
	var div = root_30();
	var button = sibling(child(div), 4);
	let classes;
	var node = sibling(button, 2);
	var consequent = ($$anchor) => {
		var fragment = root$9();
		var p_1 = first_child(fragment);
		var b = sibling(child(p_1));
		var text = child(b, true);
		reset(b);
		next();
		reset(p_1);
		var button_1 = sibling(p_1, 2);
		Icon(child(button_1), {
			name: "sun",
			size: 13
		});
		next();
		reset(button_1);
		template_effect(() => set_text(text, $camera().skyFrom));
		delegated("click", button_1, () => api.skyView?.(true));
		append($$anchor, fragment);
	};
	if_block(node, ($$render) => {
		if ($camera().sky && $camera().skyFrom) $$render(consequent);
	});
	var node_2 = sibling(node, 2);
	var consequent_1 = ($$anchor) => {
		var button_2 = root_1$9();
		var node_3 = child(button_2);
		Icon(node_3, {
			name: "scope",
			size: 13
		});
		var text_1 = sibling(node_3);
		reset(button_2);
		template_effect(() => set_text(text_1, `Stand at ${$selection().card?.title ?? "selection" ?? ""} and look around`));
		delegated("click", button_2, () => api.skyView?.(true, "selection"));
		append($$anchor, button_2);
	};
	if_block(node_2, ($$render) => {
		if ($selection() && ($selection().card?.kind === "star" || $selection().card?.kind === "host" || $selection().card?.kind === "gpick" || $selection().card?.kind === "user")) $$render(consequent_1);
	});
	var node_4 = sibling(node_2, 2);
	var consequent_3 = ($$anchor) => {
		var fragment_1 = root_3$5();
		var div_1 = first_child(fragment_1);
		var span = child(div_1);
		var text_2 = child(span);
		reset(span);
		var span_1 = sibling(span, 2);
		var text_3 = child(span_1);
		reset(span_1);
		var span_2 = sibling(span_1, 2);
		var text_4 = child(span_2);
		reset(span_2);
		reset(div_1);
		var div_2 = sibling(div_1, 2);
		each(div_2, 20, () => [
			60,
			10,
			2,
			.5,
			.1
		], (f) => f, ($$anchor, f) => {
			var button_3 = root_2$6();
			var text_5 = child(button_3, true);
			reset(button_3);
			template_effect(($0) => set_text(text_5, $0), [() => fovText(f)]);
			delegated("click", button_3, () => api.setFov?.(f));
			append($$anchor, button_3);
		});
		reset(div_2);
		var node_5 = sibling(div_2, 2);
		var consequent_2 = ($$anchor) => {
			var button_4 = root_1$9();
			var node_6 = child(button_4);
			Icon(node_6, {
				name: "scope",
				size: 13
			});
			var text_6 = sibling(node_6);
			reset(button_4);
			template_effect(() => set_text(text_6, `Point at ${$selection().card?.title ?? "selection" ?? ""}`));
			delegated("click", button_4, () => api.lookAtSelection?.());
			append($$anchor, button_4);
		};
		if_block(node_5, ($$render) => {
			if ($selection()) $$render(consequent_2);
		});
		template_effect(($0, $1, $2) => {
			set_text(text_2, `FOV ${$0 ?? ""}`);
			set_text(text_3, `RA ${$1 ?? ""}`);
			set_text(text_4, `Dec ${$2 ?? ""}`);
		}, [
			() => fovText($camera().fov),
			() => hms($camera().ra),
			() => dms($camera().dec)
		]);
		append($$anchor, fragment_1);
	};
	var consequent_4 = ($$anchor) => {
		var button_5 = root_1$9();
		var node_7 = child(button_5);
		Icon(node_7, {
			name: "scope",
			size: 13
		});
		var text_7 = sibling(node_7);
		reset(button_5);
		template_effect(() => set_text(text_7, `Point the telescope at ${$selection().card?.title ?? "selection" ?? ""}`));
		delegated("click", button_5, () => api.lookAtSelection?.());
		append($$anchor, button_5);
	};
	if_block(node_4, ($$render) => {
		if ($camera().sky) $$render(consequent_3);
		else if ($selection()) $$render(consequent_4, 1);
	});
	var div_3 = sibling(node_4, 4);
	var button_6 = child(div_3);
	let classes_1;
	var node_8 = sibling(button_6, 2);
	each(node_8, 17, () => SURVEYS, (s) => s.id, ($$anchor, s) => {
		var button_7 = root_4$3();
		let classes_2;
		var span_3 = child(button_7);
		var text_8 = child(span_3, true);
		var span_4 = sibling(text_8);
		var text_9 = child(span_4, true);
		reset(span_4);
		reset(span_3);
		var span_5 = sibling(span_3);
		var text_10 = child(span_5, true);
		reset(span_5);
		reset(button_7);
		template_effect(() => {
			classes_2 = set_class(button_7, 1, "sky-sv", null, classes_2, { on: $survey().id === get(s).id });
			set_text(text_8, get(s).n);
			set_text(text_9, get(s).band);
			set_text(text_10, get(s).sub);
		});
		delegated("click", button_7, () => api.setSurvey?.(get(s).id));
		append($$anchor, button_7);
	});
	var node_9 = sibling(node_8, 2);
	var consequent_5 = ($$anchor) => {
		var button_8 = root_5$3();
		let classes_3;
		var span_6 = sibling(child(button_8), 2);
		var text_11 = child(span_6);
		reset(span_6);
		reset(button_8);
		template_effect(($0, $1) => {
			classes_3 = set_class(button_8, 1, "sky-sv", null, classes_3, { on: $survey().id === "fits" });
			set_text(text_11, `${$survey().fits.name ?? ""} · ${$survey().fits.nx ?? ""}×${$survey().fits.ny ?? ""} px · ${$0 ?? ""}″/px${$1 ?? ""}`);
		}, [() => $survey().fits.scale.toFixed(2), () => $survey().fits.epoch ? ` · ${$survey().fits.epoch.toFixed(2)}` : ""]);
		delegated("click", button_8, () => api.setSurvey?.("fits"));
		append($$anchor, button_8);
	};
	if_block(node_9, ($$render) => {
		if ($survey().fits) $$render(consequent_5);
	});
	reset(div_3);
	var div_4 = sibling(div_3, 2);
	var input = child(div_4);
	bind_this(input, ($$value) => set(fitsEl, $$value), () => get(fitsEl));
	var button_9 = sibling(input, 2);
	var text_12 = child(button_9, true);
	reset(button_9);
	var node_10 = sibling(button_9, 2);
	var consequent_6 = ($$anchor) => {
		var fragment_2 = root_6$3();
		var button_10 = first_child(fragment_2);
		var button_11 = sibling(button_10, 2);
		delegated("click", button_10, () => api.clearFits?.());
		delegated("click", button_11, () => api.lookAt?.($survey().fits.ra, $survey().fits.dec));
		append($$anchor, fragment_2);
	};
	if_block(node_10, ($$render) => {
		if ($survey().fits) $$render(consequent_6);
	});
	reset(div_4);
	var node_11 = sibling(div_4, 2);
	var consequent_7 = ($$anchor) => {
		var p_2 = root_7$3();
		var text_13 = child(p_2, true);
		reset(p_2);
		template_effect(() => set_text(text_13, $survey().fitsMsg));
		append($$anchor, p_2);
	};
	if_block(node_11, ($$render) => {
		if ($survey().fitsMsg) $$render(consequent_7);
	});
	var button_12 = sibling(node_11, 8);
	let classes_4;
	var span_7 = child(button_12);
	var text_14 = child(span_7);
	reset(span_7);
	next();
	reset(button_12);
	var div_5 = sibling(button_12, 2);
	var node_12 = child(div_5);
	each(node_12, 17, () => SURVEYS.filter((s) => s.id !== $survey().id), (s) => s.id, ($$anchor, s) => {
		var button_13 = root_8$3();
		let classes_5;
		var text_15 = child(button_13, true);
		reset(button_13);
		template_effect(() => {
			classes_5 = set_class(button_13, 1, "chip", null, classes_5, { on: get(other) === get(s).id });
			set_text(text_15, get(s).n);
		});
		delegated("click", button_13, () => api.setBlink?.($survey().blink, get(s).id));
		append($$anchor, button_13);
	});
	var node_13 = sibling(node_12, 2);
	var consequent_8 = ($$anchor) => {
		var button_14 = root_9$3();
		let classes_6;
		template_effect(() => classes_6 = set_class(button_14, 1, "chip", null, classes_6, { on: get(other) === "fits" }));
		delegated("click", button_14, () => api.setBlink?.($survey().blink, "fits"));
		append($$anchor, button_14);
	};
	if_block(node_13, ($$render) => {
		if ($survey().fits && $survey().id !== "fits") $$render(consequent_8);
	});
	reset(div_5);
	var node_14 = sibling(div_5, 2);
	var consequent_10 = ($$anchor) => {
		var fragment_3 = root_13$2();
		var p_3 = sibling(first_child(fragment_3), 2);
		var text_16 = child(p_3);
		reset(p_3);
		var node_15 = sibling(p_3, 2);
		var consequent_9 = ($$anchor) => {
			var ul = root_11$3();
			each(ul, 5, () => $movers().list, index, ($$anchor, m) => {
				var li = root_10$3();
				var button_15 = child(li);
				var span_8 = child(button_15);
				let classes_7;
				var text_17 = child(span_8, true);
				reset(span_8);
				var span_9 = sibling(span_8, 2);
				var text_18 = child(span_9);
				reset(span_9);
				var span_10 = sibling(span_9, 2);
				var text_19 = child(span_10, true);
				reset(span_10);
				var span_11 = sibling(span_10, 2);
				var text_20 = child(span_11);
				reset(span_11);
				reset(button_15);
				reset(li);
				template_effect(($0, $1, $2, $3) => {
					classes_7 = set_class(span_8, 1, "enc-n", null, classes_7, { usr: get(m).usr });
					set_text(text_17, get(m).name);
					set_text(text_18, `${$0 ?? ""}${$1 ?? ""}`);
					set_text(text_19, $2);
					set_text(text_20, `${$3 ?? ""} mas/yr`);
				}, [
					() => get(m).jump >= 60 ? (get(m).jump / 60).toFixed(1) + "′" : get(m).jump.toFixed(1) + "″",
					() => get(m).ejump !== void 0 ? ` ± ${get(m).ejump >= 1 ? get(m).ejump.toFixed(1) : get(m).ejump.toFixed(2)}″` : "",
					() => get(m).px >= 1 ? get(m).px.toFixed(0) + " px" : "< 1 px",
					() => get(m).pm.toFixed(0)
				]);
				delegated("click", button_15, () => api.lookAt?.(get(m).ra, get(m).dec));
				append($$anchor, li);
			});
			reset(ul);
			append($$anchor, ul);
		};
		var alternate = ($$anchor) => {
			append($$anchor, root_12$3());
		};
		if_block(node_15, ($$render) => {
			if ($movers().list.length) $$render(consequent_9);
			else $$render(alternate, -1);
		});
		template_effect(($0) => set_text(text_16, `Where a catalogued star must hop between ${$movers().a ?? ""} (${$movers().ea ?? ""}) and ${$movers().b ?? ""} (${$movers().eb ?? ""}): proper
      motion × ${$0 ?? ""} years. Arrows on the sky run from the first epoch to the second. A hop that is
      not in this list is the find.`), [() => Math.abs($movers().dt).toFixed(0)]);
		append($$anchor, fragment_3);
	};
	if_block(node_14, ($$render) => {
		if ($camera().sky && $survey().id && !$camera().skyFrom) $$render(consequent_10);
	});
	var node_16 = sibling(node_14, 2);
	var consequent_11 = ($$anchor) => {
		var fragment_4 = root_14$2();
		var p_5 = sibling(first_child(fragment_4), 2);
		var a_1 = child(p_5);
		next(5);
		reset(p_5);
		template_effect(($0) => set_attribute(a_1, "href", $0), [() => aladin()]);
		append($$anchor, fragment_4);
	};
	if_block(node_16, ($$render) => {
		if ($camera().sky) $$render(consequent_11);
	});
	var node_17 = sibling(node_16, 6);
	each(node_17, 3, () => $userLayer().sets, (st) => st.src + st.name, ($$anchor, st, k) => {
		var fragment_5 = root_15$2();
		var div_6 = first_child(fragment_5);
		var span_12 = child(div_6);
		var text_21 = child(span_12, true);
		reset(span_12);
		var span_13 = sibling(span_12, 2);
		var text_22 = child(span_13);
		reset(span_13);
		var button_16 = sibling(span_13, 2);
		Icon(child(button_16), {
			name: "close",
			size: 12
		});
		reset(button_16);
		reset(div_6);
		var div_7 = sibling(div_6, 2);
		var button_17 = child(div_7);
		var button_18 = sibling(button_17, 2);
		var button_19 = sibling(button_18, 2);
		var button_20 = sibling(button_19, 2);
		var button_21 = sibling(button_20, 2);
		reset(div_7);
		template_effect(() => {
			set_attribute(span_12, "title", get(st).name);
			set_text(text_21, get(st).name);
			set_text(text_22, `${get(st).n ?? ""} rows${get(st).noDist ? ` · ${get(st).noDist} no dist` : ""}`);
			set_attribute(button_16, "aria-label", `Remove ${get(st).name ?? ""}`);
			button_19.disabled = !!$crossmatch().busy;
			button_20.disabled = !!$crossmatch().busy;
			button_21.disabled = !!$crossmatch().busy;
		});
		delegated("click", button_16, () => api.removeSet?.(get(k)));
		delegated("click", button_17, () => api.exportTable?.("set", "csv", get(k)));
		delegated("click", button_18, () => api.exportTable?.("set", "votable", get(k)));
		delegated("click", button_19, () => api.crossmatch?.(get(k), { radius: get(xmRadius) }));
		delegated("click", button_20, () => api.crossmatch?.(get(k), {
			radius: get(xmRadius),
			remote: "gaia"
		}));
		delegated("click", button_21, () => api.crossmatch?.(get(k), {
			radius: get(xmRadius),
			remote: "simbad"
		}));
		append($$anchor, fragment_5);
	});
	var node_19 = sibling(node_17, 2);
	var consequent_12 = ($$anchor) => {
		var fragment_6 = root_16$1();
		var label = first_child(fragment_6);
		var input_1 = sibling(child(label));
		remove_input_defaults(input_1);
		next();
		reset(label);
		next(2);
		bind_value(input_1, () => get(xmRadius), ($$value) => set(xmRadius, $$value));
		append($$anchor, fragment_6);
	};
	if_block(node_19, ($$render) => {
		if ($userLayer().sets.length) $$render(consequent_12);
	});
	var node_20 = sibling(node_19, 2);
	var consequent_13 = ($$anchor) => {
		var p_6 = root_17$1();
		let classes_8;
		var text_23 = child(p_6, true);
		reset(p_6);
		template_effect(() => {
			classes_8 = set_class(p_6, 1, "hint", null, classes_8, { busy: $crossmatch().busy });
			set_text(text_23, $crossmatch().msg);
		});
		append($$anchor, p_6);
	};
	if_block(node_20, ($$render) => {
		if ($crossmatch().msg) $$render(consequent_13);
	});
	var node_21 = sibling(node_20, 2);
	var consequent_17 = ($$anchor) => {
		var fragment_7 = root_22();
		var div_8 = first_child(fragment_7);
		var span_14 = child(div_8);
		var text_24 = child(span_14);
		reset(span_14);
		var span_15 = sibling(span_14);
		var text_25 = child(span_15);
		reset(span_15);
		var node_22 = sibling(span_15);
		var consequent_14 = ($$anchor) => {
			var span_16 = root_18$1();
			var text_26 = child(span_16);
			reset(span_16);
			template_effect(() => set_text(text_26, `${$crossmatch().coarse ?? ""} coarse`));
			append($$anchor, span_16);
		};
		if_block(node_22, ($$render) => {
			if ($crossmatch().coarse) $$render(consequent_14);
		});
		var node_23 = sibling(node_22);
		var consequent_15 = ($$anchor) => {
			var span_17 = root_19();
			var text_27 = child(span_17);
			reset(span_17);
			template_effect(() => set_text(text_27, `${$crossmatch().doubt ?? ""} doubtful`));
			append($$anchor, span_17);
		};
		if_block(node_23, ($$render) => {
			if ($crossmatch().doubt) $$render(consequent_15);
		});
		var span_18 = sibling(node_23);
		var text_28 = child(span_18);
		reset(span_18);
		reset(div_8);
		var node_24 = sibling(div_8, 2);
		var consequent_16 = ($$anchor) => {
			var ul_1 = root_21();
			each(ul_1, 5, () => $crossmatch().rows.slice(0, 60), (r) => r.i, ($$anchor, r) => {
				var li_1 = root_20();
				var button_22 = child(li_1);
				var span_19 = child(button_22);
				let classes_9;
				var text_29 = child(span_19, true);
				reset(span_19);
				var span_20 = sibling(span_19, 2);
				var text_30 = child(span_20, true);
				reset(span_20);
				var span_21 = sibling(span_20, 2);
				let classes_10;
				var text_31 = child(span_21, true);
				reset(span_21);
				var span_22 = sibling(span_21, 2);
				var text_32 = child(span_22, true);
				reset(span_22);
				reset(button_22);
				reset(li_1);
				template_effect(($0) => {
					classes_9 = set_class(span_19, 1, "enc-n", null, classes_9, { "xm-unk": !get(r).src });
					set_text(text_29, get(r).n);
					set_text(text_30, $0);
					classes_10 = set_class(span_21, 1, "enc-d mono", null, classes_10, { "xm-doubt": get(r).doubt });
					set_text(text_31, get(r).src ? get(r).id + (get(r).doubt ? " · " + get(r).doubt : "") : `nothing within ${$crossmatch().radius}″`);
					set_text(text_32, get(r).src ?? "");
				}, [() => get(r).src ? sepText(get(r).sep) : "no match"]);
				delegated("click", button_22, () => api.lookAt?.(get(r).ra, get(r).dec));
				append($$anchor, li_1);
			});
			reset(ul_1);
			append($$anchor, ul_1);
		};
		if_block(node_24, ($$render) => {
			if ($crossmatch().rows.length) $$render(consequent_16);
		});
		template_effect(() => {
			set_text(text_24, `${$crossmatch().unknown ?? ""} without counterpart`);
			set_text(text_25, `${$crossmatch().known - ($crossmatch().coarse || 0)} ${$crossmatch().remote ? "identified in " + $crossmatch().remote : "known"}`);
			set_text(text_28, `r ${$crossmatch().radius ?? ""}″`);
		});
		append($$anchor, fragment_7);
	};
	if_block(node_21, ($$render) => {
		if ($crossmatch().set >= 0 && $crossmatch().n && !$crossmatch().busy) $$render(consequent_17);
	});
	var node_25 = sibling(node_21, 2);
	var consequent_18 = ($$anchor) => {
		append($$anchor, root_23());
	};
	if_block(node_25, ($$render) => {
		if ($userLayer().n && !$userLayer().saved) $$render(consequent_18);
	});
	var node_26 = sibling(node_25, 2);
	var consequent_19 = ($$anchor) => {
		var p_8 = root_7$3();
		var text_33 = child(p_8, true);
		reset(p_8);
		template_effect(() => set_text(text_33, $userLayer().warn));
		append($$anchor, p_8);
	};
	if_block(node_26, ($$render) => {
		if ($userLayer().warn) $$render(consequent_19);
	});
	var div_9 = sibling(node_26, 2);
	var input_2 = child(div_9);
	bind_this(input_2, ($$value) => set(fileEl, $$value), () => get(fileEl));
	var button_23 = sibling(input_2, 2);
	next(2);
	reset(div_9);
	var div_10 = sibling(div_9, 6);
	var button_24 = child(div_10);
	var button_25 = sibling(button_24, 2);
	reset(div_10);
	var node_27 = sibling(div_10, 2);
	var consequent_20 = ($$anchor) => {
		var p_9 = root_17$1();
		let classes_11;
		var text_34 = child(p_9, true);
		reset(p_9);
		template_effect(() => {
			classes_11 = set_class(p_9, 1, "hint", null, classes_11, { busy: $fieldQuery().busy });
			set_text(text_34, $fieldQuery().msg);
		});
		append($$anchor, p_9);
	};
	if_block(node_27, ($$render) => {
		if ($fieldQuery().msg) $$render(consequent_20);
	});
	var node_28 = sibling(node_27, 2);
	var consequent_21 = ($$anchor) => {
		append($$anchor, root_24());
	};
	if_block(node_28, ($$render) => {
		if (!$camera().sky) $$render(consequent_21);
	});
	var div_11 = sibling(node_28, 6);
	var label_1 = child(div_11);
	var input_3 = sibling(child(label_1));
	remove_input_defaults(input_3);
	reset(label_1);
	var label_2 = sibling(label_1, 2);
	var input_4 = sibling(child(label_2));
	remove_input_defaults(input_4);
	reset(label_2);
	var label_3 = sibling(label_2, 2);
	var input_5 = sibling(child(label_3));
	remove_input_defaults(input_5);
	reset(label_3);
	var label_4 = sibling(label_3, 2);
	var input_6 = sibling(child(label_4));
	remove_input_defaults(input_6);
	reset(label_4);
	reset(div_11);
	var div_12 = sibling(div_11, 2);
	var button_26 = child(div_12);
	var button_27 = sibling(button_26, 2);
	let classes_12;
	var text_35 = child(button_27, true);
	reset(button_27);
	var button_28 = sibling(button_27, 2);
	let classes_13;
	var text_36 = child(button_28);
	reset(button_28);
	var button_29 = sibling(button_28, 2);
	let classes_14;
	var text_37 = child(button_29);
	reset(button_29);
	reset(div_12);
	var node_29 = sibling(div_12, 2);
	var consequent_22 = ($$anchor) => {
		var p_11 = root_7$3();
		var text_38 = child(p_11, true);
		reset(p_11);
		template_effect(() => set_text(text_38, $observer().msg));
		append($$anchor, p_11);
	};
	if_block(node_29, ($$render) => {
		if ($observer().msg) $$render(consequent_22);
	});
	var node_30 = sibling(node_29, 2);
	var consequent_24 = ($$anchor) => {
		var div_13 = root_26();
		var span_23 = child(div_13);
		var text_39 = child(span_23);
		reset(span_23);
		var span_24 = sibling(span_23);
		var text_40 = child(span_24);
		reset(span_24);
		var node_31 = sibling(span_24);
		var consequent_23 = ($$anchor) => {
			var span_25 = root_18$1();
			var text_41 = child(span_25);
			reset(span_25);
			template_effect(($0) => set_text(text_41, `airmass ${$0 ?? ""}`), [() => $camera().airmass.toFixed(2)]);
			append($$anchor, span_25);
		};
		var alternate_1 = ($$anchor) => {
			append($$anchor, root_25());
		};
		if_block(node_31, ($$render) => {
			if ($camera().alt > 0) $$render(consequent_23);
			else $$render(alternate_1, -1);
		});
		reset(div_13);
		template_effect(($0, $1) => {
			set_text(text_39, `alt ${$0 ?? ""}°`);
			set_text(text_40, `az ${$1 ?? ""}°`);
		}, [() => $camera().alt.toFixed(1), () => $camera().az.toFixed(1)]);
		append($$anchor, div_13);
	};
	if_block(node_30, ($$render) => {
		if ($camera().sky && $observer().on && $camera().alt !== null && $camera().alt !== void 0) $$render(consequent_24);
	});
	var div_14 = sibling(node_30, 6);
	each(div_14, 23, () => PRESETS, (p) => p.n, ($$anchor, p, i) => {
		var button_30 = root_8$3();
		let classes_15;
		var text_42 = child(button_30, true);
		reset(button_30);
		template_effect(() => {
			classes_15 = set_class(button_30, 1, "chip", null, classes_15, { on: $observer().instr === get(p).n });
			set_text(text_42, get(p).n);
		});
		delegated("click", button_30, () => api.setInstrument?.({ preset: get(i) }));
		append($$anchor, button_30);
	});
	reset(div_14);
	var div_15 = sibling(div_14, 2);
	var label_5 = child(div_15);
	var input_7 = sibling(child(label_5));
	remove_input_defaults(input_7);
	next();
	reset(label_5);
	var label_6 = sibling(label_5, 2);
	var input_8 = sibling(child(label_6));
	remove_input_defaults(input_8);
	var input_9 = sibling(input_8, 2);
	remove_input_defaults(input_9);
	next();
	reset(label_6);
	var label_7 = sibling(label_6, 2);
	var input_10 = sibling(child(label_7));
	remove_input_defaults(input_10);
	next();
	reset(label_7);
	var label_8 = sibling(label_7, 2);
	var input_11 = sibling(child(label_8));
	remove_input_defaults(input_11);
	next();
	reset(label_8);
	reset(div_15);
	var div_16 = sibling(div_15, 2);
	var button_31 = child(div_16);
	let classes_16;
	var text_43 = child(button_31);
	reset(button_31);
	var node_32 = sibling(button_31, 2);
	var consequent_25 = ($$anchor) => {
		var span_27 = root_27();
		var text_44 = child(span_27);
		reset(span_27);
		template_effect(($0, $1, $2) => set_text(text_44, `${$0 ?? ""} × ${$1 ?? ""} · ${$2 ?? ""}″/px`), [
			() => fovT($observer().fov.w),
			() => fovT($observer().fov.h),
			() => $observer().fov.scale.toFixed(2)
		]);
		append($$anchor, span_27);
	};
	if_block(node_32, ($$render) => {
		if ($observer().fov) $$render(consequent_25);
	});
	var button_32 = sibling(node_32, 2);
	reset(div_16);
	var div_17 = sibling(div_16, 6);
	var button_33 = child(div_17);
	var button_34 = sibling(button_33, 2);
	var button_35 = sibling(button_34, 2);
	var text_45 = child(button_35);
	reset(button_35);
	var button_36 = sibling(button_35, 2);
	var button_37 = sibling(button_36, 2);
	reset(div_17);
	var div_18 = sibling(div_17, 8);
	var node_33 = child(div_18);
	var consequent_26 = ($$anchor) => {
		var fragment_8 = root_28();
		var button_38 = first_child(fragment_8);
		var button_39 = sibling(button_38, 2);
		each(sibling(button_39, 2), 3, () => $userLayer().sets, (st) => st.src + st.name, ($$anchor, st, k) => {
			var button_40 = root_2$6();
			var text_46 = child(button_40);
			reset(button_40);
			template_effect(($0) => set_text(text_46, `Send “${$0 ?? ""}”`), [() => get(st).name.length > 24 ? get(st).name.slice(0, 24) + "…" : get(st).name]);
			delegated("click", button_40, () => api.sampSendSet?.(get(k)));
			append($$anchor, button_40);
		});
		template_effect(() => button_39.disabled = !$camera().sky);
		delegated("click", button_38, () => api.sampDisconnect?.());
		delegated("click", button_39, () => api.sampPointAt?.());
		append($$anchor, fragment_8);
	};
	var alternate_2 = ($$anchor) => {
		var button_41 = root_29();
		template_effect(() => button_41.disabled = $samp().state === "connecting");
		delegated("click", button_41, () => api.sampConnect?.());
		append($$anchor, button_41);
	};
	if_block(node_33, ($$render) => {
		if ($samp().state === "on") $$render(consequent_26);
		else $$render(alternate_2, -1);
	});
	reset(div_18);
	var node_35 = sibling(div_18, 2);
	var consequent_27 = ($$anchor) => {
		var p_12 = root_17$1();
		let classes_17;
		var text_47 = child(p_12, true);
		reset(p_12);
		template_effect(() => {
			classes_17 = set_class(p_12, 1, `hint samp-${$samp().state ?? ""}`, null, classes_17, { busy: $samp().state === "connecting" });
			set_text(text_47, $samp().msg);
		});
		append($$anchor, p_12);
	};
	if_block(node_35, ($$render) => {
		if ($samp().msg) $$render(consequent_27);
	});
	next(2);
	reset(div);
	template_effect(($0, $1) => {
		classes = set_class(button, 1, "toggle", null, classes, { on: $camera().sky });
		set_attribute(button, "aria-checked", $camera().sky);
		classes_1 = set_class(button_6, 1, "sky-sv", null, classes_1, { on: !$survey().id });
		set_text(text_12, $survey().fits ? "Replace your image…" : "Your image (FITS with WCS)…");
		classes_4 = set_class(button_12, 1, "toggle", null, classes_4, { on: $survey().blink });
		set_attribute(button_12, "aria-checked", $survey().blink);
		button_12.disabled = !$survey().id;
		set_text(text_14, `Blink ${$0 ?? ""} ↔ ${$1 ?? ""}`);
		button_24.disabled = !$camera().sky || !!$camera().skyFrom || !!$fieldQuery().busy;
		button_25.disabled = !$camera().sky || !!$camera().skyFrom || !!$fieldQuery().busy;
		classes_12 = set_class(button_27, 1, "chip", null, classes_12, { on: $observer().on });
		set_text(text_35, $observer().on ? "Observer on" : "Observer off");
		classes_13 = set_class(button_28, 1, "chip", null, classes_13, { on: $observer().frame === "date" });
		set_text(text_36, `Coordinates ${$observer().frame === "date" ? "of date (apparent)" : "ICRS J2000"}`);
		classes_14 = set_class(button_29, 1, "chip", null, classes_14, { on: $observer().refract });
		set_text(text_37, `Refraction ${$observer().refract ? "on" : "off"}`);
		classes_16 = set_class(button_31, 1, "chip", null, classes_16, { on: $observer().frameOn });
		set_text(text_43, `Frame ${$observer().frameOn ? "shown" : "hidden"}`);
		button_32.disabled = !$camera().sky;
		button_33.disabled = !$movers().list.length;
		button_34.disabled = !$movers().list.length;
		button_35.disabled = !$measureLog().length;
		set_text(text_45, `Measurements (${$measureLog().length ?? ""}) · CSV`);
		button_36.disabled = !$measureLog().length;
	}, [() => svName($survey().id), () => svName(get(other))]);
	delegated("click", button, () => api.skyView?.());
	delegated("click", button_6, () => api.setSurvey?.(null));
	delegated("change", input, pickFits);
	delegated("click", button_9, () => get(fitsEl)?.click());
	delegated("click", button_12, () => api.setBlink?.(!$survey().blink, get(other)));
	delegated("change", input_2, pickFile);
	delegated("click", button_23, () => get(fileEl)?.click());
	delegated("click", button_24, () => api.queryField?.("gaia"));
	delegated("click", button_25, () => api.queryField?.("simbad"));
	delegated("change", input_3, () => api.setObserver?.({
		lat: +get(oLat),
		lon: +get(oLon) || 0
	}));
	bind_value(input_3, () => get(oLat), ($$value) => set(oLat, $$value));
	delegated("change", input_4, () => api.setObserver?.({
		lat: +get(oLat) || 0,
		lon: +get(oLon)
	}));
	bind_value(input_4, () => get(oLon), ($$value) => set(oLon, $$value));
	delegated("change", input_5, () => api.setObserver?.({ elev: +get(oElev) }));
	bind_value(input_5, () => get(oElev), ($$value) => set(oElev, $$value));
	delegated("change", input_6, () => api.setObserver?.({ name: get(oName) }));
	bind_value(input_6, () => get(oName), ($$value) => set(oName, $$value));
	delegated("click", button_26, () => api.observerHere?.());
	delegated("click", button_27, () => api.setObserver?.({ on: !$observer().on }));
	delegated("click", button_28, () => api.setObserver?.({ frame: $observer().frame === "date" ? "icrs" : "date" }));
	delegated("click", button_29, () => api.setObserver?.({ refract: !$observer().refract }));
	delegated("change", input_7, () => api.setInstrument?.({
		fl: +get(iFl),
		instr: ""
	}));
	bind_value(input_7, () => get(iFl), ($$value) => set(iFl, $$value));
	delegated("change", input_8, () => api.setInstrument?.({
		sw: +get(iSw),
		instr: ""
	}));
	bind_value(input_8, () => get(iSw), ($$value) => set(iSw, $$value));
	delegated("change", input_9, () => api.setInstrument?.({
		sh: +get(iSh),
		instr: ""
	}));
	bind_value(input_9, () => get(iSh), ($$value) => set(iSh, $$value));
	delegated("change", input_10, () => api.setInstrument?.({ px: +get(iPx) }));
	bind_value(input_10, () => get(iPx), ($$value) => set(iPx, $$value));
	delegated("change", input_11, () => api.setInstrument?.({ pa: +get(iPa) }));
	bind_value(input_11, () => get(iPa), ($$value) => set(iPa, $$value));
	delegated("click", button_31, () => api.setInstrument?.({ frameOn: !$observer().frameOn }));
	delegated("click", button_32, () => api.finderChart?.($selection()?.card?.title));
	delegated("click", button_33, () => api.exportTable?.("movers", "csv"));
	delegated("click", button_34, () => api.exportTable?.("movers", "votable"));
	delegated("click", button_35, () => api.exportTable?.("measure", "csv"));
	delegated("click", button_36, () => api.exportTable?.("measure", "votable"));
	delegated("click", button_37, () => api.exportSvg?.());
	append($$anchor, div);
	pop();
	$$cleanup();
}
delegate(["click", "change"]);
//#endregion
//#region src/components/SkyStatus.svelte
var root$8 = /* @__PURE__ */ from_html(`<span> </span><span> </span>`, 1);
var root_1$8 = /* @__PURE__ */ from_html(`<span> </span>`);
var root_2$5 = /* @__PURE__ */ from_html(`<span class="ss-k">Cursor</span> <!> <span class="ss-dim"> </span> <!> <span class="ss-sep" aria-hidden="true"></span>`, 1);
var root_3$4 = /* @__PURE__ */ from_html(`<div id="skystatus" class="mono" aria-live="off"><!> <span class="ss-k">Field</span> <span> </span><span> </span> <!> <span class="ss-sep" aria-hidden="true"></span> <span class="ss-k">Epoch</span><span> </span> <span class="ss-dim"> </span></div>`);
function SkyStatus($$anchor, $$props) {
	push($$props, false);
	const $camera = () => store_get(camera, "$camera", $$stores);
	const $skyCursor = () => store_get(skyCursor, "$skyCursor", $$stores);
	const [$$stores, $$cleanup] = setup_stores();
	const hms = (ra) => {
		ra = (ra % 360 + 360) % 360;
		const h = ra / 15, hh = Math.floor(h), m = (h - hh) * 60, mm = Math.floor(m), s = (m - mm) * 60;
		return `${String(hh).padStart(2, "0")}h${String(mm).padStart(2, "0")}m${s.toFixed(1).padStart(4, "0")}s`;
	};
	const dms = (d) => {
		const sg = d < 0 ? "−" : "+", a = Math.abs(d), dd = Math.floor(a), m = (a - dd) * 60, mm = Math.floor(m), s = (m - mm) * 60;
		return `${sg}${String(dd).padStart(2, "0")}°${String(mm).padStart(2, "0")}′${s.toFixed(0).padStart(2, "0")}″`;
	};
	const fovText = (f) => f >= 1 ? `${f.toFixed(f < 10 ? 2 : 1)}°` : f >= 1 / 60 ? `${(f * 60).toFixed(2)}′` : `${(f * 3600).toFixed(1)}″`;
	const scaleText = (s) => s >= 60 ? `${(s / 60).toFixed(2)}′/px` : `${s.toFixed(s < 1 ? 3 : 2)}″/px`;
	init();
	var fragment = comment();
	var node = first_child(fragment);
	var consequent_4 = ($$anchor) => {
		var div = root_3$4();
		var node_1 = child(div);
		var consequent_2 = ($$anchor) => {
			var fragment_1 = root_2$5();
			var node_2 = sibling(first_child(fragment_1), 2);
			var consequent = ($$anchor) => {
				var fragment_2 = root$8();
				var span = first_child(fragment_2);
				var text = child(span);
				reset(span);
				var span_1 = sibling(span);
				var text_1 = child(span_1);
				reset(span_1);
				template_effect(($0, $1) => {
					set_text(text, `α ${$0 ?? ""}`);
					set_text(text_1, `δ ${$1 ?? ""}`);
				}, [() => hms($skyCursor().raDate ?? $skyCursor().ra), () => dms($skyCursor().decDate ?? $skyCursor().dec)]);
				append($$anchor, fragment_2);
			};
			var alternate = ($$anchor) => {
				var fragment_3 = root$8();
				var span_2 = first_child(fragment_3);
				var text_2 = child(span_2);
				reset(span_2);
				var span_3 = sibling(span_2);
				var text_3 = child(span_3);
				reset(span_3);
				template_effect(($0, $1) => {
					set_text(text_2, `α ${$0 ?? ""}`);
					set_text(text_3, `δ ${$1 ?? ""}`);
				}, [() => hms($skyCursor().ra), () => dms($skyCursor().dec)]);
				append($$anchor, fragment_3);
			};
			if_block(node_2, ($$render) => {
				if ($camera().frame === "date") $$render(consequent);
				else $$render(alternate, -1);
			});
			var span_4 = sibling(node_2, 2);
			var text_4 = child(span_4);
			reset(span_4);
			var node_3 = sibling(span_4, 2);
			var consequent_1 = ($$anchor) => {
				var span_5 = root_1$8();
				let classes;
				var text_5 = child(span_5);
				reset(span_5);
				template_effect(($0, $1, $2) => {
					classes = set_class(span_5, 1, "ss-dim", null, classes, { "ss-down": $skyCursor().alt < 0 });
					set_text(text_5, `alt ${$0 ?? ""}° az ${$1 ?? ""}°${$2 ?? ""}`);
				}, [
					() => $skyCursor().alt.toFixed(1),
					() => $skyCursor().az.toFixed(1),
					() => $skyCursor().alt > 0 ? ` X ${$skyCursor().airmass.toFixed(2)}` : " · below the horizon"
				]);
				append($$anchor, span_5);
			};
			if_block(node_3, ($$render) => {
				if ($camera().obs && $skyCursor().alt !== void 0) $$render(consequent_1);
			});
			next(2);
			template_effect(($0, $1) => set_text(text_4, `l ${$0 ?? ""}° b ${$skyCursor().b >= 0 ? "+" : "−"}${$1 ?? ""}°`), [() => $skyCursor().l.toFixed(3), () => Math.abs($skyCursor().b).toFixed(3)]);
			append($$anchor, fragment_1);
		};
		if_block(node_1, ($$render) => {
			if ($skyCursor()) $$render(consequent_2);
		});
		var span_6 = sibling(node_1, 4);
		var text_6 = child(span_6, true);
		reset(span_6);
		var span_7 = sibling(span_6);
		var text_7 = child(span_7, true);
		reset(span_7);
		var node_4 = sibling(span_7, 2);
		var consequent_3 = ($$anchor) => {
			var span_8 = root_1$8();
			let classes_1;
			var text_8 = child(span_8);
			reset(span_8);
			template_effect(($0, $1, $2) => {
				classes_1 = set_class(span_8, 1, "ss-dim", null, classes_1, { "ss-down": $camera().alt < 0 });
				set_text(text_8, `alt ${$0 ?? ""}° az ${$1 ?? ""}°${$2 ?? ""}`);
			}, [
				() => $camera().alt.toFixed(1),
				() => $camera().az.toFixed(1),
				() => $camera().alt > 0 ? ` · airmass ${$camera().airmass.toFixed(2)}` : " · below the horizon"
			]);
			append($$anchor, span_8);
		};
		if_block(node_4, ($$render) => {
			if ($camera().obs && $camera().alt !== null && $camera().alt !== void 0) $$render(consequent_3);
		});
		var span_9 = sibling(node_4, 5);
		var text_9 = child(span_9);
		reset(span_9);
		var span_10 = sibling(span_9, 2);
		var text_10 = child(span_10);
		reset(span_10);
		reset(div);
		template_effect(($0, $1, $2) => {
			set_text(text_6, $0);
			set_text(text_7, $1);
			set_text(text_9, `J${$2 ?? ""}`);
			set_text(text_10, `${$camera().frame === "date" ? "apparent · true equator & equinox of date" : "ICRS · J2000 axes"}${$camera().skyFrom ? ` · from ${$camera().skyFrom}` : $camera().obs ? ` · ${$camera().obsName}` : " · from the Sun"}`);
		}, [
			() => fovText($camera().fov),
			() => scaleText($camera().pxScale),
			() => $camera().epoch.toFixed(2)
		]);
		append($$anchor, div);
	};
	if_block(node, ($$render) => {
		if ($camera().sky) $$render(consequent_4);
	});
	append($$anchor, fragment);
	pop();
	$$cleanup();
}
//#endregion
//#region src/components/DataPane.svelte
var root$7 = /* @__PURE__ */ from_html(`<li><span aria-hidden="true"></span> <span class="src-n"> </span> <span class="src-s mono"> </span> <span class="src-d mono"><!> <!> <!> <!> <!> <!></span></li>`);
var root_1$7 = /* @__PURE__ */ from_html(`<div class="label lg-sub"> </div> <p class="hint"> </p> <ul class="src"></ul>`, 1);
var root_2$4 = /* @__PURE__ */ from_html(`<p class="hint mono">loading changelog.json…</p>`);
var root_3$3 = /* @__PURE__ */ from_html(`<p class="hint mono"> </p>`);
var root_4$2 = /* @__PURE__ */ from_html(`<p class="dl-names mono"> </p>`);
var root_5$2 = /* @__PURE__ */ from_html(`<p class="dl-names mono dim"> </p>`);
var root_6$2 = /* @__PURE__ */ from_html(`<details class="dl-det"><summary class="mono"><!><!><!><!></summary> <!> <!> <!></details>`);
var root_7$2 = /* @__PURE__ */ from_html(`<p class="dl-names mono dim">first build in the history</p>`);
var root_8$2 = /* @__PURE__ */ from_html(`<li class="dl-row"><div class="dl-head mono"><span class="dl-date"> </span><span class="dl-kind"> </span> <span class="dl-n"> </span></div> <!></li>`);
var root_9$2 = /* @__PURE__ */ from_html(`<ul class="src dl" id="data-log"></ul>`);
var root_10$2 = /* @__PURE__ */ from_html(`<div class="sky-fov"><span class="hint">A key is saved.</span><button type="button" class="chip">Remove key</button></div>`);
var root_11$2 = /* @__PURE__ */ from_html(`<div class="sky-fov"><input class="src-key mono" type="password" placeholder="paste your key" autocomplete="off"/> <button type="button" class="chip">Save</button></div>`);
var root_12$2 = /* @__PURE__ */ from_html(`<div id="hud-data"><div class="label">Data</div> <p class="hint">Every outside source this map uses, and its state right now.</p> <div class="src-sum mono"><span class="d busy"></span> <span class="d ok"></span> <span class="d warn"></span> <span class="d error"></span> </div> <div class="sky-fov"><button type="button" class="chip"><!>Refresh live data</button></div> <!> <div class="label lg-sub">Data updates · what came in, and when</div> <p class="hint">Every build of the catalogue file, newest first, diffed by name against the one before: the exoplanet
    systems, planets and galaxies that arrived (NASA Exoplanet Archive weekly, Monday 05:23 UTC). The Gaia clouds and the
    Horizons table are static releases; the live feeds above refresh on their own schedules and are not builds.</p> <!> <div class="label lg-sub">NASA API key</div> <p class="hint">NASA's services (asteroid flybys, solar storms, EPIC) run on the shared <span class="mono">DEMO_KEY</span>,
    which allows about 30 requests an hour and then answers 429. A personal key is free at api.nasa.gov; it stays in this
    browser and goes only to api.nasa.gov.</p> <!></div>`);
function DataPane($$anchor, $$props) {
	push($$props, true);
	const $sources = () => store_get(sources, "$sources", $$stores);
	const [$$stores, $$cleanup] = setup_stores();
	let compact = prop($$props, "compact", 3, false);
	const GROUPS = [
		[
			"catalogue",
			"Catalogue files · this build",
			"Packed by the pipeline; the date is the file's. Not live."
		],
		[
			"live",
			"Live services",
			"Polled on a schedule: space weather every 5 min, events every 30 min, launches every 2 h, satellites and EPIC every 6 h."
		],
		[
			"earth",
			"Earth imagery",
			"Loaded when you fly to Earth."
		],
		[
			"sky",
			"Sky survey tiles",
			"Loaded on demand in the telescope."
		],
		[
			"query",
			"Catalogue queries",
			"Run from the Sky pane."
		]
	];
	const ago = (t) => {
		if (!t) return "";
		const s = (Date.now() - t) / 1e3;
		return s < 5 ? "just now" : s < 60 ? `${s.toFixed(0)} s ago` : s < 3600 ? `${(s / 60).toFixed(0)} min ago` : `${(s / 3600).toFixed(1)} h ago`;
	};
	const size = (b) => b == null ? "" : b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : b >= 1024 ? `${(b / 1024).toFixed(0)} kB` : `${b} B`;
	const fileDate = (m) => {
		if (!m) return "";
		const d = new Date(m);
		return isNaN(d) ? "" : d.toISOString().slice(0, 10);
	};
	const num = (n) => n == null ? "" : n.toLocaleString("en-US");
	let tick = /* @__PURE__ */ state(0);
	user_effect(() => {
		const t = setInterval(() => {
			update(tick);
		}, 5e3);
		return () => clearInterval(t);
	});
	let rows = /* @__PURE__ */ user_derived(() => Object.values($sources()).sort((a, b) => a.name.localeCompare(b.name)));
	let sum = /* @__PURE__ */ user_derived(() => {
		const o = {
			busy: 0,
			ok: 0,
			error: 0,
			warn: 0
		};
		for (const r of get(rows)) if (o[r.state] !== void 0) o[r.state]++;
		return o;
	});
	const stateText = (r) => r.state === "busy" ? "running…" : r.state === "ok" ? "ok" : r.state === "warn" ? "partial" : r.state === "error" ? "failed" : r.state === "absent" ? "not present" : "idle";
	let key = /* @__PURE__ */ state("");
	let keySaved = /* @__PURE__ */ state(false);
	user_effect(() => {
		try {
			set(keySaved, !!localStorage.getItem("nasa_api_key"));
		} catch (e) {}
	});
	function saveKey() {
		try {
			if (get(key).trim()) {
				localStorage.setItem("nasa_api_key", get(key).trim());
				set(keySaved, true);
				set(key, "");
				api.liveRefresh?.();
			}
		} catch (e) {}
	}
	function clearKey() {
		try {
			localStorage.removeItem("nasa_api_key");
			set(keySaved, false);
		} catch (e) {}
	}
	let log = /* @__PURE__ */ state(null);
	let logErr = /* @__PURE__ */ state("");
	user_effect(() => {
		if (get(log) !== null) return;
		tfetch("changelog-json", {
			name: "changelog.json · what came in, and when",
			group: "catalogue"
		}, "data/changelog.json?b=20261025-1115").then((r) => {
			if (!r.ok) throw new Error("HTTP " + r.status);
			return r.json();
		}).then((j) => {
			set(log, j, true);
			count("changelog-json", (j.builds || []).length);
		}).catch((e) => {
			set(logErr, e.message, true);
			set(log, { builds: [] }, true);
		});
	});
	const kind = (e) => /weekly/i.test(e.subject) || e.commit === "pending" ? "weekly refresh" : "rebuild";
	const sgn = (n) => n > 0 ? `+${num(n)}` : num(n);
	const plus = (e, k) => e.delta && e.delta[k] ? ` (${sgn(e.delta[k])})` : "";
	const names = (e, k) => e.added && e.added[k] || [];
	const more = (e, k) => Math.max(0, ((e.nAdded || {})[k] || 0) - names(e, k).length);
	var div = root_12$2();
	let classes;
	var div_1 = sibling(child(div), 4);
	var text$1 = sibling(child(div_1));
	var text_1 = sibling(text$1, 2);
	var text_2 = sibling(text_1, 2);
	var text_3 = sibling(text_2, 2);
	reset(div_1);
	var div_2 = sibling(div_1, 2);
	var button = child(div_2);
	Icon(child(button), {
		name: "reset",
		size: 12
	});
	next();
	reset(button);
	reset(div_2);
	var node_1 = sibling(div_2, 2);
	each(node_1, 17, () => GROUPS, ([g, title, note]) => g, ($$anchor, $$item) => {
		var $$array = /* @__PURE__ */ user_derived(() => to_array(get($$item), 3));
		let g = () => get($$array)[0];
		let title = () => get($$array)[1];
		let note = () => get($$array)[2];
		const list = /* @__PURE__ */ user_derived(() => get(rows).filter((r) => r.group === g()));
		var fragment = comment();
		var node_2 = first_child(fragment);
		var consequent_6 = ($$anchor) => {
			var fragment_1 = root_1$7();
			var div_3 = first_child(fragment_1);
			var text_4 = child(div_3, true);
			reset(div_3);
			var p = sibling(div_3, 2);
			var text_5 = child(p, true);
			reset(p);
			var ul = sibling(p, 2);
			each(ul, 21, () => get(list), (r) => r.id, ($$anchor, r) => {
				var li = root$7();
				var span = child(li);
				var span_1 = sibling(span, 2);
				var text_6 = child(span_1, true);
				reset(span_1);
				var span_2 = sibling(span_1, 2);
				var text_7 = child(span_2);
				reset(span_2);
				var span_3 = sibling(span_2, 2);
				var node_3 = child(span_3);
				var consequent = ($$anchor) => {
					var text_8 = text();
					template_effect(() => set_text(text_8, get(r).msg));
					append($$anchor, text_8);
				};
				if_block(node_3, ($$render) => {
					if (get(r).msg) $$render(consequent);
				});
				var node_4 = sibling(node_3, 2);
				var consequent_1 = ($$anchor) => {
					var text_9 = text();
					template_effect(($0) => set_text(text_9, `${get(r).msg ? " · " : ""}${$0 ?? ""} ${get(r).group === "sky" ? "tiles" : get(r).group === "catalogue" ? "records" : "items"}`), [() => num(get(r).n)]);
					append($$anchor, text_9);
				};
				if_block(node_4, ($$render) => {
					if (get(r).n != null) $$render(consequent_1);
				});
				var node_5 = sibling(node_4, 2);
				var consequent_2 = ($$anchor) => {
					var text_10 = text();
					template_effect(($0) => set_text(text_10, ` · ${$0 ?? ""}`), [() => size(get(r).size)]);
					append($$anchor, text_10);
				};
				if_block(node_5, ($$render) => {
					if (get(r).size) $$render(consequent_2);
				});
				var node_6 = sibling(node_5, 2);
				var consequent_3 = ($$anchor) => {
					var text_11 = text();
					template_effect(($0) => set_text(text_11, ` · file of ${$0 ?? ""}`), [() => fileDate(get(r).modified)]);
					append($$anchor, text_11);
				};
				if_block(node_6, ($$render) => {
					if (get(r).modified && get(r).group === "catalogue") $$render(consequent_3);
				});
				var node_7 = sibling(node_6, 2);
				var consequent_4 = ($$anchor) => {
					var text_12 = text();
					template_effect(($0) => set_text(text_12, ` · ${$0 ?? ""}`), [() => get(r).ms >= 1e3 ? (get(r).ms / 1e3).toFixed(1) + " s" : get(r).ms + " ms"]);
					append($$anchor, text_12);
				};
				if_block(node_7, ($$render) => {
					if (get(r).ms && get(r).state !== "busy") $$render(consequent_4);
				});
				var node_8 = sibling(node_7, 2);
				var consequent_5 = ($$anchor) => {
					var text_13 = text();
					template_effect(() => set_text(text_13, get(r).host));
					append($$anchor, text_13);
				};
				if_block(node_8, ($$render) => {
					if (!get(r).msg && get(r).n == null && !get(r).size && !get(r).ms) $$render(consequent_5);
				});
				reset(span_3);
				reset(li);
				template_effect(($0, $1) => {
					set_class(li, 1, `src-row ${get(r).state ?? ""}`);
					set_attribute(li, "title", get(r).host);
					set_class(span, 1, `d ${get(r).state ?? ""}`);
					set_text(text_6, get(r).name);
					set_text(text_7, `${$0 ?? ""}${$1 ?? ""}`);
				}, [() => stateText(get(r)), () => get(r).state === "busy" || !get(r).at ? "" : " · " + ago(get(r).at) + (get(tick) < 0 ? "" : "")]);
				append($$anchor, li);
			});
			reset(ul);
			template_effect(() => {
				set_text(text_4, title());
				set_text(text_5, note());
			});
			append($$anchor, fragment_1);
		};
		if_block(node_2, ($$render) => {
			if (get(list).length) $$render(consequent_6);
		});
		append($$anchor, fragment);
	});
	var node_9 = sibling(node_1, 6);
	var consequent_7 = ($$anchor) => {
		append($$anchor, root_2$4());
	};
	var consequent_8 = ($$anchor) => {
		var p_2 = root_3$3();
		var text_14 = child(p_2);
		reset(p_2);
		template_effect(() => set_text(text_14, `no changelog in this build${get(logErr) ? " · " + get(logErr) : ""}`));
		append($$anchor, p_2);
	};
	var alternate_1 = ($$anchor) => {
		var ul_1 = root_9$2();
		each(ul_1, 21, () => get(log).builds, (e) => e.commit + e.date, ($$anchor, e) => {
			const sys = /* @__PURE__ */ user_derived(() => names(get(e), "systems"));
			const gal = /* @__PURE__ */ user_derived(() => names(get(e), "galaxies"));
			const pl = /* @__PURE__ */ user_derived(() => names(get(e), "planets"));
			var li_1 = root_8$2();
			var div_4 = child(li_1);
			var span_4 = child(div_4);
			var text_15 = child(span_4, true);
			reset(span_4);
			var span_5 = sibling(span_4);
			var text_16 = child(span_5, true);
			reset(span_5);
			var span_6 = sibling(span_5, 2);
			var text_17 = child(span_6);
			reset(span_6);
			reset(div_4);
			var node_10 = sibling(div_4, 2);
			var consequent_16 = ($$anchor) => {
				var details = root_6$2();
				var summary = child(details);
				var node_11 = child(summary);
				var consequent_9 = ($$anchor) => {
					var text_18 = text();
					template_effect(($0, $1) => set_text(text_18, `${$0 ?? ""} new system${$1 ?? ""}`), [() => get(sys).length + more(get(e), "systems"), () => get(sys).length + more(get(e), "systems") === 1 ? "" : "s"]);
					append($$anchor, text_18);
				};
				if_block(node_11, ($$render) => {
					if (get(sys).length) $$render(consequent_9);
				});
				var node_12 = sibling(node_11);
				var consequent_10 = ($$anchor) => {
					var text_19 = text();
					text_19.nodeValue = " · ";
					append($$anchor, text_19);
				};
				if_block(node_12, ($$render) => {
					if (get(sys).length && get(gal).length) $$render(consequent_10);
				});
				var node_13 = sibling(node_12);
				var consequent_11 = ($$anchor) => {
					var text_20 = text();
					template_effect(($0, $1) => set_text(text_20, `${$0 ?? ""} new galax${$1 ?? ""}`), [() => get(gal).length + more(get(e), "galaxies"), () => get(gal).length + more(get(e), "galaxies") === 1 ? "y" : "ies"]);
					append($$anchor, text_20);
				};
				if_block(node_13, ($$render) => {
					if (get(gal).length) $$render(consequent_11);
				});
				var node_14 = sibling(node_13);
				var consequent_12 = ($$anchor) => {
					var text_21 = text();
					template_effect(($0, $1) => set_text(text_21, ` · ${$0 ?? ""} planet${$1 ?? ""}`), [() => get(pl).length + more(get(e), "planets"), () => get(pl).length + more(get(e), "planets") === 1 ? "" : "s"]);
					append($$anchor, text_21);
				};
				if_block(node_14, ($$render) => {
					if (get(pl).length) $$render(consequent_12);
				});
				reset(summary);
				var node_15 = sibling(summary, 2);
				var consequent_13 = ($$anchor) => {
					var p_3 = root_4$2();
					var text_22 = child(p_3);
					reset(p_3);
					template_effect(($0, $1) => set_text(text_22, `${$0 ?? ""}${$1 ?? ""}`), [() => get(sys).join(" · "), () => more(get(e), "systems") ? ` · +${more(get(e), "systems")} more` : ""]);
					append($$anchor, p_3);
				};
				if_block(node_15, ($$render) => {
					if (get(sys).length) $$render(consequent_13);
				});
				var node_16 = sibling(node_15, 2);
				var consequent_14 = ($$anchor) => {
					var p_4 = root_5$2();
					var text_23 = child(p_4);
					reset(p_4);
					template_effect(($0, $1) => set_text(text_23, `${$0 ?? ""}${$1 ?? ""}`), [() => get(pl).join(" · "), () => more(get(e), "planets") ? ` · +${more(get(e), "planets")} more` : ""]);
					append($$anchor, p_4);
				};
				if_block(node_16, ($$render) => {
					if (get(pl).length) $$render(consequent_14);
				});
				var node_17 = sibling(node_16, 2);
				var consequent_15 = ($$anchor) => {
					var p_5 = root_4$2();
					var text_24 = child(p_5, true);
					reset(p_5);
					template_effect(($0) => set_text(text_24, $0), [() => get(gal).join(" · ")]);
					append($$anchor, p_5);
				};
				if_block(node_17, ($$render) => {
					if (get(gal).length) $$render(consequent_15);
				});
				reset(details);
				append($$anchor, details);
			};
			var consequent_17 = ($$anchor) => {
				var p_6 = root_5$2();
				var text_25 = child(p_6, true);
				reset(p_6);
				template_effect(($0) => set_text(text_25, $0), [() => get(e).nRemoved && (get(e).nRemoved.systems || get(e).nRemoved.planets) ? `${get(e).nRemoved.systems || 0} systems / ${get(e).nRemoved.planets || 0} planets dropped` : get(e).delta.hyg ? `HYG ${sgn(get(e).delta.hyg)}` : "rebuilt · same contents, new positions or fields"]);
				append($$anchor, p_6);
			};
			var alternate = ($$anchor) => {
				append($$anchor, root_7$2());
			};
			if_block(node_10, ($$render) => {
				if (get(sys).length || get(gal).length) $$render(consequent_16);
				else if (get(e).delta) $$render(consequent_17, 1);
				else $$render(alternate, -1);
			});
			reset(li_1);
			template_effect(($0, $1, $2, $3, $4, $5, $6, $7, $8) => {
				set_text(text_15, get(e).date);
				set_text(text_16, $0);
				set_text(text_17, `${$1 ?? ""} systems${$2 ?? ""} · ${$3 ?? ""} planets${$4 ?? ""} · ${$5 ?? ""} galaxies${$6 ?? ""} · ${$7 ?? ""} HYG${$8 ?? ""}`);
			}, [
				() => kind(get(e)),
				() => num(get(e).counts.systems),
				() => plus(get(e), "systems"),
				() => num(get(e).counts.planets),
				() => plus(get(e), "planets"),
				() => num(get(e).counts.galaxies),
				() => plus(get(e), "galaxies"),
				() => num(get(e).counts.hyg),
				() => plus(get(e), "hyg")
			]);
			append($$anchor, li_1);
		});
		reset(ul_1);
		append($$anchor, ul_1);
	};
	if_block(node_9, ($$render) => {
		if (get(log) === null) $$render(consequent_7);
		else if (!get(log).builds.length) $$render(consequent_8, 1);
		else $$render(alternate_1, -1);
	});
	var node_18 = sibling(node_9, 6);
	var consequent_18 = ($$anchor) => {
		var div_5 = root_10$2();
		var button_1 = sibling(child(div_5));
		reset(div_5);
		delegated("click", button_1, clearKey);
		append($$anchor, div_5);
	};
	var alternate_2 = ($$anchor) => {
		var div_6 = root_11$2();
		var input = child(div_6);
		remove_input_defaults(input);
		var button_2 = sibling(input, 2);
		reset(div_6);
		template_effect(($0) => button_2.disabled = $0, [() => !get(key).trim()]);
		bind_value(input, () => get(key), ($$value) => set(key, $$value));
		delegated("click", button_2, saveKey);
		append($$anchor, div_6);
	};
	if_block(node_18, ($$render) => {
		if (get(keySaved)) $$render(consequent_18);
		else $$render(alternate_2, -1);
	});
	reset(div);
	template_effect(() => {
		classes = set_class(div, 1, "panel", null, classes, { compact: compact() });
		set_text(text$1, `${get(sum).busy ?? ""} running `);
		set_text(text_1, `${get(sum).ok ?? ""} ok `);
		set_text(text_2, `${get(sum).warn ?? ""} partial `);
		set_text(text_3, `${get(sum).error ?? ""} failed`);
	});
	delegated("click", button, () => api.liveRefresh?.());
	append($$anchor, div);
	pop();
	$$cleanup();
}
delegate(["click"]);
//#endregion
//#region src/components/AnalysisPane.svelte
var root$6 = /* @__PURE__ */ from_html(`<p> </p>`);
var root_1$6 = /* @__PURE__ */ from_html(`<button type="button"> </button>`);
var root_2$3 = /* @__PURE__ */ from_html(`<div class="sky-fov lc-obs"></div>`);
var root_3$2 = /* @__PURE__ */ from_html(`<span> </span><span> </span><span> </span>`, 1);
var root_4$1 = /* @__PURE__ */ from_html(`<div class="sky-ro mono lc-res"><span class="lc-bls"> </span><span> </span><span> </span><span> </span></div> <canvas class="lc-plot"></canvas> <p class="hint">A depth of d % means a radius ratio of √(d/100); a real transit repeats at every multiple of the period, is flat-bottomed and
          has the same depth at odd and even events. One sector proves nothing by itself: load another and the period must hold.</p>`, 1);
var root_5$1 = /* @__PURE__ */ from_html(`<canvas class="lc-plot"></canvas> <div class="sky-ro mono lc-res"><!></div> <!>`, 1);
var root_6$1 = /* @__PURE__ */ from_html(`<canvas class="lc-plot"></canvas> <div class="sky-fov"><button type="button" class="chip">Search periods and transits</button> <button type="button" class="chip">CSV</button></div> <!>`, 1);
var root_7$1 = /* @__PURE__ */ from_html(`<button type="button" class="chip"> </button> <button type="button" class="chip">Clear box</button>`, 1);
var root_8$1 = /* @__PURE__ */ from_html(`<p class="hint"> </p>`);
var root_9$1 = /* @__PURE__ */ from_html(`<div class="sky-ro mono lc-res"><span> </span><span> </span><span> </span></div>`);
var root_10$1 = /* @__PURE__ */ from_html(`<canvas class="lc-plot"></canvas> <!> <canvas class="lc-plot"></canvas>`, 1);
var root_11$1 = /* @__PURE__ */ from_html(`<button type="button" class="chip">Clear</button>`);
var root_12$1 = /* @__PURE__ */ from_html(`<p class="hint warn"> </p>`);
var root_13$1 = /* @__PURE__ */ from_html(`<span> </span>`);
var root_14$1 = /* @__PURE__ */ from_html(`<div class="sky-ro mono lc-res"><span> </span><span> </span><span> </span><span> </span></div> <div class="sky-ro mono lc-res"><span> </span><span> </span><span> </span><!></div> <p class="hint">The Sun on the same potential: R 8.0–9.2 kpc, |z| ≤ 110 pc, e 0.07, 228 Myr. A thick-disc or halo star shows in a large |z|, a large eccentricity, or a V far below the rotation.</p>`, 1);
var root_15$1 = /* @__PURE__ */ from_html(`<div class="panel" id="hud-analysis"><div class="label">Analysis</div> <div class="label lg-sub">Light curve</div> <p class="hint">TESS (2-minute SPOC) and Kepler light curves for the pinned star, straight from MAST and the public STScI bucket
    into this page: PDCSAP flux, quality 0, normalised per file. Lomb–Scargle finds periodic signals, a box search finds transits;
    the fold shows the transit at the BLS period.</p> <div class="sky-fov"><button type="button" class="chip"><!> </button></div> <!> <!> <!> <div class="label lg-sub">Field diagrams</div> <p class="hint">The Gaia stars on screen as a colour–magnitude diagram (absolute G from the Bailer-Jones distance against BP−RP) and a
    vector-point diagram of proper motions. A cluster is a clump in the VPD and a sequence in the CMD: drag a box on the VPD to pick
    its members — they are ringed on the sky, drawn in the CMD, and can become a set to export or identify.</p> <div class="sky-fov"><button type="button" class="chip">Scan this field</button> <!></div> <!> <!> <div class="label lg-sub">Kinematics</div> <p class="hint">U, V, W from parallax, proper motion and radial velocity (Johnson &amp; Soderblom 1987 in the Hipparcos Galactic frame,
    agrees with astropy to 1 m/s), and the star's orbit through the Galaxy for ±500 Myr in a disc + bulge + halo potential tuned
    to 232.8 km/s at the Sun (R₀ 8.122 kpc). The orbit is drawn on the map: dashed for the past, solid for the future.</p> <div class="sky-fov"><button type="button" class="chip"> </button> <!></div> <!> <!> <p class="hint src">MAST · STScI; TESS SPOC (Jenkins et al. 2016), Kepler (Borucki et al. 2010). Nothing is stored.</p></div>`);
function AnalysisPane($$anchor, $$props) {
	push($$props, true);
	const $lightcurve = () => store_get(lightcurve, "$lightcurve", $$stores);
	const $fielddiag = () => store_get(fielddiag, "$fielddiag", $$stores);
	const $selection = () => store_get(selection, "$selection", $$stores);
	const $camera = () => store_get(camera, "$camera", $$stores);
	const $kinematics = () => store_get(kinematics, "$kinematics", $$stores);
	const [$$stores, $$cleanup] = setup_stores();
	let lcEl = /* @__PURE__ */ state(null);
	let pgEl = /* @__PURE__ */ state(null);
	let foldEl = /* @__PURE__ */ state(null);
	const W = 300;
	const H = 120;
	function axes(c, w, h) {
		c.clearRect(0, 0, w, h);
		c.fillStyle = "#0b0e16";
		c.fillRect(0, 0, w, h);
		c.strokeStyle = "rgba(255,255,255,0.12)";
		c.lineWidth = 1;
		c.strokeRect(.5, .5, w - 1, h - 1);
	}
	function plotLc() {
		if (!get(lcEl) || !$lightcurve().data) return;
		const s = api.lcSamples?.();
		if (!s || !s.t.length) return;
		const c = get(lcEl).getContext("2d"), dpr = devicePixelRatio || 1;
		get(lcEl).width = W * dpr;
		get(lcEl).height = H * dpr;
		c.scale(dpr, dpr);
		axes(c, W, H);
		const t0 = s.t[0], t1 = s.t[s.t.length - 1];
		const ys = s.y.slice().sort((a, b) => a - b), lo = ys[Math.floor(ys.length * .005)], hi = ys[Math.floor(ys.length * .995)], span = hi - lo || 1e-4;
		c.fillStyle = "rgba(79,214,200,0.75)";
		for (let i = 0; i < s.t.length; i++) {
			const x = 4 + (s.t[i] - t0) / (t1 - t0 || 1) * (W - 8), y = H - 6 - (s.y[i] - lo) / span * (H - 12);
			c.fillRect(x, y, 1.2, 1.2);
		}
		c.fillStyle = "rgba(233,237,250,0.6)";
		c.font = "9px ui-monospace,monospace";
		c.fillText(`${(t1 - t0).toFixed(1)} d`, W - 34, H - 8);
		c.fillText(`±${((hi - lo) / 2 * 100).toFixed(2)} %`, 4, 10);
	}
	function plotPg() {
		const a = $lightcurve().analysis;
		if (!get(pgEl) || !a?.pg) return;
		const c = get(pgEl).getContext("2d"), dpr = devicePixelRatio || 1;
		get(pgEl).width = W * dpr;
		get(pgEl).height = H * dpr;
		c.scale(dpr, dpr);
		axes(c, W, H);
		const f = a.pg.f, p = a.pg.p, fmin = Math.log10(f[0]), fmax = Math.log10(f[f.length - 1]), pmax = Math.max(...p) || 1;
		c.strokeStyle = "rgba(79,214,200,0.9)";
		c.beginPath();
		for (let i = 0; i < f.length; i++) {
			const x = 4 + (Math.log10(f[i]) - fmin) / (fmax - fmin || 1) * (W - 8), y = H - 6 - p[i] / pmax * (H - 14);
			if (i) c.lineTo(x, y);
			else c.moveTo(x, y);
		}
		c.stroke();
		if (a.blsSr) {
			const q = a.blsSr.periods.map((v) => 1 / v), s = a.blsSr.sr, smax = Math.max(...s) || 1;
			c.strokeStyle = "rgba(255,207,107,0.8)";
			c.beginPath();
			for (let i = 0; i < q.length; i++) {
				const x = 4 + (Math.log10(q[i]) - fmin) / (fmax - fmin || 1) * (W - 8), y = H - 6 - s[i] / smax * (H - 14);
				if (x < 4 || x > W - 4) continue;
				if (i) c.lineTo(x, y);
				else c.moveTo(x, y);
			}
			c.stroke();
		}
		c.fillStyle = "rgba(233,237,250,0.6)";
		c.font = "9px ui-monospace,monospace";
		c.fillText(`${(1 / f[0]).toFixed(1)} d`, 4, H - 8);
		c.fillText(`${(1 / f[f.length - 1]).toFixed(2)} d`, W - 40, H - 8);
		c.fillText("Lomb–Scargle · BLS", 4, 10);
	}
	function plotFold() {
		const a = $lightcurve().analysis;
		if (!get(foldEl) || !a?.fold) return;
		const c = get(foldEl).getContext("2d"), dpr = devicePixelRatio || 1;
		get(foldEl).width = W * dpr;
		get(foldEl).height = H * dpr;
		c.scale(dpr, dpr);
		axes(c, W, H);
		const b = a.fold.bins.filter((v) => v === v), lo = Math.min(...b), hi = Math.max(...b), span = hi - lo || 1e-4;
		c.strokeStyle = "rgba(255,207,107,0.95)";
		c.beginPath();
		let started = false;
		for (let i = 0; i < a.fold.bins.length; i++) {
			const v = a.fold.bins[i];
			if (v !== v) continue;
			const x = 4 + (i + .5) / a.fold.bins.length * (W - 8), y = H - 6 - (v - lo) / span * (H - 14);
			if (started) c.lineTo(x, y);
			else c.moveTo(x, y);
			started = true;
		}
		c.stroke();
		c.fillStyle = "rgba(233,237,250,0.6)";
		c.font = "9px ui-monospace,monospace";
		c.fillText(`folded at ${a.bls.period.toFixed(4)} d · transit centred`, 4, 10);
		c.fillText(`${((hi - lo) * 100).toFixed(3)} %`, W - 46, H - 8);
	}
	user_effect(() => {
		$lightcurve().data;
		plotLc();
	});
	user_effect(() => {
		$lightcurve().analysis;
		plotPg();
		plotFold();
	});
	const fmtFap = (v) => v === void 0 ? "" : v < 1e-4 ? v.toExponential(1) : v.toFixed(3);
	let cmdEl = /* @__PURE__ */ state(null);
	let vpdEl = /* @__PURE__ */ state(null);
	let drag = null;
	const VR = {
		pr0: -150,
		pr1: 150,
		pd0: -150,
		pd1: 150
	};
	const vx = (v) => 4 + (v - VR.pr0) / (VR.pr1 - VR.pr0) * (W - 8);
	function plotCmd() {
		const f = $fielddiag();
		if (!get(cmdEl)) return;
		const c = get(cmdEl).getContext("2d"), dpr = devicePixelRatio || 1;
		get(cmdEl).width = W * dpr;
		get(cmdEl).height = H * 1.4 * dpr;
		c.scale(dpr, dpr);
		axes(c, W, H * 1.4);
		const x0 = -.5, x1 = 4, y0 = 16, y1 = -4;
		const px = (v) => 4 + (v - x0) / (x1 - x0) * (W - 8), py = (v) => 4 + (v - y0) / (y1 - y0) * (H * 1.4 - 8);
		c.fillStyle = "rgba(79,214,200,0.45)";
		for (const [b, m] of f.cmd) c.fillRect(px(b), py(m), 1.2, 1.2);
		if (f.memberCmd) {
			c.fillStyle = "rgba(196,170,255,0.95)";
			for (const [b, m] of f.memberCmd) c.fillRect(px(b) - 1, py(m) - 1, 2.4, 2.4);
		}
		c.fillStyle = "rgba(233,237,250,0.6)";
		c.font = "9px ui-monospace,monospace";
		c.fillText("M_G", 4, 10);
		c.fillText("BP−RP →", W - 50, H * 1.4 - 6);
		c.fillText(`${y0}`, 4, H * 1.4 - 6);
		c.fillText(`${y1}`, 4, 20);
	}
	function plotVpd() {
		const f = $fielddiag();
		if (!get(vpdEl)) return;
		const c = get(vpdEl).getContext("2d"), dpr = devicePixelRatio || 1;
		get(vpdEl).width = W * dpr;
		get(vpdEl).height = H * 1.4 * dpr;
		c.scale(dpr, dpr);
		axes(c, W, H * 1.4);
		const vy2 = (v) => H * 1.4 - 6 - (v - VR.pd0) / (VR.pd1 - VR.pd0) * (H * 1.4 - 12);
		c.strokeStyle = "rgba(255,255,255,0.1)";
		c.beginPath();
		c.moveTo(vx(0), 4);
		c.lineTo(vx(0), H * 1.4 - 4);
		c.moveTo(4, vy2(0));
		c.lineTo(W - 4, vy2(0));
		c.stroke();
		c.fillStyle = "rgba(79,214,200,0.45)";
		for (const [a, b] of f.vpd) {
			if (a < VR.pr0 || a > VR.pr1 || b < VR.pd0 || b > VR.pd1) continue;
			c.fillRect(vx(a), vy2(b), 1.2, 1.2);
		}
		if (f.box) {
			c.strokeStyle = "rgba(196,170,255,0.95)";
			c.strokeRect(vx(f.box.pr0), vy2(f.box.pd1), vx(f.box.pr1) - vx(f.box.pr0), vy2(f.box.pd0) - vy2(f.box.pd1));
		}
		c.fillStyle = "rgba(233,237,250,0.6)";
		c.font = "9px ui-monospace,monospace";
		c.fillText("μδ ↑  mas/yr", 4, 10);
		c.fillText("μα* →", W - 36, H * 1.4 - 6);
		c.fillText(`±${VR.pr1}`, W - 30, 10);
	}
	function vpdPos(e) {
		const r = get(vpdEl).getBoundingClientRect();
		const x = (e.clientX - r.left) / r.width * W, y = (e.clientY - r.top) / r.height * (H * 1.4);
		return {
			pr: VR.pr0 + (x - 4) / (W - 8) * (VR.pr1 - VR.pr0),
			pd: VR.pd0 + (H * 1.4 - 6 - y) / (H * 1.4 - 12) * (VR.pd1 - VR.pd0)
		};
	}
	function vpdDown(e) {
		drag = vpdPos(e);
		e.preventDefault();
	}
	function vpdUp(e) {
		if (!drag) return;
		const b = vpdPos(e);
		const box = {
			pr0: Math.min(drag.pr, b.pr),
			pr1: Math.max(drag.pr, b.pr),
			pd0: Math.min(drag.pd, b.pd),
			pd1: Math.max(drag.pd, b.pd)
		};
		drag = null;
		if (box.pr1 - box.pr0 < 2 && box.pd1 - box.pd0 < 2) api.selectBox?.(null);
		else api.selectBox?.(box);
	}
	user_effect(() => {
		$fielddiag();
		plotCmd();
		plotVpd();
	});
	var div = root_15$1();
	var div_1 = sibling(child(div), 6);
	var button = child(div_1);
	var node = child(button);
	Icon(node, {
		name: "search",
		size: 12
	});
	var text = sibling(node);
	reset(button);
	reset(div_1);
	var node_1 = sibling(div_1, 2);
	var consequent = ($$anchor) => {
		var p_1 = root$6();
		let classes;
		var text_1 = child(p_1, true);
		reset(p_1);
		template_effect(() => {
			classes = set_class(p_1, 1, "hint", null, classes, { busy: !!$lightcurve().busy });
			set_text(text_1, $lightcurve().msg);
		});
		append($$anchor, p_1);
	};
	if_block(node_1, ($$render) => {
		if ($lightcurve().msg) $$render(consequent);
	});
	var node_2 = sibling(node_1, 2);
	var consequent_1 = ($$anchor) => {
		var div_2 = root_2$3();
		each(div_2, 7, () => $lightcurve().obs, (ob) => ob.obsid, ($$anchor, ob, k) => {
			var button_1 = root_1$6();
			let classes_1;
			var text_2 = child(button_1);
			reset(button_1);
			template_effect(($0) => {
				classes_1 = set_class(button_1, 1, "chip", null, classes_1, { on: $lightcurve().data && $lightcurve().data.mission === get(ob).mission && $lightcurve().data.sector === get(ob).sector });
				button_1.disabled = !!$lightcurve().busy;
				set_text(text_2, `${get(ob).mission ?? ""}${get(ob).sector ? ` s${get(ob).sector}` : " · all quarters"}${$0 ?? ""}`);
			}, [() => get(ob).days ? ` · ${get(ob).days.toFixed(0)} d` : ""]);
			delegated("click", button_1, () => api.lcLoad?.(get(k)));
			append($$anchor, button_1);
		});
		reset(div_2);
		append($$anchor, div_2);
	};
	if_block(node_2, ($$render) => {
		if ($lightcurve().obs.length) $$render(consequent_1);
	});
	var node_3 = sibling(node_2, 2);
	var consequent_5 = ($$anchor) => {
		var fragment = root_6$1();
		var canvas = first_child(fragment);
		set_attribute(canvas, "width", W);
		set_attribute(canvas, "height", H);
		set_style(canvas, "width:300px;height:120px");
		bind_this(canvas, ($$value) => set(lcEl, $$value), () => get(lcEl));
		var div_3 = sibling(canvas, 2);
		var button_2 = child(div_3);
		var button_3 = sibling(button_2, 2);
		reset(div_3);
		var node_4 = sibling(div_3, 2);
		var consequent_4 = ($$anchor) => {
			var fragment_1 = root_5$1();
			var canvas_1 = first_child(fragment_1);
			set_attribute(canvas_1, "width", W);
			set_attribute(canvas_1, "height", H);
			set_style(canvas_1, "width:300px;height:120px");
			bind_this(canvas_1, ($$value) => set(pgEl, $$value), () => get(pgEl));
			var div_4 = sibling(canvas_1, 2);
			var node_5 = child(div_4);
			var consequent_2 = ($$anchor) => {
				var fragment_2 = root_3$2();
				var span_1 = first_child(fragment_2);
				var text_3 = child(span_1);
				reset(span_1);
				var span_2 = sibling(span_1);
				var text_4 = child(span_2);
				reset(span_2);
				var span_3 = sibling(span_2);
				var text_5 = child(span_3);
				reset(span_3);
				template_effect(($0, $1, $2) => {
					set_text(text_3, `LS ${$0 ?? ""} d`);
					set_text(text_4, `power ${$1 ?? ""}`);
					set_text(text_5, `FAP ${$2 ?? ""}`);
				}, [
					() => $lightcurve().analysis.ls.period.toFixed(4),
					() => $lightcurve().analysis.ls.power.toFixed(3),
					() => fmtFap($lightcurve().analysis.ls.fap)
				]);
				append($$anchor, fragment_2);
			};
			if_block(node_5, ($$render) => {
				if ($lightcurve().analysis.ls) $$render(consequent_2);
			});
			reset(div_4);
			var node_6 = sibling(div_4, 2);
			var consequent_3 = ($$anchor) => {
				var fragment_3 = root_4$1();
				var div_5 = first_child(fragment_3);
				var span_4 = child(div_5);
				var text_6 = child(span_4);
				reset(span_4);
				var span_5 = sibling(span_4);
				var text_7 = child(span_5);
				reset(span_5);
				var span_6 = sibling(span_5);
				var text_8 = child(span_6);
				reset(span_6);
				var span_7 = sibling(span_6);
				var text_9 = child(span_7);
				reset(span_7);
				reset(div_5);
				var canvas_2 = sibling(div_5, 2);
				set_attribute(canvas_2, "width", W);
				set_attribute(canvas_2, "height", H);
				set_style(canvas_2, "width:300px;height:120px");
				bind_this(canvas_2, ($$value) => set(foldEl, $$value), () => get(foldEl));
				next(2);
				template_effect(($0, $1, $2) => {
					set_text(text_6, `BLS ${$0 ?? ""} d`);
					set_text(text_7, `depth ${$1 ?? ""} %`);
					set_text(text_8, `${$2 ?? ""} h`);
					set_text(text_9, `${$lightcurve().analysis.bls.nIn ?? ""} pts in`);
				}, [
					() => $lightcurve().analysis.bls.period.toFixed(4),
					() => ($lightcurve().analysis.bls.depth * 100).toFixed(3),
					() => ($lightcurve().analysis.bls.duration * 24).toFixed(1)
				]);
				append($$anchor, fragment_3);
			};
			if_block(node_6, ($$render) => {
				if ($lightcurve().analysis.bls) $$render(consequent_3);
			});
			append($$anchor, fragment_1);
		};
		if_block(node_4, ($$render) => {
			if ($lightcurve().analysis) $$render(consequent_4);
		});
		template_effect(() => button_2.disabled = !!$lightcurve().busy);
		delegated("click", button_2, () => api.lcAnalyse?.());
		delegated("click", button_3, () => api.lcExport?.());
		append($$anchor, fragment);
	};
	if_block(node_3, ($$render) => {
		if ($lightcurve().data) $$render(consequent_5);
	});
	var div_6 = sibling(node_3, 6);
	var button_4 = child(div_6);
	var node_7 = sibling(button_4, 2);
	var consequent_6 = ($$anchor) => {
		var fragment_4 = root_7$1();
		var button_5 = first_child(fragment_4);
		var text_10 = child(button_5);
		reset(button_5);
		var button_6 = sibling(button_5, 2);
		template_effect(() => set_text(text_10, `Members → set (${$fielddiag().members ?? ""})`));
		delegated("click", button_5, () => api.membersAsSet?.());
		delegated("click", button_6, () => api.selectBox?.(null));
		append($$anchor, fragment_4);
	};
	if_block(node_7, ($$render) => {
		if ($fielddiag().members) $$render(consequent_6);
	});
	reset(div_6);
	var node_8 = sibling(div_6, 2);
	var consequent_7 = ($$anchor) => {
		var p_2 = root_8$1();
		var text_11 = child(p_2, true);
		reset(p_2);
		template_effect(() => set_text(text_11, $fielddiag().msg));
		append($$anchor, p_2);
	};
	if_block(node_8, ($$render) => {
		if ($fielddiag().msg) $$render(consequent_7);
	});
	var node_9 = sibling(node_8, 2);
	var consequent_9 = ($$anchor) => {
		var fragment_5 = root_10$1();
		var canvas_3 = first_child(fragment_5);
		set_attribute(canvas_3, "width", W);
		set_attribute(canvas_3, "height", H * 1.4);
		set_style(canvas_3, "width:300px;height:168px;cursor:crosshair");
		bind_this(canvas_3, ($$value) => set(vpdEl, $$value), () => get(vpdEl));
		var node_10 = sibling(canvas_3, 2);
		var consequent_8 = ($$anchor) => {
			var div_7 = root_9$1();
			var span_8 = child(div_7);
			var text_12 = child(span_8);
			reset(span_8);
			var span_9 = sibling(span_8);
			var text_13 = child(span_9);
			reset(span_9);
			var span_10 = sibling(span_9);
			var text_14 = child(span_10);
			reset(span_10);
			reset(div_7);
			template_effect(($0, $1, $2, $3, $4) => {
				set_text(text_12, `${$fielddiag().members ?? ""} members`);
				set_text(text_13, `mean d ${$0 ?? ""} pc`);
				set_text(text_14, `μ box ${$1 ?? ""}…${$2 ?? ""} / ${$3 ?? ""}…${$4 ?? ""}`);
			}, [
				() => $fielddiag().meanD.toFixed(1),
				() => $fielddiag().box.pr0.toFixed(0),
				() => $fielddiag().box.pr1.toFixed(0),
				() => $fielddiag().box.pd0.toFixed(0),
				() => $fielddiag().box.pd1.toFixed(0)
			]);
			append($$anchor, div_7);
		};
		if_block(node_10, ($$render) => {
			if ($fielddiag().members) $$render(consequent_8);
		});
		var canvas_4 = sibling(node_10, 2);
		set_attribute(canvas_4, "width", W);
		set_attribute(canvas_4, "height", H * 1.4);
		set_style(canvas_4, "width:300px;height:168px");
		bind_this(canvas_4, ($$value) => set(cmdEl, $$value), () => get(cmdEl));
		delegated("pointerdown", canvas_3, vpdDown);
		delegated("pointerup", canvas_3, vpdUp);
		append($$anchor, fragment_5);
	};
	if_block(node_9, ($$render) => {
		if ($fielddiag().n) $$render(consequent_9);
	});
	var div_8 = sibling(node_9, 6);
	var button_7 = child(div_8);
	var text_15 = child(button_7);
	reset(button_7);
	var node_11 = sibling(button_7, 2);
	var consequent_10 = ($$anchor) => {
		var button_8 = root_11$1();
		delegated("click", button_8, () => api.clearKinematics?.());
		append($$anchor, button_8);
	};
	if_block(node_11, ($$render) => {
		if ($kinematics().star) $$render(consequent_10);
	});
	reset(div_8);
	var node_12 = sibling(div_8, 2);
	var consequent_11 = ($$anchor) => {
		var p_3 = root_12$1();
		var text_16 = child(p_3, true);
		reset(p_3);
		template_effect(() => set_text(text_16, $kinematics().msg));
		append($$anchor, p_3);
	};
	if_block(node_12, ($$render) => {
		if ($kinematics().msg) $$render(consequent_11);
	});
	var node_13 = sibling(node_12, 2);
	var consequent_13 = ($$anchor) => {
		var fragment_6 = root_14$1();
		var div_9 = first_child(fragment_6);
		var span_11 = child(div_9);
		var text_17 = child(span_11);
		reset(span_11);
		var span_12 = sibling(span_11);
		var text_18 = child(span_12);
		reset(span_12);
		var span_13 = sibling(span_12);
		var text_19 = child(span_13);
		reset(span_13);
		var span_14 = sibling(span_13);
		var text_20 = child(span_14);
		reset(span_14);
		reset(div_9);
		var div_10 = sibling(div_9, 2);
		var span_15 = child(div_10);
		var text_21 = child(span_15);
		reset(span_15);
		var span_16 = sibling(span_15);
		var text_22 = child(span_16);
		reset(span_16);
		var span_17 = sibling(span_16);
		var text_23 = child(span_17);
		reset(span_17);
		var node_14 = sibling(span_17);
		var consequent_12 = ($$anchor) => {
			var span_18 = root_13$1();
			var text_24 = child(span_18);
			reset(span_18);
			template_effect(($0) => set_text(text_24, `period ${$0 ?? ""} Myr`), [() => $kinematics().period.toFixed(0)]);
			append($$anchor, span_18);
		};
		if_block(node_14, ($$render) => {
			if ($kinematics().period) $$render(consequent_12);
		});
		reset(div_10);
		next(2);
		template_effect(($0, $1, $2, $3, $4, $5, $6, $7) => {
			set_text(text_17, `U ${$0 ?? ""}`);
			set_text(text_18, `V ${$1 ?? ""}`);
			set_text(text_19, `W ${$2 ?? ""} km/s`);
			set_text(text_20, `|v| ${$3 ?? ""}`);
			set_text(text_21, `R ${$4 ?? ""}–${$5 ?? ""} kpc`);
			set_text(text_22, `|z| ≤ ${$6 ?? ""} pc`);
			set_text(text_23, `e ${$7 ?? ""}`);
		}, [
			() => $kinematics().U.toFixed(1),
			() => $kinematics().V.toFixed(1),
			() => $kinematics().W.toFixed(1),
			() => $kinematics().speed.toFixed(1),
			() => $kinematics().Rmin.toFixed(2),
			() => $kinematics().Rmax.toFixed(2),
			() => ($kinematics().zmax * 1e3).toFixed(0),
			() => $kinematics().ecc.toFixed(3)
		]);
		append($$anchor, fragment_6);
	};
	if_block(node_13, ($$render) => {
		if ($kinematics().star) $$render(consequent_13);
	});
	next(2);
	reset(div);
	template_effect(() => {
		button.disabled = !$selection() || !!$lightcurve().busy;
		set_text(text, `Find light curves of ${$selection()?.card?.title ?? "the pinned object" ?? ""}`);
		button_4.disabled = !$camera().sky;
		button_7.disabled = !$selection();
		set_text(text_15, `Orbit of ${$selection()?.card?.title ?? "the pinned star" ?? ""}`);
	});
	delegated("click", button, () => api.lcSearch?.());
	delegated("click", button_4, () => api.scanField?.());
	delegated("click", button_7, () => api.kinematics?.());
	append($$anchor, div);
	pop();
	$$cleanup();
}
delegate([
	"click",
	"pointerdown",
	"pointerup"
]);
//#endregion
//#region src/components/TransitCard.svelte
var root$5 = /* @__PURE__ */ from_svg(`<text class="tc-pl"> </text>`);
var root_1$5 = /* @__PURE__ */ from_html(`<section class="panel tcard" aria-label="Transit light curve"><div class="label">What a telescope sees</div> <svg width="100%" role="img" aria-label="Brightness of the star over twenty days"><line y1="4" class="tc-now"></line><line class="tc-base"></line><polyline class="tc-curve"></polyline><!><text class="tc-ax">−10 d</text><text class="tc-ax" text-anchor="middle">now</text><text class="tc-ax" text-anchor="end">+10 d</text><text y="12" class="tc-ax" text-anchor="end"> </text></svg> <div class="hint"> </div></section>`);
function TransitCard($$anchor, $$props) {
	push($$props, true);
	const $transit = () => store_get(transit, "$transit", $$stores);
	const [$$stores, $$cleanup] = setup_stores();
	const W = 300;
	const H = 92;
	const PAD = 26;
	const HALF = 10;
	let view = /* @__PURE__ */ user_derived(() => {
		const t = $transit();
		if (!t) return null;
		const dips = [];
		for (const p of t.planets) {
			if (!(p.per > 0 && p.t0 > 0 && p.depth > 0)) continue;
			const k0 = Math.floor((t.now - HALF - p.t0) / p.per), k1 = Math.ceil((t.now + HALF - p.t0) / p.per);
			for (let k = k0; k <= k1; k++) {
				const tc = p.t0 + k * p.per - t.now;
				if (Math.abs(tc) <= HALF + p.dur) dips.push({
					n: p.n.replace(t.host, "").trim(),
					tc,
					dur: p.dur,
					ing: p.ing,
					depth: p.depth
				});
			}
		}
		const maxDepth = Math.max(1e-5, ...dips.map((d) => d.depth));
		const x = (d) => PAD + (d + HALF) / (2 * HALF) * (W - 2 * PAD);
		const y = (f) => 8 + (1 - f) / maxDepth * (H - 30);
		const pts = [];
		const N = 480;
		for (let i = 0; i <= N; i++) {
			const td = -10 + i / N * 2 * HALF;
			let f = 1;
			for (const d of dips) {
				const a = Math.abs(td - d.tc), h = d.dur / 2;
				if (a < h) f -= d.depth * (a > h - d.ing ? (h - a) / d.ing : 1);
			}
			pts.push(`${x(td).toFixed(1)},${y(f).toFixed(1)}`);
		}
		const inWin = dips.filter((d) => Math.abs(d.tc) <= HALF);
		const labels = inWin.length <= 12 ? inWin.map((d) => ({
			n: d.n,
			x: x(d.tc),
			y: y(1 - d.depth) + 10
		})) : [];
		const pct = maxDepth >= .001 ? (maxDepth * 100).toFixed(2) + " %" : Math.round(maxDepth * 1e6) + " ppm";
		return {
			pts: pts.join(" "),
			labels,
			pct,
			x,
			y,
			n: dips.length,
			rstar: t.rstar
		};
	});
	var fragment = comment();
	var node = first_child(fragment);
	var consequent = ($$anchor) => {
		var section = root_1$5();
		var svg = sibling(child(section), 2);
		set_attribute(svg, "viewBox", "0 0 300 92");
		var line = child(svg);
		set_attribute(line, "y2", H - 16);
		var line_1 = sibling(line);
		set_attribute(line_1, "x1", PAD);
		set_attribute(line_1, "x2", W - PAD);
		var polyline = sibling(line_1);
		var node_1 = sibling(polyline);
		each(node_1, 17, () => get(view).labels, (l) => l.n + l.x, ($$anchor, l) => {
			var text = root$5();
			var text_1 = child(text, true);
			reset(text);
			template_effect(() => {
				set_attribute(text, "x", get(l).x);
				set_attribute(text, "y", get(l).y);
				set_text(text_1, get(l).n);
			});
			append($$anchor, text);
		});
		var text_2 = sibling(node_1);
		set_attribute(text_2, "x", PAD);
		set_attribute(text_2, "y", H - 4);
		var text_3 = sibling(text_2);
		set_attribute(text_3, "y", H - 4);
		var text_4 = sibling(text_3);
		set_attribute(text_4, "x", W - PAD);
		set_attribute(text_4, "y", H - 4);
		var text_5 = sibling(text_4);
		set_attribute(text_5, "x", W - PAD);
		var text_6 = child(text_5);
		reset(text_5);
		reset(svg);
		var div = sibling(svg, 2);
		var text_7 = child(div);
		reset(div);
		reset(section);
		template_effect(($0, $1, $2, $3, $4, $5) => {
			set_attribute(line, "x1", $0);
			set_attribute(line, "x2", $1);
			set_attribute(line_1, "y1", $2);
			set_attribute(line_1, "y2", $3);
			set_attribute(polyline, "points", get(view).pts);
			set_attribute(text_3, "x", $4);
			set_text(text_6, `dip ${get(view).pct ?? ""}`);
			set_text(text_7, `${get(view).n ? `${get(view).n} transit${get(view).n === 1 ? "" : "s"} in these 20 days` : "no transit in these 20 days"} · star ${$5 ?? ""} R☉ · depth = (R planet / R star)²`);
		}, [
			() => get(view).x(0),
			() => get(view).x(0),
			() => get(view).y(1),
			() => get(view).y(1),
			() => get(view).x(0),
			() => get(view).rstar.toFixed(2)
		]);
		append($$anchor, section);
	};
	if_block(node, ($$render) => {
		if (get(view)) $$render(consequent);
	});
	append($$anchor, fragment);
	pop();
	$$cleanup();
}
//#endregion
//#region node_modules/satellite.js/dist/satellite.es.js
/*!
* satellite-js v5.0.0
* (c) 2013 Shashwat Kandadai and UCSC
* https://github.com/shashwatak/satellite-js
* License: MIT
*/
var pi = Math.PI;
var twoPi = pi * 2;
var deg2rad = pi / 180;
180 / pi;
var mu = 398600.8;
var earthRadius = 6378.135;
var xke = 60 / Math.sqrt(earthRadius * earthRadius * earthRadius / mu);
var vkmpersec = earthRadius * xke / 60;
var tumin = 1 / xke;
var j2 = .001082616;
var j3 = -253881e-11;
var j4 = -165597e-11;
var j3oj2 = j3 / j2;
var x2o3 = 2 / 3;
function days2mdhms(year, days) {
	var lmonth = [
		31,
		year % 4 === 0 ? 29 : 28,
		31,
		30,
		31,
		30,
		31,
		31,
		30,
		31,
		30,
		31
	];
	var dayofyr = Math.floor(days);
	var i = 1;
	var inttemp = 0;
	while (dayofyr > inttemp + lmonth[i - 1] && i < 12) {
		inttemp += lmonth[i - 1];
		i += 1;
	}
	var mon = i;
	var day = dayofyr - inttemp;
	var temp = (days - dayofyr) * 24;
	var hr = Math.floor(temp);
	temp = (temp - hr) * 60;
	var minute = Math.floor(temp);
	return {
		mon,
		day,
		hr,
		minute,
		sec: (temp - minute) * 60
	};
}
function jdayInternal(year, mon, day, hr, minute, sec) {
	var msec = arguments.length > 6 && arguments[6] !== void 0 ? arguments[6] : 0;
	return 367 * year - Math.floor(7 * (year + Math.floor((mon + 9) / 12)) * .25) + Math.floor(275 * mon / 9) + day + 1721013.5 + ((msec / 6e4 + sec / 60 + minute) / 60 + hr) / 24;
}
function jday(year, mon, day, hr, minute, sec, msec) {
	if (year instanceof Date) {
		var date = year;
		return jdayInternal(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
	}
	return jdayInternal(year, mon, day, hr, minute, sec, msec);
}
function dpper(satrec, options) {
	var e3 = satrec.e3, ee2 = satrec.ee2, peo = satrec.peo, pgho = satrec.pgho, pho = satrec.pho, pinco = satrec.pinco, plo = satrec.plo, se2 = satrec.se2, se3 = satrec.se3, sgh2 = satrec.sgh2, sgh3 = satrec.sgh3, sgh4 = satrec.sgh4, sh2 = satrec.sh2, sh3 = satrec.sh3, si2 = satrec.si2, si3 = satrec.si3, sl2 = satrec.sl2, sl3 = satrec.sl3, sl4 = satrec.sl4, t = satrec.t, xgh2 = satrec.xgh2, xgh3 = satrec.xgh3, xgh4 = satrec.xgh4, xh2 = satrec.xh2, xh3 = satrec.xh3, xi2 = satrec.xi2, xi3 = satrec.xi3, xl2 = satrec.xl2, xl3 = satrec.xl3, xl4 = satrec.xl4, zmol = satrec.zmol, zmos = satrec.zmos;
	var init = options.init, opsmode = options.opsmode;
	var ep = options.ep, inclp = options.inclp, nodep = options.nodep, argpp = options.argpp, mp = options.mp;
	var alfdp;
	var betdp;
	var cosip;
	var sinip;
	var cosop;
	var sinop;
	var dalf;
	var dbet;
	var dls;
	var f2;
	var f3;
	var pe;
	var pgh;
	var ph;
	var pinc;
	var pl;
	var sinzf;
	var xls;
	var xnoh;
	var zf;
	var zm;
	var zns = 119459e-10;
	var zes = .01675;
	var znl = .00015835218;
	var zel = .0549;
	zm = zmos + zns * t;
	if (init === "y") zm = zmos;
	zf = zm + 2 * zes * Math.sin(zm);
	sinzf = Math.sin(zf);
	f2 = .5 * sinzf * sinzf - .25;
	f3 = -.5 * sinzf * Math.cos(zf);
	var ses = se2 * f2 + se3 * f3;
	var sis = si2 * f2 + si3 * f3;
	var sls = sl2 * f2 + sl3 * f3 + sl4 * sinzf;
	var sghs = sgh2 * f2 + sgh3 * f3 + sgh4 * sinzf;
	var shs = sh2 * f2 + sh3 * f3;
	zm = zmol + znl * t;
	if (init === "y") zm = zmol;
	zf = zm + 2 * zel * Math.sin(zm);
	sinzf = Math.sin(zf);
	f2 = .5 * sinzf * sinzf - .25;
	f3 = -.5 * sinzf * Math.cos(zf);
	var sel = ee2 * f2 + e3 * f3;
	var sil = xi2 * f2 + xi3 * f3;
	var sll = xl2 * f2 + xl3 * f3 + xl4 * sinzf;
	var sghl = xgh2 * f2 + xgh3 * f3 + xgh4 * sinzf;
	var shll = xh2 * f2 + xh3 * f3;
	pe = ses + sel;
	pinc = sis + sil;
	pl = sls + sll;
	pgh = sghs + sghl;
	ph = shs + shll;
	if (init === "n") {
		pe -= peo;
		pinc -= pinco;
		pl -= plo;
		pgh -= pgho;
		ph -= pho;
		inclp += pinc;
		ep += pe;
		sinip = Math.sin(inclp);
		cosip = Math.cos(inclp);
		if (inclp >= .2) {
			ph /= sinip;
			pgh -= cosip * ph;
			argpp += pgh;
			nodep += ph;
			mp += pl;
		} else {
			sinop = Math.sin(nodep);
			cosop = Math.cos(nodep);
			alfdp = sinip * sinop;
			betdp = sinip * cosop;
			dalf = ph * cosop + pinc * cosip * sinop;
			dbet = -ph * sinop + pinc * cosip * cosop;
			alfdp += dalf;
			betdp += dbet;
			nodep %= twoPi;
			if (nodep < 0 && opsmode === "a") nodep += twoPi;
			xls = mp + argpp + cosip * nodep;
			dls = pl + pgh - pinc * nodep * sinip;
			xls += dls;
			xnoh = nodep;
			nodep = Math.atan2(alfdp, betdp);
			if (nodep < 0 && opsmode === "a") nodep += twoPi;
			if (Math.abs(xnoh - nodep) > pi) if (nodep < xnoh) nodep += twoPi;
			else nodep -= twoPi;
			mp += pl;
			argpp = xls - mp - cosip * nodep;
		}
	}
	return {
		ep,
		inclp,
		nodep,
		argpp,
		mp
	};
}
function dscom(options) {
	var epoch = options.epoch, ep = options.ep, argpp = options.argpp, tc = options.tc, inclp = options.inclp, nodep = options.nodep, np = options.np;
	var a1;
	var a2;
	var a3;
	var a4;
	var a5;
	var a6;
	var a7;
	var a8;
	var a9;
	var a10;
	var cc;
	var x1;
	var x2;
	var x3;
	var x4;
	var x5;
	var x6;
	var x7;
	var x8;
	var zcosg;
	var zsing;
	var zcosh;
	var zsinh;
	var zcosi;
	var zsini;
	var ss1;
	var ss2;
	var ss3;
	var ss4;
	var ss5;
	var ss6;
	var ss7;
	var sz1;
	var sz2;
	var sz3;
	var sz11;
	var sz12;
	var sz13;
	var sz21;
	var sz22;
	var sz23;
	var sz31;
	var sz32;
	var sz33;
	var s1;
	var s2;
	var s3;
	var s4;
	var s5;
	var s6;
	var s7;
	var z1;
	var z2;
	var z3;
	var z11;
	var z12;
	var z13;
	var z21;
	var z22;
	var z23;
	var z31;
	var z32;
	var z33;
	var zes = .01675;
	var zel = .0549;
	var c1ss = 29864797e-13;
	var c1l = 4.7968065e-7;
	var zsinis = .39785416;
	var zcosis = .91744867;
	var zcosgs = .1945905;
	var zsings = -.98088458;
	var nm = np;
	var em = ep;
	var snodm = Math.sin(nodep);
	var cnodm = Math.cos(nodep);
	var sinomm = Math.sin(argpp);
	var cosomm = Math.cos(argpp);
	var sinim = Math.sin(inclp);
	var cosim = Math.cos(inclp);
	var emsq = em * em;
	var betasq = 1 - emsq;
	var rtemsq = Math.sqrt(betasq);
	var peo = 0;
	var pinco = 0;
	var plo = 0;
	var pgho = 0;
	var pho = 0;
	var day = epoch + 18261.5 + tc / 1440;
	var xnodce = (4.523602 - .00092422029 * day) % twoPi;
	var stem = Math.sin(xnodce);
	var ctem = Math.cos(xnodce);
	var zcosil = .91375164 - .03568096 * ctem;
	var zsinil = Math.sqrt(1 - zcosil * zcosil);
	var zsinhl = .089683511 * stem / zsinil;
	var zcoshl = Math.sqrt(1 - zsinhl * zsinhl);
	var gam = 5.8351514 + .001944368 * day;
	var zx = .39785416 * stem / zsinil;
	var zy = zcoshl * ctem + .91744867 * zsinhl * stem;
	zx = Math.atan2(zx, zy);
	zx += gam - xnodce;
	var zcosgl = Math.cos(zx);
	var zsingl = Math.sin(zx);
	zcosg = zcosgs;
	zsing = zsings;
	zcosi = zcosis;
	zsini = zsinis;
	zcosh = cnodm;
	zsinh = snodm;
	cc = c1ss;
	var xnoi = 1 / nm;
	var lsflg = 0;
	while (lsflg < 2) {
		lsflg += 1;
		a1 = zcosg * zcosh + zsing * zcosi * zsinh;
		a3 = -zsing * zcosh + zcosg * zcosi * zsinh;
		a7 = -zcosg * zsinh + zsing * zcosi * zcosh;
		a8 = zsing * zsini;
		a9 = zsing * zsinh + zcosg * zcosi * zcosh;
		a10 = zcosg * zsini;
		a2 = cosim * a7 + sinim * a8;
		a4 = cosim * a9 + sinim * a10;
		a5 = -sinim * a7 + cosim * a8;
		a6 = -sinim * a9 + cosim * a10;
		x1 = a1 * cosomm + a2 * sinomm;
		x2 = a3 * cosomm + a4 * sinomm;
		x3 = -a1 * sinomm + a2 * cosomm;
		x4 = -a3 * sinomm + a4 * cosomm;
		x5 = a5 * sinomm;
		x6 = a6 * sinomm;
		x7 = a5 * cosomm;
		x8 = a6 * cosomm;
		z31 = 12 * x1 * x1 - 3 * x3 * x3;
		z32 = 24 * x1 * x2 - 6 * x3 * x4;
		z33 = 12 * x2 * x2 - 3 * x4 * x4;
		z1 = 3 * (a1 * a1 + a2 * a2) + z31 * emsq;
		z2 = 6 * (a1 * a3 + a2 * a4) + z32 * emsq;
		z3 = 3 * (a3 * a3 + a4 * a4) + z33 * emsq;
		z11 = -6 * a1 * a5 + emsq * (-24 * x1 * x7 - 6 * x3 * x5);
		z12 = -6 * (a1 * a6 + a3 * a5) + emsq * (-24 * (x2 * x7 + x1 * x8) + -6 * (x3 * x6 + x4 * x5));
		z13 = -6 * a3 * a6 + emsq * (-24 * x2 * x8 - 6 * x4 * x6);
		z21 = 6 * a2 * a5 + emsq * (24 * x1 * x5 - 6 * x3 * x7);
		z22 = 6 * (a4 * a5 + a2 * a6) + emsq * (24 * (x2 * x5 + x1 * x6) - 6 * (x4 * x7 + x3 * x8));
		z23 = 6 * a4 * a6 + emsq * (24 * x2 * x6 - 6 * x4 * x8);
		z1 = z1 + z1 + betasq * z31;
		z2 = z2 + z2 + betasq * z32;
		z3 = z3 + z3 + betasq * z33;
		s3 = cc * xnoi;
		s2 = -.5 * s3 / rtemsq;
		s4 = s3 * rtemsq;
		s1 = -15 * em * s4;
		s5 = x1 * x3 + x2 * x4;
		s6 = x2 * x3 + x1 * x4;
		s7 = x2 * x4 - x1 * x3;
		if (lsflg === 1) {
			ss1 = s1;
			ss2 = s2;
			ss3 = s3;
			ss4 = s4;
			ss5 = s5;
			ss6 = s6;
			ss7 = s7;
			sz1 = z1;
			sz2 = z2;
			sz3 = z3;
			sz11 = z11;
			sz12 = z12;
			sz13 = z13;
			sz21 = z21;
			sz22 = z22;
			sz23 = z23;
			sz31 = z31;
			sz32 = z32;
			sz33 = z33;
			zcosg = zcosgl;
			zsing = zsingl;
			zcosi = zcosil;
			zsini = zsinil;
			zcosh = zcoshl * cnodm + zsinhl * snodm;
			zsinh = snodm * zcoshl - cnodm * zsinhl;
			cc = c1l;
		}
	}
	var zmol = (4.7199672 + (.2299715 * day - gam)) % twoPi;
	var zmos = (6.2565837 + .017201977 * day) % twoPi;
	var se2 = 2 * ss1 * ss6;
	var se3 = 2 * ss1 * ss7;
	var si2 = 2 * ss2 * sz12;
	var si3 = 2 * ss2 * (sz13 - sz11);
	var sl2 = -2 * ss3 * sz2;
	var sl3 = -2 * ss3 * (sz3 - sz1);
	var sl4 = -2 * ss3 * (-21 - 9 * emsq) * zes;
	var sgh2 = 2 * ss4 * sz32;
	var sgh3 = 2 * ss4 * (sz33 - sz31);
	var sgh4 = -18 * ss4 * zes;
	var sh2 = -2 * ss2 * sz22;
	var sh3 = -2 * ss2 * (sz23 - sz21);
	var ee2 = 2 * s1 * s6;
	var e3 = 2 * s1 * s7;
	var xi2 = 2 * s2 * z12;
	var xi3 = 2 * s2 * (z13 - z11);
	var xl2 = -2 * s3 * z2;
	var xl3 = -2 * s3 * (z3 - z1);
	var xl4 = -2 * s3 * (-21 - 9 * emsq) * zel;
	var xgh2 = 2 * s4 * z32;
	var xgh3 = 2 * s4 * (z33 - z31);
	var xgh4 = -18 * s4 * zel;
	var xh2 = -2 * s2 * z22;
	var xh3 = -2 * s2 * (z23 - z21);
	return {
		snodm,
		cnodm,
		sinim,
		cosim,
		sinomm,
		cosomm,
		day,
		e3,
		ee2,
		em,
		emsq,
		gam,
		peo,
		pgho,
		pho,
		pinco,
		plo,
		rtemsq,
		se2,
		se3,
		sgh2,
		sgh3,
		sgh4,
		sh2,
		sh3,
		si2,
		si3,
		sl2,
		sl3,
		sl4,
		s1,
		s2,
		s3,
		s4,
		s5,
		s6,
		s7,
		ss1,
		ss2,
		ss3,
		ss4,
		ss5,
		ss6,
		ss7,
		sz1,
		sz2,
		sz3,
		sz11,
		sz12,
		sz13,
		sz21,
		sz22,
		sz23,
		sz31,
		sz32,
		sz33,
		xgh2,
		xgh3,
		xgh4,
		xh2,
		xh3,
		xi2,
		xi3,
		xl2,
		xl3,
		xl4,
		nm,
		z1,
		z2,
		z3,
		z11,
		z12,
		z13,
		z21,
		z22,
		z23,
		z31,
		z32,
		z33,
		zmol,
		zmos
	};
}
function dsinit(options) {
	var cosim = options.cosim, argpo = options.argpo, s1 = options.s1, s2 = options.s2, s3 = options.s3, s4 = options.s4, s5 = options.s5, sinim = options.sinim, ss1 = options.ss1, ss2 = options.ss2, ss3 = options.ss3, ss4 = options.ss4, ss5 = options.ss5, sz1 = options.sz1, sz3 = options.sz3, sz11 = options.sz11, sz13 = options.sz13, sz21 = options.sz21, sz23 = options.sz23, sz31 = options.sz31, sz33 = options.sz33, t = options.t, tc = options.tc, gsto = options.gsto, mo = options.mo, mdot = options.mdot, no = options.no, nodeo = options.nodeo, nodedot = options.nodedot, xpidot = options.xpidot, z1 = options.z1, z3 = options.z3, z11 = options.z11, z13 = options.z13, z21 = options.z21, z23 = options.z23, z31 = options.z31, z33 = options.z33, ecco = options.ecco, eccsq = options.eccsq;
	var emsq = options.emsq, em = options.em, argpm = options.argpm, inclm = options.inclm, mm = options.mm, nm = options.nm, nodem = options.nodem, irez = options.irez, atime = options.atime, d2201 = options.d2201, d2211 = options.d2211, d3210 = options.d3210, d3222 = options.d3222, d4410 = options.d4410, d4422 = options.d4422, d5220 = options.d5220, d5232 = options.d5232, d5421 = options.d5421, d5433 = options.d5433, dedt = options.dedt, didt = options.didt, dmdt = options.dmdt, dnodt = options.dnodt, domdt = options.domdt, del1 = options.del1, del2 = options.del2, del3 = options.del3, xfact = options.xfact, xlamo = options.xlamo, xli = options.xli, xni = options.xni;
	var f220;
	var f221;
	var f311;
	var f321;
	var f322;
	var f330;
	var f441;
	var f442;
	var f522;
	var f523;
	var f542;
	var f543;
	var g200;
	var g201;
	var g211;
	var g300;
	var g310;
	var g322;
	var g410;
	var g422;
	var g520;
	var g521;
	var g532;
	var g533;
	var sini2;
	var temp;
	var temp1;
	var xno2;
	var ainv2;
	var aonv;
	var cosisq;
	var eoc;
	var q22 = 17891679e-13;
	var q31 = 21460748e-13;
	var q33 = 2.2123015e-7;
	var root22 = 17891679e-13;
	var root44 = 7.3636953e-9;
	var root54 = 2.1765803e-9;
	var rptim = .0043752690880113;
	var root32 = 3.7393792e-7;
	var root52 = 1.1428639e-7;
	var znl = .00015835218;
	var zns = 119459e-10;
	irez = 0;
	if (nm < .0052359877 && nm > .0034906585) irez = 1;
	if (nm >= .00826 && nm <= .00924 && em >= .5) irez = 2;
	var ses = ss1 * zns * ss5;
	var sis = ss2 * zns * (sz11 + sz13);
	var sls = -zns * ss3 * (sz1 + sz3 - 14 - 6 * emsq);
	var sghs = ss4 * zns * (sz31 + sz33 - 6);
	var shs = -zns * ss2 * (sz21 + sz23);
	if (inclm < .052359877 || inclm > pi - .052359877) shs = 0;
	if (sinim !== 0) shs /= sinim;
	var sgs = sghs - cosim * shs;
	dedt = ses + s1 * znl * s5;
	didt = sis + s2 * znl * (z11 + z13);
	dmdt = sls - znl * s3 * (z1 + z3 - 14 - 6 * emsq);
	var sghl = s4 * znl * (z31 + z33 - 6);
	var shll = -znl * s2 * (z21 + z23);
	if (inclm < .052359877 || inclm > pi - .052359877) shll = 0;
	domdt = sgs + sghl;
	dnodt = shs;
	if (sinim !== 0) {
		domdt -= cosim / sinim * shll;
		dnodt += shll / sinim;
	}
	var dndt = 0;
	var theta = (gsto + tc * rptim) % twoPi;
	em += dedt * t;
	inclm += didt * t;
	argpm += domdt * t;
	nodem += dnodt * t;
	mm += dmdt * t;
	if (irez !== 0) {
		aonv = Math.pow(nm / xke, x2o3);
		if (irez === 2) {
			cosisq = cosim * cosim;
			var emo = em;
			em = ecco;
			var emsqo = emsq;
			emsq = eccsq;
			eoc = em * emsq;
			g201 = -.306 - (em - .64) * .44;
			if (em <= .65) {
				g211 = 3.616 - 13.247 * em + 16.29 * emsq;
				g310 = -19.302 + 117.39 * em - 228.419 * emsq + 156.591 * eoc;
				g322 = -18.9068 + 109.7927 * em - 214.6334 * emsq + 146.5816 * eoc;
				g410 = -41.122 + 242.694 * em - 471.094 * emsq + 313.953 * eoc;
				g422 = -146.407 + 841.88 * em - 1629.014 * emsq + 1083.435 * eoc;
				g520 = -532.114 + 3017.977 * em - 5740.032 * emsq + 3708.276 * eoc;
			} else {
				g211 = -72.099 + 331.819 * em - 508.738 * emsq + 266.724 * eoc;
				g310 = -346.844 + 1582.851 * em - 2415.925 * emsq + 1246.113 * eoc;
				g322 = -342.585 + 1554.908 * em - 2366.899 * emsq + 1215.972 * eoc;
				g410 = -1052.797 + 4758.686 * em - 7193.992 * emsq + 3651.957 * eoc;
				g422 = -3581.69 + 16178.11 * em - 24462.77 * emsq + 12422.52 * eoc;
				if (em > .715) g520 = -5149.66 + 29936.92 * em - 54087.36 * emsq + 31324.56 * eoc;
				else g520 = 1464.74 - 4664.75 * em + 3763.64 * emsq;
			}
			if (em < .7) {
				g533 = -919.2277 + 4988.61 * em - 9064.77 * emsq + 5542.21 * eoc;
				g521 = -822.71072 + 4568.6173 * em - 8491.4146 * emsq + 5337.524 * eoc;
				g532 = -853.666 + 4690.25 * em - 8624.77 * emsq + 5341.4 * eoc;
			} else {
				g533 = -37995.78 + 161616.52 * em - 229838.2 * emsq + 109377.94 * eoc;
				g521 = -51752.104 + 218913.95 * em - 309468.16 * emsq + 146349.42 * eoc;
				g532 = -40023.88 + 170470.89 * em - 242699.48 * emsq + 115605.82 * eoc;
			}
			sini2 = sinim * sinim;
			f220 = .75 * (1 + 2 * cosim + cosisq);
			f221 = 1.5 * sini2;
			f321 = 1.875 * sinim * (1 - 2 * cosim - 3 * cosisq);
			f322 = -1.875 * sinim * (1 + 2 * cosim - 3 * cosisq);
			f441 = 35 * sini2 * f220;
			f442 = 39.375 * sini2 * sini2;
			f522 = 9.84375 * sinim * (sini2 * (1 - 2 * cosim - 5 * cosisq) + .33333333 * (-2 + 4 * cosim + 6 * cosisq));
			f523 = sinim * (4.92187512 * sini2 * (-2 - 4 * cosim + 10 * cosisq) + 6.56250012 * (1 + 2 * cosim - 3 * cosisq));
			f542 = 29.53125 * sinim * (2 - 8 * cosim + cosisq * (-12 + 8 * cosim + 10 * cosisq));
			f543 = 29.53125 * sinim * (-2 - 8 * cosim + cosisq * (12 + 8 * cosim - 10 * cosisq));
			xno2 = nm * nm;
			ainv2 = aonv * aonv;
			temp1 = 3 * xno2 * ainv2;
			temp = temp1 * root22;
			d2201 = temp * f220 * g201;
			d2211 = temp * f221 * g211;
			temp1 *= aonv;
			temp = temp1 * root32;
			d3210 = temp * f321 * g310;
			d3222 = temp * f322 * g322;
			temp1 *= aonv;
			temp = 2 * temp1 * root44;
			d4410 = temp * f441 * g410;
			d4422 = temp * f442 * g422;
			temp1 *= aonv;
			temp = temp1 * root52;
			d5220 = temp * f522 * g520;
			d5232 = temp * f523 * g532;
			temp = 2 * temp1 * root54;
			d5421 = temp * f542 * g521;
			d5433 = temp * f543 * g533;
			xlamo = (mo + nodeo + nodeo - (theta + theta)) % twoPi;
			xfact = mdot + dmdt + 2 * (nodedot + dnodt - rptim) - no;
			em = emo;
			emsq = emsqo;
		}
		if (irez === 1) {
			g200 = 1 + emsq * (-2.5 + .8125 * emsq);
			g310 = 1 + 2 * emsq;
			g300 = 1 + emsq * (-6 + 6.60937 * emsq);
			f220 = .75 * (1 + cosim) * (1 + cosim);
			f311 = .9375 * sinim * sinim * (1 + 3 * cosim) - .75 * (1 + cosim);
			f330 = 1 + cosim;
			f330 *= 1.875 * f330 * f330;
			del1 = 3 * nm * nm * aonv * aonv;
			del2 = 2 * del1 * f220 * g200 * q22;
			del3 = 3 * del1 * f330 * g300 * q33 * aonv;
			del1 = del1 * f311 * g310 * q31 * aonv;
			xlamo = (mo + nodeo + argpo - theta) % twoPi;
			xfact = mdot + xpidot + dmdt + domdt + dnodt - (no + rptim);
		}
		xli = xlamo;
		xni = no;
		atime = 0;
		nm = no + dndt;
	}
	return {
		em,
		argpm,
		inclm,
		mm,
		nm,
		nodem,
		irez,
		atime,
		d2201,
		d2211,
		d3210,
		d3222,
		d4410,
		d4422,
		d5220,
		d5232,
		d5421,
		d5433,
		dedt,
		didt,
		dmdt,
		dndt,
		dnodt,
		domdt,
		del1,
		del2,
		del3,
		xfact,
		xlamo,
		xli,
		xni
	};
}
function gstimeInternal(jdut1) {
	var tut1 = (jdut1 - 2451545) / 36525;
	var temp = -62e-7 * tut1 * tut1 * tut1 + .093104 * tut1 * tut1 + 3164400184.812866 * tut1 + 67310.54841;
	temp = temp * deg2rad / 240 % twoPi;
	if (temp < 0) temp += twoPi;
	return temp;
}
function gstime() {
	if ((arguments.length <= 0 ? void 0 : arguments[0]) instanceof Date || arguments.length > 1) return gstimeInternal(jday.apply(void 0, arguments));
	return gstimeInternal.apply(void 0, arguments);
}
function initl(options) {
	var ecco = options.ecco, epoch = options.epoch, inclo = options.inclo, opsmode = options.opsmode;
	var no = options.no;
	var eccsq = ecco * ecco;
	var omeosq = 1 - eccsq;
	var rteosq = Math.sqrt(omeosq);
	var cosio = Math.cos(inclo);
	var cosio2 = cosio * cosio;
	var ak = Math.pow(xke / no, x2o3);
	var d1 = .75 * j2 * (3 * cosio2 - 1) / (rteosq * omeosq);
	var delPrime = d1 / (ak * ak);
	var adel = ak * (1 - delPrime * delPrime - delPrime * (1 / 3 + 134 * delPrime * delPrime / 81));
	delPrime = d1 / (adel * adel);
	no /= 1 + delPrime;
	var ao = Math.pow(xke / no, x2o3);
	var sinio = Math.sin(inclo);
	var po = ao * omeosq;
	var con42 = 1 - 5 * cosio2;
	var con41 = -con42 - cosio2 - cosio2;
	var ainv = 1 / ao;
	var posq = po * po;
	var rp = ao * (1 - ecco);
	var method = "n";
	var gsto;
	if (opsmode === "a") {
		var ts70 = epoch - 7305;
		var ds70 = Math.floor(ts70 + 1e-8);
		var tfrac = ts70 - ds70;
		var c1 = .017202791694070362;
		var thgr70 = 1.7321343856509375;
		var fk5r = 5075514194322695e-30;
		var c1p2p = c1 + twoPi;
		gsto = (thgr70 + c1 * ds70 + c1p2p * tfrac + ts70 * ts70 * fk5r) % twoPi;
		if (gsto < 0) gsto += twoPi;
	} else gsto = gstime(epoch + 2433281.5);
	return {
		no,
		method,
		ainv,
		ao,
		con41,
		con42,
		cosio,
		cosio2,
		eccsq,
		omeosq,
		posq,
		rp,
		rteosq,
		sinio,
		gsto
	};
}
function dspace(options) {
	var irez = options.irez, d2201 = options.d2201, d2211 = options.d2211, d3210 = options.d3210, d3222 = options.d3222, d4410 = options.d4410, d4422 = options.d4422, d5220 = options.d5220, d5232 = options.d5232, d5421 = options.d5421, d5433 = options.d5433, dedt = options.dedt, del1 = options.del1, del2 = options.del2, del3 = options.del3, didt = options.didt, dmdt = options.dmdt, dnodt = options.dnodt, domdt = options.domdt, argpo = options.argpo, argpdot = options.argpdot, t = options.t, tc = options.tc, gsto = options.gsto, xfact = options.xfact, xlamo = options.xlamo, no = options.no;
	var atime = options.atime, em = options.em, argpm = options.argpm, inclm = options.inclm, xli = options.xli, mm = options.mm, xni = options.xni, nodem = options.nodem, nm = options.nm;
	var fasx2 = .13130908;
	var fasx4 = 2.8843198;
	var fasx6 = .37448087;
	var g22 = 5.7686396;
	var g32 = .95240898;
	var g44 = 1.8014998;
	var g52 = 1.050833;
	var g54 = 4.4108898;
	var rptim = .0043752690880113;
	var stepp = 720;
	var stepn = -720;
	var step2 = 259200;
	var delt;
	var x2li;
	var x2omi;
	var xl;
	var xldot;
	var xnddt;
	var xndt;
	var xomi;
	var dndt = 0;
	var ft = 0;
	var theta = (gsto + tc * rptim) % twoPi;
	em += dedt * t;
	inclm += didt * t;
	argpm += domdt * t;
	nodem += dnodt * t;
	mm += dmdt * t;
	if (irez !== 0) {
		if (atime === 0 || t * atime <= 0 || Math.abs(t) < Math.abs(atime)) {
			atime = 0;
			xni = no;
			xli = xlamo;
		}
		if (t > 0) delt = stepp;
		else delt = stepn;
		var iretn = 381;
		while (iretn === 381) {
			if (irez !== 2) {
				xndt = del1 * Math.sin(xli - fasx2) + del2 * Math.sin(2 * (xli - fasx4)) + del3 * Math.sin(3 * (xli - fasx6));
				xldot = xni + xfact;
				xnddt = del1 * Math.cos(xli - fasx2) + 2 * del2 * Math.cos(2 * (xli - fasx4)) + 3 * del3 * Math.cos(3 * (xli - fasx6));
				xnddt *= xldot;
			} else {
				xomi = argpo + argpdot * atime;
				x2omi = xomi + xomi;
				x2li = xli + xli;
				xndt = d2201 * Math.sin(x2omi + xli - g22) + d2211 * Math.sin(xli - g22) + d3210 * Math.sin(xomi + xli - g32) + d3222 * Math.sin(-xomi + xli - g32) + d4410 * Math.sin(x2omi + x2li - g44) + d4422 * Math.sin(x2li - g44) + d5220 * Math.sin(xomi + xli - g52) + d5232 * Math.sin(-xomi + xli - g52) + d5421 * Math.sin(xomi + x2li - g54) + d5433 * Math.sin(-xomi + x2li - g54);
				xldot = xni + xfact;
				xnddt = d2201 * Math.cos(x2omi + xli - g22) + d2211 * Math.cos(xli - g22) + d3210 * Math.cos(xomi + xli - g32) + d3222 * Math.cos(-xomi + xli - g32) + d5220 * Math.cos(xomi + xli - g52) + d5232 * Math.cos(-xomi + xli - g52) + 2 * (d4410 * Math.cos(x2omi + x2li - g44) + d4422 * Math.cos(x2li - g44) + d5421 * Math.cos(xomi + x2li - g54) + d5433 * Math.cos(-xomi + x2li - g54));
				xnddt *= xldot;
			}
			if (Math.abs(t - atime) >= stepp) iretn = 381;
			else {
				ft = t - atime;
				iretn = 0;
			}
			if (iretn === 381) {
				xli += xldot * delt + xndt * step2;
				xni += xndt * delt + xnddt * step2;
				atime += delt;
			}
		}
		nm = xni + xndt * ft + xnddt * ft * ft * .5;
		xl = xli + xldot * ft + xndt * ft * ft * .5;
		if (irez !== 1) {
			mm = xl - 2 * nodem + 2 * theta;
			dndt = nm - no;
		} else {
			mm = xl - nodem - argpm + theta;
			dndt = nm - no;
		}
		nm = no + dndt;
	}
	return {
		atime,
		em,
		argpm,
		inclm,
		xli,
		mm,
		xni,
		nodem,
		dndt,
		nm
	};
}
function sgp4(satrec, tsince) {
	var coseo1;
	var sineo1;
	var cosip;
	var sinip;
	var cosisq;
	var delm;
	var delomg;
	var eo1;
	var argpm;
	var argpp;
	var su;
	var t3;
	var t4;
	var tc;
	var tem5;
	var temp;
	var tempa;
	var tempe;
	var templ;
	var inclm;
	var mm;
	var nm;
	var nodem;
	var xincp;
	var xlm;
	var mp;
	var nodep;
	var temp4 = 15e-13;
	satrec.t = tsince;
	satrec.error = 0;
	var xmdf = satrec.mo + satrec.mdot * satrec.t;
	var argpdf = satrec.argpo + satrec.argpdot * satrec.t;
	var nodedf = satrec.nodeo + satrec.nodedot * satrec.t;
	argpm = argpdf;
	mm = xmdf;
	var t2 = satrec.t * satrec.t;
	nodem = nodedf + satrec.nodecf * t2;
	tempa = 1 - satrec.cc1 * satrec.t;
	tempe = satrec.bstar * satrec.cc4 * satrec.t;
	templ = satrec.t2cof * t2;
	if (satrec.isimp !== 1) {
		delomg = satrec.omgcof * satrec.t;
		var delmtemp = 1 + satrec.eta * Math.cos(xmdf);
		delm = satrec.xmcof * (delmtemp * delmtemp * delmtemp - satrec.delmo);
		temp = delomg + delm;
		mm = xmdf + temp;
		argpm = argpdf - temp;
		t3 = t2 * satrec.t;
		t4 = t3 * satrec.t;
		tempa = tempa - satrec.d2 * t2 - satrec.d3 * t3 - satrec.d4 * t4;
		tempe += satrec.bstar * satrec.cc5 * (Math.sin(mm) - satrec.sinmao);
		templ = templ + satrec.t3cof * t3 + t4 * (satrec.t4cof + satrec.t * satrec.t5cof);
	}
	nm = satrec.no;
	var em = satrec.ecco;
	inclm = satrec.inclo;
	if (satrec.method === "d") {
		tc = satrec.t;
		var dspaceResult = dspace({
			irez: satrec.irez,
			d2201: satrec.d2201,
			d2211: satrec.d2211,
			d3210: satrec.d3210,
			d3222: satrec.d3222,
			d4410: satrec.d4410,
			d4422: satrec.d4422,
			d5220: satrec.d5220,
			d5232: satrec.d5232,
			d5421: satrec.d5421,
			d5433: satrec.d5433,
			dedt: satrec.dedt,
			del1: satrec.del1,
			del2: satrec.del2,
			del3: satrec.del3,
			didt: satrec.didt,
			dmdt: satrec.dmdt,
			dnodt: satrec.dnodt,
			domdt: satrec.domdt,
			argpo: satrec.argpo,
			argpdot: satrec.argpdot,
			t: satrec.t,
			tc,
			gsto: satrec.gsto,
			xfact: satrec.xfact,
			xlamo: satrec.xlamo,
			no: satrec.no,
			atime: satrec.atime,
			em,
			argpm,
			inclm,
			xli: satrec.xli,
			mm,
			xni: satrec.xni,
			nodem,
			nm
		});
		em = dspaceResult.em;
		argpm = dspaceResult.argpm;
		inclm = dspaceResult.inclm;
		mm = dspaceResult.mm;
		nodem = dspaceResult.nodem;
		nm = dspaceResult.nm;
	}
	if (nm <= 0) {
		satrec.error = 2;
		return [false, false];
	}
	var am = Math.pow(xke / nm, x2o3) * tempa * tempa;
	nm = xke / Math.pow(am, 1.5);
	em -= tempe;
	if (em >= 1 || em < -.001) {
		satrec.error = 1;
		return [false, false];
	}
	if (em < 1e-6) em = 1e-6;
	mm += satrec.no * templ;
	xlm = mm + argpm + nodem;
	nodem %= twoPi;
	argpm %= twoPi;
	xlm %= twoPi;
	mm = (xlm - argpm - nodem) % twoPi;
	var sinim = Math.sin(inclm);
	var cosim = Math.cos(inclm);
	var ep = em;
	xincp = inclm;
	argpp = argpm;
	nodep = nodem;
	mp = mm;
	sinip = sinim;
	cosip = cosim;
	if (satrec.method === "d") {
		var dpperResult = dpper(satrec, {
			inclo: satrec.inclo,
			init: "n",
			ep,
			inclp: xincp,
			nodep,
			argpp,
			mp,
			opsmode: satrec.operationmode
		});
		ep = dpperResult.ep;
		nodep = dpperResult.nodep;
		argpp = dpperResult.argpp;
		mp = dpperResult.mp;
		xincp = dpperResult.inclp;
		if (xincp < 0) {
			xincp = -xincp;
			nodep += pi;
			argpp -= pi;
		}
		if (ep < 0 || ep > 1) {
			satrec.error = 3;
			return [false, false];
		}
	}
	if (satrec.method === "d") {
		sinip = Math.sin(xincp);
		cosip = Math.cos(xincp);
		satrec.aycof = -.5 * j3oj2 * sinip;
		if (Math.abs(cosip + 1) > 15e-13) satrec.xlcof = -.25 * j3oj2 * sinip * (3 + 5 * cosip) / (1 + cosip);
		else satrec.xlcof = -.25 * j3oj2 * sinip * (3 + 5 * cosip) / temp4;
	}
	var axnl = ep * Math.cos(argpp);
	temp = 1 / (am * (1 - ep * ep));
	var aynl = ep * Math.sin(argpp) + temp * satrec.aycof;
	var u = (mp + argpp + nodep + temp * satrec.xlcof * axnl - nodep) % twoPi;
	eo1 = u;
	tem5 = 9999.9;
	var ktr = 1;
	while (Math.abs(tem5) >= 1e-12 && ktr <= 10) {
		sineo1 = Math.sin(eo1);
		coseo1 = Math.cos(eo1);
		tem5 = 1 - coseo1 * axnl - sineo1 * aynl;
		tem5 = (u - aynl * coseo1 + axnl * sineo1 - eo1) / tem5;
		if (Math.abs(tem5) >= .95) if (tem5 > 0) tem5 = .95;
		else tem5 = -.95;
		eo1 += tem5;
		ktr += 1;
	}
	var ecose = axnl * coseo1 + aynl * sineo1;
	var esine = axnl * sineo1 - aynl * coseo1;
	var el2 = axnl * axnl + aynl * aynl;
	var pl = am * (1 - el2);
	if (pl < 0) {
		satrec.error = 4;
		return [false, false];
	}
	var rl = am * (1 - ecose);
	var rdotl = Math.sqrt(am) * esine / rl;
	var rvdotl = Math.sqrt(pl) / rl;
	var betal = Math.sqrt(1 - el2);
	temp = esine / (1 + betal);
	var sinu = am / rl * (sineo1 - aynl - axnl * temp);
	var cosu = am / rl * (coseo1 - axnl + aynl * temp);
	su = Math.atan2(sinu, cosu);
	var sin2u = (cosu + cosu) * sinu;
	var cos2u = 1 - 2 * sinu * sinu;
	temp = 1 / pl;
	var temp1 = .5 * j2 * temp;
	var temp2 = temp1 * temp;
	if (satrec.method === "d") {
		cosisq = cosip * cosip;
		satrec.con41 = 3 * cosisq - 1;
		satrec.x1mth2 = 1 - cosisq;
		satrec.x7thm1 = 7 * cosisq - 1;
	}
	var mrt = rl * (1 - 1.5 * temp2 * betal * satrec.con41) + .5 * temp1 * satrec.x1mth2 * cos2u;
	if (mrt < 1) {
		satrec.error = 6;
		return {
			position: false,
			velocity: false
		};
	}
	su -= .25 * temp2 * satrec.x7thm1 * sin2u;
	var xnode = nodep + 1.5 * temp2 * cosip * sin2u;
	var xinc = xincp + 1.5 * temp2 * cosip * sinip * cos2u;
	var mvt = rdotl - nm * temp1 * satrec.x1mth2 * sin2u / xke;
	var rvdot = rvdotl + nm * temp1 * (satrec.x1mth2 * cos2u + 1.5 * satrec.con41) / xke;
	var sinsu = Math.sin(su);
	var cossu = Math.cos(su);
	var snod = Math.sin(xnode);
	var cnod = Math.cos(xnode);
	var sini = Math.sin(xinc);
	var cosi = Math.cos(xinc);
	var xmx = -snod * cosi;
	var xmy = cnod * cosi;
	var ux = xmx * sinsu + cnod * cossu;
	var uy = xmy * sinsu + snod * cossu;
	var uz = sini * sinsu;
	var vx = xmx * cossu - cnod * sinsu;
	var vy = xmy * cossu - snod * sinsu;
	var vz = sini * cossu;
	return {
		position: {
			x: mrt * ux * earthRadius,
			y: mrt * uy * earthRadius,
			z: mrt * uz * earthRadius
		},
		velocity: {
			x: (mvt * ux + rvdot * vx) * vkmpersec,
			y: (mvt * uy + rvdot * vy) * vkmpersec,
			z: (mvt * uz + rvdot * vz) * vkmpersec
		}
	};
}
function sgp4init(satrec, options) {
	var opsmode = options.opsmode, satn = options.satn, epoch = options.epoch, xbstar = options.xbstar, xecco = options.xecco, xargpo = options.xargpo, xinclo = options.xinclo, xmo = options.xmo, xno = options.xno, xnodeo = options.xnodeo;
	var cosim;
	var sinim;
	var cc1sq;
	var cc2;
	var cc3;
	var coef;
	var coef1;
	var cosio4;
	var em;
	var emsq;
	var eeta;
	var etasq;
	var argpm;
	var nodem;
	var inclm;
	var mm;
	var nm;
	var perige;
	var pinvsq;
	var psisq;
	var qzms24;
	var s1;
	var s2;
	var s3;
	var s4;
	var s5;
	var sfour;
	var ss1;
	var ss2;
	var ss3;
	var ss4;
	var ss5;
	var sz1;
	var sz3;
	var sz11;
	var sz13;
	var sz21;
	var sz23;
	var sz31;
	var sz33;
	var tc;
	var temp;
	var temp1;
	var temp2;
	var temp3;
	var tsi;
	var xpidot;
	var xhdot1;
	var z1;
	var z3;
	var z11;
	var z13;
	var z21;
	var z23;
	var z31;
	var z33;
	var temp4 = 15e-13;
	satrec.isimp = 0;
	satrec.method = "n";
	satrec.aycof = 0;
	satrec.con41 = 0;
	satrec.cc1 = 0;
	satrec.cc4 = 0;
	satrec.cc5 = 0;
	satrec.d2 = 0;
	satrec.d3 = 0;
	satrec.d4 = 0;
	satrec.delmo = 0;
	satrec.eta = 0;
	satrec.argpdot = 0;
	satrec.omgcof = 0;
	satrec.sinmao = 0;
	satrec.t = 0;
	satrec.t2cof = 0;
	satrec.t3cof = 0;
	satrec.t4cof = 0;
	satrec.t5cof = 0;
	satrec.x1mth2 = 0;
	satrec.x7thm1 = 0;
	satrec.mdot = 0;
	satrec.nodedot = 0;
	satrec.xlcof = 0;
	satrec.xmcof = 0;
	satrec.nodecf = 0;
	satrec.irez = 0;
	satrec.d2201 = 0;
	satrec.d2211 = 0;
	satrec.d3210 = 0;
	satrec.d3222 = 0;
	satrec.d4410 = 0;
	satrec.d4422 = 0;
	satrec.d5220 = 0;
	satrec.d5232 = 0;
	satrec.d5421 = 0;
	satrec.d5433 = 0;
	satrec.dedt = 0;
	satrec.del1 = 0;
	satrec.del2 = 0;
	satrec.del3 = 0;
	satrec.didt = 0;
	satrec.dmdt = 0;
	satrec.dnodt = 0;
	satrec.domdt = 0;
	satrec.e3 = 0;
	satrec.ee2 = 0;
	satrec.peo = 0;
	satrec.pgho = 0;
	satrec.pho = 0;
	satrec.pinco = 0;
	satrec.plo = 0;
	satrec.se2 = 0;
	satrec.se3 = 0;
	satrec.sgh2 = 0;
	satrec.sgh3 = 0;
	satrec.sgh4 = 0;
	satrec.sh2 = 0;
	satrec.sh3 = 0;
	satrec.si2 = 0;
	satrec.si3 = 0;
	satrec.sl2 = 0;
	satrec.sl3 = 0;
	satrec.sl4 = 0;
	satrec.gsto = 0;
	satrec.xfact = 0;
	satrec.xgh2 = 0;
	satrec.xgh3 = 0;
	satrec.xgh4 = 0;
	satrec.xh2 = 0;
	satrec.xh3 = 0;
	satrec.xi2 = 0;
	satrec.xi3 = 0;
	satrec.xl2 = 0;
	satrec.xl3 = 0;
	satrec.xl4 = 0;
	satrec.xlamo = 0;
	satrec.zmol = 0;
	satrec.zmos = 0;
	satrec.atime = 0;
	satrec.xli = 0;
	satrec.xni = 0;
	satrec.bstar = xbstar;
	satrec.ecco = xecco;
	satrec.argpo = xargpo;
	satrec.inclo = xinclo;
	satrec.mo = xmo;
	satrec.no = xno;
	satrec.nodeo = xnodeo;
	satrec.operationmode = opsmode;
	var ss = 78 / earthRadius + 1;
	var qzms2ttemp = 42 / earthRadius;
	var qzms2t = qzms2ttemp * qzms2ttemp * qzms2ttemp * qzms2ttemp;
	satrec.init = "y";
	satrec.t = 0;
	var initlResult = initl({
		satn,
		ecco: satrec.ecco,
		epoch,
		inclo: satrec.inclo,
		no: satrec.no,
		method: satrec.method,
		opsmode: satrec.operationmode
	});
	var ao = initlResult.ao, con42 = initlResult.con42, cosio = initlResult.cosio, cosio2 = initlResult.cosio2, eccsq = initlResult.eccsq, omeosq = initlResult.omeosq, posq = initlResult.posq, rp = initlResult.rp, rteosq = initlResult.rteosq, sinio = initlResult.sinio;
	satrec.no = initlResult.no;
	satrec.con41 = initlResult.con41;
	satrec.gsto = initlResult.gsto;
	satrec.a = Math.pow(satrec.no * tumin, -2 / 3);
	satrec.alta = satrec.a * (1 + satrec.ecco) - 1;
	satrec.altp = satrec.a * (1 - satrec.ecco) - 1;
	satrec.error = 0;
	if (omeosq >= 0 || satrec.no >= 0) {
		satrec.isimp = 0;
		if (rp < 220 / earthRadius + 1) satrec.isimp = 1;
		sfour = ss;
		qzms24 = qzms2t;
		perige = (rp - 1) * earthRadius;
		if (perige < 156) {
			sfour = perige - 78;
			if (perige < 98) sfour = 20;
			var qzms24temp = (120 - sfour) / earthRadius;
			qzms24 = qzms24temp * qzms24temp * qzms24temp * qzms24temp;
			sfour = sfour / earthRadius + 1;
		}
		pinvsq = 1 / posq;
		tsi = 1 / (ao - sfour);
		satrec.eta = ao * satrec.ecco * tsi;
		etasq = satrec.eta * satrec.eta;
		eeta = satrec.ecco * satrec.eta;
		psisq = Math.abs(1 - etasq);
		coef = qzms24 * Math.pow(tsi, 4);
		coef1 = coef / Math.pow(psisq, 3.5);
		cc2 = coef1 * satrec.no * (ao * (1 + 1.5 * etasq + eeta * (4 + etasq)) + .375 * j2 * tsi / psisq * satrec.con41 * (8 + 3 * etasq * (8 + etasq)));
		satrec.cc1 = satrec.bstar * cc2;
		cc3 = 0;
		if (satrec.ecco > 1e-4) cc3 = -2 * coef * tsi * j3oj2 * satrec.no * sinio / satrec.ecco;
		satrec.x1mth2 = 1 - cosio2;
		satrec.cc4 = 2 * satrec.no * coef1 * ao * omeosq * (satrec.eta * (2 + .5 * etasq) + satrec.ecco * (.5 + 2 * etasq) - j2 * tsi / (ao * psisq) * (-3 * satrec.con41 * (1 - 2 * eeta + etasq * (1.5 - .5 * eeta)) + .75 * satrec.x1mth2 * (2 * etasq - eeta * (1 + etasq)) * Math.cos(2 * satrec.argpo)));
		satrec.cc5 = 2 * coef1 * ao * omeosq * (1 + 2.75 * (etasq + eeta) + eeta * etasq);
		cosio4 = cosio2 * cosio2;
		temp1 = 1.5 * j2 * pinvsq * satrec.no;
		temp2 = .5 * temp1 * j2 * pinvsq;
		temp3 = -.46875 * j4 * pinvsq * pinvsq * satrec.no;
		satrec.mdot = satrec.no + .5 * temp1 * rteosq * satrec.con41 + .0625 * temp2 * rteosq * (13 - 78 * cosio2 + 137 * cosio4);
		satrec.argpdot = -.5 * temp1 * con42 + .0625 * temp2 * (7 - 114 * cosio2 + 395 * cosio4) + temp3 * (3 - 36 * cosio2 + 49 * cosio4);
		xhdot1 = -temp1 * cosio;
		satrec.nodedot = xhdot1 + (.5 * temp2 * (4 - 19 * cosio2) + 2 * temp3 * (3 - 7 * cosio2)) * cosio;
		xpidot = satrec.argpdot + satrec.nodedot;
		satrec.omgcof = satrec.bstar * cc3 * Math.cos(satrec.argpo);
		satrec.xmcof = 0;
		if (satrec.ecco > 1e-4) satrec.xmcof = -x2o3 * coef * satrec.bstar / eeta;
		satrec.nodecf = 3.5 * omeosq * xhdot1 * satrec.cc1;
		satrec.t2cof = 1.5 * satrec.cc1;
		if (Math.abs(cosio + 1) > 15e-13) satrec.xlcof = -.25 * j3oj2 * sinio * (3 + 5 * cosio) / (1 + cosio);
		else satrec.xlcof = -.25 * j3oj2 * sinio * (3 + 5 * cosio) / temp4;
		satrec.aycof = -.5 * j3oj2 * sinio;
		var delmotemp = 1 + satrec.eta * Math.cos(satrec.mo);
		satrec.delmo = delmotemp * delmotemp * delmotemp;
		satrec.sinmao = Math.sin(satrec.mo);
		satrec.x7thm1 = 7 * cosio2 - 1;
		if (2 * pi / satrec.no >= 225) {
			satrec.method = "d";
			satrec.isimp = 1;
			tc = 0;
			inclm = satrec.inclo;
			var dscomResult = dscom({
				epoch,
				ep: satrec.ecco,
				argpp: satrec.argpo,
				tc,
				inclp: satrec.inclo,
				nodep: satrec.nodeo,
				np: satrec.no,
				e3: satrec.e3,
				ee2: satrec.ee2,
				peo: satrec.peo,
				pgho: satrec.pgho,
				pho: satrec.pho,
				pinco: satrec.pinco,
				plo: satrec.plo,
				se2: satrec.se2,
				se3: satrec.se3,
				sgh2: satrec.sgh2,
				sgh3: satrec.sgh3,
				sgh4: satrec.sgh4,
				sh2: satrec.sh2,
				sh3: satrec.sh3,
				si2: satrec.si2,
				si3: satrec.si3,
				sl2: satrec.sl2,
				sl3: satrec.sl3,
				sl4: satrec.sl4,
				xgh2: satrec.xgh2,
				xgh3: satrec.xgh3,
				xgh4: satrec.xgh4,
				xh2: satrec.xh2,
				xh3: satrec.xh3,
				xi2: satrec.xi2,
				xi3: satrec.xi3,
				xl2: satrec.xl2,
				xl3: satrec.xl3,
				xl4: satrec.xl4,
				zmol: satrec.zmol,
				zmos: satrec.zmos
			});
			satrec.e3 = dscomResult.e3;
			satrec.ee2 = dscomResult.ee2;
			satrec.peo = dscomResult.peo;
			satrec.pgho = dscomResult.pgho;
			satrec.pho = dscomResult.pho;
			satrec.pinco = dscomResult.pinco;
			satrec.plo = dscomResult.plo;
			satrec.se2 = dscomResult.se2;
			satrec.se3 = dscomResult.se3;
			satrec.sgh2 = dscomResult.sgh2;
			satrec.sgh3 = dscomResult.sgh3;
			satrec.sgh4 = dscomResult.sgh4;
			satrec.sh2 = dscomResult.sh2;
			satrec.sh3 = dscomResult.sh3;
			satrec.si2 = dscomResult.si2;
			satrec.si3 = dscomResult.si3;
			satrec.sl2 = dscomResult.sl2;
			satrec.sl3 = dscomResult.sl3;
			satrec.sl4 = dscomResult.sl4;
			sinim = dscomResult.sinim;
			cosim = dscomResult.cosim;
			em = dscomResult.em;
			emsq = dscomResult.emsq;
			s1 = dscomResult.s1;
			s2 = dscomResult.s2;
			s3 = dscomResult.s3;
			s4 = dscomResult.s4;
			s5 = dscomResult.s5;
			ss1 = dscomResult.ss1;
			ss2 = dscomResult.ss2;
			ss3 = dscomResult.ss3;
			ss4 = dscomResult.ss4;
			ss5 = dscomResult.ss5;
			sz1 = dscomResult.sz1;
			sz3 = dscomResult.sz3;
			sz11 = dscomResult.sz11;
			sz13 = dscomResult.sz13;
			sz21 = dscomResult.sz21;
			sz23 = dscomResult.sz23;
			sz31 = dscomResult.sz31;
			sz33 = dscomResult.sz33;
			satrec.xgh2 = dscomResult.xgh2;
			satrec.xgh3 = dscomResult.xgh3;
			satrec.xgh4 = dscomResult.xgh4;
			satrec.xh2 = dscomResult.xh2;
			satrec.xh3 = dscomResult.xh3;
			satrec.xi2 = dscomResult.xi2;
			satrec.xi3 = dscomResult.xi3;
			satrec.xl2 = dscomResult.xl2;
			satrec.xl3 = dscomResult.xl3;
			satrec.xl4 = dscomResult.xl4;
			satrec.zmol = dscomResult.zmol;
			satrec.zmos = dscomResult.zmos;
			nm = dscomResult.nm;
			z1 = dscomResult.z1;
			z3 = dscomResult.z3;
			z11 = dscomResult.z11;
			z13 = dscomResult.z13;
			z21 = dscomResult.z21;
			z23 = dscomResult.z23;
			z31 = dscomResult.z31;
			z33 = dscomResult.z33;
			var dpperResult = dpper(satrec, {
				inclo: inclm,
				init: satrec.init,
				ep: satrec.ecco,
				inclp: satrec.inclo,
				nodep: satrec.nodeo,
				argpp: satrec.argpo,
				mp: satrec.mo,
				opsmode: satrec.operationmode
			});
			satrec.ecco = dpperResult.ep;
			satrec.inclo = dpperResult.inclp;
			satrec.nodeo = dpperResult.nodep;
			satrec.argpo = dpperResult.argpp;
			satrec.mo = dpperResult.mp;
			argpm = 0;
			nodem = 0;
			mm = 0;
			var dsinitResult = dsinit({
				cosim,
				emsq,
				argpo: satrec.argpo,
				s1,
				s2,
				s3,
				s4,
				s5,
				sinim,
				ss1,
				ss2,
				ss3,
				ss4,
				ss5,
				sz1,
				sz3,
				sz11,
				sz13,
				sz21,
				sz23,
				sz31,
				sz33,
				t: satrec.t,
				tc,
				gsto: satrec.gsto,
				mo: satrec.mo,
				mdot: satrec.mdot,
				no: satrec.no,
				nodeo: satrec.nodeo,
				nodedot: satrec.nodedot,
				xpidot,
				z1,
				z3,
				z11,
				z13,
				z21,
				z23,
				z31,
				z33,
				ecco: satrec.ecco,
				eccsq,
				em,
				argpm,
				inclm,
				mm,
				nm,
				nodem,
				irez: satrec.irez,
				atime: satrec.atime,
				d2201: satrec.d2201,
				d2211: satrec.d2211,
				d3210: satrec.d3210,
				d3222: satrec.d3222,
				d4410: satrec.d4410,
				d4422: satrec.d4422,
				d5220: satrec.d5220,
				d5232: satrec.d5232,
				d5421: satrec.d5421,
				d5433: satrec.d5433,
				dedt: satrec.dedt,
				didt: satrec.didt,
				dmdt: satrec.dmdt,
				dnodt: satrec.dnodt,
				domdt: satrec.domdt,
				del1: satrec.del1,
				del2: satrec.del2,
				del3: satrec.del3,
				xfact: satrec.xfact,
				xlamo: satrec.xlamo,
				xli: satrec.xli,
				xni: satrec.xni
			});
			satrec.irez = dsinitResult.irez;
			satrec.atime = dsinitResult.atime;
			satrec.d2201 = dsinitResult.d2201;
			satrec.d2211 = dsinitResult.d2211;
			satrec.d3210 = dsinitResult.d3210;
			satrec.d3222 = dsinitResult.d3222;
			satrec.d4410 = dsinitResult.d4410;
			satrec.d4422 = dsinitResult.d4422;
			satrec.d5220 = dsinitResult.d5220;
			satrec.d5232 = dsinitResult.d5232;
			satrec.d5421 = dsinitResult.d5421;
			satrec.d5433 = dsinitResult.d5433;
			satrec.dedt = dsinitResult.dedt;
			satrec.didt = dsinitResult.didt;
			satrec.dmdt = dsinitResult.dmdt;
			satrec.dnodt = dsinitResult.dnodt;
			satrec.domdt = dsinitResult.domdt;
			satrec.del1 = dsinitResult.del1;
			satrec.del2 = dsinitResult.del2;
			satrec.del3 = dsinitResult.del3;
			satrec.xfact = dsinitResult.xfact;
			satrec.xlamo = dsinitResult.xlamo;
			satrec.xli = dsinitResult.xli;
			satrec.xni = dsinitResult.xni;
		}
		if (satrec.isimp !== 1) {
			cc1sq = satrec.cc1 * satrec.cc1;
			satrec.d2 = 4 * ao * tsi * cc1sq;
			temp = satrec.d2 * tsi * satrec.cc1 / 3;
			satrec.d3 = (17 * ao + sfour) * temp;
			satrec.d4 = .5 * temp * ao * tsi * (221 * ao + 31 * sfour) * satrec.cc1;
			satrec.t3cof = satrec.d2 + 2 * cc1sq;
			satrec.t4cof = .25 * (3 * satrec.d3 + satrec.cc1 * (12 * satrec.d2 + 10 * cc1sq));
			satrec.t5cof = .2 * (3 * satrec.d4 + 12 * satrec.cc1 * satrec.d3 + 6 * satrec.d2 * satrec.d2 + 15 * cc1sq * (2 * satrec.d2 + cc1sq));
		}
	}
	sgp4(satrec, 0);
	satrec.init = "n";
}
/**
* Return a Satellite imported from two lines of TLE data.
*
* Provide the two TLE lines as strings `longstr1` and `longstr2`,
* and select which standard set of gravitational constants you want
* by providing `gravity_constants`:
*
* `sgp4.propagation.wgs72` - Standard WGS 72 model
* `sgp4.propagation.wgs84` - More recent WGS 84 model
* `sgp4.propagation.wgs72old` - Legacy support for old SGP4 behavior
*
* Normally, computations are made using letious recent improvements
* to the algorithm.  If you want to turn some of these off and go
* back into "afspc" mode, then set `afspc_mode` to `True`.
*/
function twoline2satrec(longstr1, longstr2) {
	var opsmode = "i";
	var xpdotp = 1440 / (2 * pi);
	var year = 0;
	var satrec = {};
	satrec.error = 0;
	satrec.satnum = longstr1.substring(2, 7);
	satrec.epochyr = parseInt(longstr1.substring(18, 20), 10);
	satrec.epochdays = parseFloat(longstr1.substring(20, 32));
	satrec.ndot = parseFloat(longstr1.substring(33, 43));
	satrec.nddot = parseFloat(".".concat(parseInt(longstr1.substring(44, 50), 10), "E").concat(longstr1.substring(50, 52)));
	satrec.bstar = parseFloat("".concat(longstr1.substring(53, 54), ".").concat(parseInt(longstr1.substring(54, 59), 10), "E").concat(longstr1.substring(59, 61)));
	satrec.inclo = parseFloat(longstr2.substring(8, 16));
	satrec.nodeo = parseFloat(longstr2.substring(17, 25));
	satrec.ecco = parseFloat(".".concat(longstr2.substring(26, 33)));
	satrec.argpo = parseFloat(longstr2.substring(34, 42));
	satrec.mo = parseFloat(longstr2.substring(43, 51));
	satrec.no = parseFloat(longstr2.substring(52, 63));
	satrec.no /= xpdotp;
	satrec.inclo *= deg2rad;
	satrec.nodeo *= deg2rad;
	satrec.argpo *= deg2rad;
	satrec.mo *= deg2rad;
	if (satrec.epochyr < 57) year = satrec.epochyr + 2e3;
	else year = satrec.epochyr + 1900;
	var mdhmsResult = days2mdhms(year, satrec.epochdays);
	var mon = mdhmsResult.mon, day = mdhmsResult.day, hr = mdhmsResult.hr, minute = mdhmsResult.minute, sec = mdhmsResult.sec;
	satrec.jdsatepoch = jday(year, mon, day, hr, minute, sec);
	sgp4init(satrec, {
		opsmode,
		satn: satrec.satnum,
		epoch: satrec.jdsatepoch - 2433281.5,
		xbstar: satrec.bstar,
		xecco: satrec.ecco,
		xargpo: satrec.argpo,
		xinclo: satrec.inclo,
		xmo: satrec.mo,
		xno: satrec.no,
		xnodeo: satrec.nodeo
	});
	return satrec;
}
function geodeticToEcf(geodetic) {
	var longitude = geodetic.longitude, latitude = geodetic.latitude, height = geodetic.height;
	var a = 6378.137;
	var f = (a - 6356.7523142) / a;
	var e2 = 2 * f - f * f;
	var normal = a / Math.sqrt(1 - e2 * (Math.sin(latitude) * Math.sin(latitude)));
	return {
		x: (normal + height) * Math.cos(latitude) * Math.cos(longitude),
		y: (normal + height) * Math.cos(latitude) * Math.sin(longitude),
		z: (normal * (1 - e2) + height) * Math.sin(latitude)
	};
}
function ecfToEci(ecf, gmst) {
	return {
		x: ecf.x * Math.cos(gmst) - ecf.y * Math.sin(gmst),
		y: ecf.x * Math.sin(gmst) + ecf.y * Math.cos(gmst),
		z: ecf.z
	};
}
//#endregion
//#region src/lib/live.js
var liveData = writable(null);
var LIVE = {
	cmes: [],
	neos: [],
	wx: null,
	sats: [],
	regions: [],
	extra: null,
	epic: null,
	launches: [],
	onUpdate: null
};
var AU_KM = 1496e5;
function nasaKey() {
	try {
		return localStorage.getItem("nasa_api_key") || "DEMO_KEY";
	} catch (e) {
		return "DEMO_KEY";
	}
}
var LIVE_META = {
	"swpc-wx": {
		name: "NOAA SWPC · space weather (Kp, wind, X-rays)",
		host: "services.swpc.noaa.gov"
	},
	"nasa-donki": {
		name: "NASA DONKI · coronal mass ejections",
		host: "api.nasa.gov"
	},
	"nasa-neo": {
		name: "NASA NEO · asteroid flybys this week",
		host: "api.nasa.gov"
	},
	"nasa-neo-kd": {
		name: "NASA NEO · orbit lookups",
		host: "api.nasa.gov"
	},
	"swpc-regions": {
		name: "NOAA SWPC · sunspot regions",
		host: "services.swpc.noaa.gov"
	},
	"celestrak": {
		name: "CelesTrak · satellite elements",
		host: "celestrak.org"
	},
	"live-extra": {
		name: "Live extra · GW events, fireballs (6-hourly workflow)",
		host: "raw.githubusercontent.com"
	},
	"nasa-epic": {
		name: "NASA EPIC · latest Earth photo (index)",
		host: "api.nasa.gov"
	},
	"launchlib": {
		name: "Launch Library 2 · upcoming launches",
		host: "ll.thespacedevs.com"
	}
};
function j(url, id) {
	return (id ? tfetch(id, {
		group: "live",
		...LIVE_META[id]
	}, url) : fetch(url)).then((r) => r.ok ? r.json() : null).catch(() => null);
}
function day(off) {
	return new Date(Date.now() + off * 864e5).toISOString().slice(0, 10);
}
function publish() {
	count("nasa-donki", LIVE.cmes.length);
	count("nasa-neo", LIVE.neos.length);
	count("swpc-regions", LIVE.regions.length);
	count("celestrak", LIVE.sats.length);
	if (LIVE.launches) count("launchlib", LIVE.launches.length);
	if (LIVE.extra) count("live-extra", (LIVE.extra.gw || []).length + (LIVE.extra.fireballs || []).length);
	liveData.set({
		wx: LIVE.wx,
		cmes: LIVE.cmes,
		neos: LIVE.neos,
		regions: LIVE.regions,
		sats: LIVE.sats.length,
		extra: LIVE.extra,
		launches: LIVE.launches,
		ts: Date.now()
	});
	if (LIVE.onUpdate) LIVE.onUpdate();
}
async function fetchWeather() {
	const [kp, sp, mag, xr] = await tracked("swpc-wx", {
		group: "live",
		...LIVE_META["swpc-wx"]
	}, async () => {
		const rs = await Promise.all([
			j("https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json"),
			j("https://services.swpc.noaa.gov/products/summary/solar-wind-speed.json"),
			j("https://services.swpc.noaa.gov/products/summary/solar-wind-mag-field.json"),
			j("https://services.swpc.noaa.gov/json/goes/primary/xrays-6-hour.json")
		]);
		const bad = rs.filter((x) => !x).length;
		if (bad === rs.length) throw new Error("no answer from any feed");
		rs.__stat = {
			n: rs.length - bad,
			state: bad ? "warn" : "ok",
			msg: bad ? bad + " of 4 feeds missing" : ""
		};
		return rs;
	}).catch(() => [
		null,
		null,
		null,
		null
	]);
	const wx = {};
	if (kp && kp.length) {
		const l = kp[kp.length - 1];
		wx.kp = +l.Kp;
		wx.kpTime = l.time_tag;
	}
	if (sp && sp[0]) wx.wind = +sp[0].proton_speed;
	if (mag && mag[0]) {
		wx.bt = +mag[0].bt;
		wx.bz = +mag[0].bz_gsm;
	}
	if (xr && xr.length) {
		const lng = xr.filter((e) => e.energy === "0.1-0.8nm");
		const f = lng.length ? lng[lng.length - 1].flux : null;
		if (f != null) {
			const cls = f >= 1e-4 ? ["X", 1e-4] : f >= 1e-5 ? ["M", 1e-5] : f >= 1e-6 ? ["C", 1e-6] : f >= 1e-7 ? ["B", 1e-7] : ["A", 1e-8];
			wx.xray = cls[0] + (f / cls[1]).toFixed(1);
			wx.xflux = f;
		}
	}
	if (Object.keys(wx).length) LIVE.wx = wx;
}
async function fetchCmes() {
	const d = await j(`https://api.nasa.gov/DONKI/CMEAnalysis?startDate=${day(-5)}&endDate=${day(0)}&mostAccurateOnly=true&api_key=${nasaKey()}`, "nasa-donki");
	if (!d || !Array.isArray(d)) return;
	LIVE.cmes = d.filter((c) => c.time21_5 && c.speed && c.latitude != null && c.longitude != null).map((c) => {
		const t = Date.parse(c.time21_5);
		const earthDir = Math.abs(c.longitude) <= (c.halfAngle || 30);
		return {
			t,
			lat: +c.latitude,
			lon: +c.longitude,
			half: +(c.halfAngle || 30),
			v: +c.speed,
			type: c.type || "?",
			earthDir,
			eta: earthDir ? t + AU_KM * .9 / c.speed * 1e3 : null
		};
	}).sort((a, b) => b.t - a.t);
}
function cachedKd(id) {
	try {
		const s = localStorage.getItem("ku_neokd_" + id);
		return s ? JSON.parse(s) : null;
	} catch (e) {
		return null;
	}
}
function storeKd(id, kd) {
	try {
		localStorage.setItem("ku_neokd_" + id, JSON.stringify(kd));
	} catch (e) {}
}
async function lookupKd(id) {
	const hit = cachedKd(id);
	if (hit) return hit;
	const d = await j(`https://api.nasa.gov/neo/rest/v1/neo/${id}?api_key=${nasaKey()}`, "nasa-neo-kd");
	const o = d && d.orbital_data;
	if (!o || !+o.semi_major_axis || !+o.mean_motion) return null;
	const kd = {
		a: +o.semi_major_axis,
		e: +o.eccentricity,
		i: +o.inclination,
		om: +o.ascending_node_longitude,
		w: +o.perihelion_argument,
		ma: +o.mean_anomaly,
		n: +o.mean_motion,
		ep: +o.epoch_osculation
	};
	storeKd(id, kd);
	return kd;
}
async function fetchNeos() {
	const d = await j(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${day(0)}&end_date=${day(7)}&api_key=${nasaKey()}`, "nasa-neo");
	if (!d || !d.near_earth_objects) return;
	const out = [];
	for (const date of Object.keys(d.near_earth_objects)) for (const o of d.near_earth_objects[date]) {
		const ca = (o.close_approach_data || []).find((c) => c.orbiting_body === "Earth") || (o.close_approach_data || [])[0];
		if (!ca) continue;
		const dia = o.estimated_diameter && o.estimated_diameter.meters;
		const ld = +ca.miss_distance.lunar, vk = +ca.relative_velocity.kilometers_per_second;
		const pha = !!o.is_potentially_hazardous_asteroid, sentry = !!o.is_sentry_object;
		const ldStr = ld < 10 ? ld.toFixed(1) : Math.round(ld);
		out.push({
			id: o.id,
			n: (o.name || "").replace(/[()]/g, ""),
			t: ca.epoch_date_close_approach,
			ld,
			km: +ca.miss_distance.kilometers,
			vkms: vk,
			dia: dia ? (dia.estimated_diameter_min + dia.estimated_diameter_max) / 2 : null,
			pha,
			sentry,
			rk: dia ? (dia.estimated_diameter_min + dia.estimated_diameter_max) / 4e3 : .05,
			kind: "Near-Earth object",
			c: [
				255,
				178,
				96
			],
			note: `closest approach ${new Date(ca.epoch_date_close_approach).toLocaleString("en-US", {
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit"
			})} · ${ldStr} LD · ${vk.toFixed(1)} km/s` + (pha ? " · potentially hazardous (PHA)" : "") + (sentry ? " · Sentry risk list" : "")
		});
	}
	out.sort((a, b) => a.t - b.t);
	const old = new Map(LIVE.neos.map((o) => [o.id, o]));
	for (const o of out) {
		const p = old.get(o.id);
		if (p && p.kd) o.kd = p.kd;
	}
	LIVE.neos = out;
	publish();
	const want = out.slice().sort((a, b) => a.ld - b.ld).filter((o) => o.ld <= 30).slice(0, 10);
	for (const o of want) if (!o.kd) o.kd = await lookupKd(o.id);
}
function tleCache() {
	try {
		return JSON.parse(localStorage.getItem("ku_tle") || "null");
	} catch (e) {
		return null;
	}
}
var SAT_GROUPS = [
	"visual",
	"stations",
	"starlink",
	"oneweb",
	"gnss",
	"geo",
	"cosmos-2251-debris",
	"iridium-33-debris",
	"fengyun-1c-debris"
];
async function fetchSats() {
	let c = tleCache();
	if (!c || typeof c.groups !== "object" || !c.groups) c = { groups: {} };
	let changed = false;
	for (const g of SAT_GROUPS) {
		const e = c.groups[g];
		if (e && Date.now() - e.ts < 6 * 36e5) continue;
		const t = await tfetch("celestrak", {
			group: "live",
			...LIVE_META.celestrak
		}, `https://celestrak.org/NORAD/elements/gp.php?GROUP=${g}&FORMAT=tle`).then((r) => r.ok ? r.text() : null).catch(() => null);
		if (t && t[0] !== "<") {
			c.groups[g] = {
				ts: Date.now(),
				txt: t
			};
			changed = true;
		}
	}
	if (changed) try {
		localStorage.setItem("ku_tle", JSON.stringify(c));
	} catch (e) {}
	const txt = SAT_GROUPS.map((g) => c.groups[g] ? c.groups[g].txt : "").join("\n");
	if (!txt.trim()) return;
	const seen = /* @__PURE__ */ new Set(), sats = [];
	{
		const lines = txt.split(/\r?\n/);
		for (let i = 0; i + 2 < lines.length + 1; i++) {
			if (!lines[i + 1] || lines[i + 1][0] !== "1" || !lines[i + 2] || lines[i + 2][0] !== "2") continue;
			try {
				const rec = twoline2satrec(lines[i + 1], lines[i + 2]);
				if (seen.has(rec.satnum)) {
					i += 2;
					continue;
				}
				seen.add(rec.satnum);
				const n = lines[i].trim();
				sats.push({
					n,
					rec,
					iss: /ISS \(ZARYA\)/.test(n),
					hst: /^HST$/.test(n),
					css: /CSS \(TIANHE\)/.test(n),
					sl: /^STARLINK/i.test(n),
					ow: /^ONEWEB/i.test(n),
					deb: / DEB/.test(n)
				});
				i += 2;
			} catch (e) {}
		}
	}
	if (sats.length) LIVE.sats = sats;
}
var OBL = 23.43928 * Math.PI / 180;
var cOB = Math.cos(OBL);
var sOB = Math.sin(OBL);
function satEcl(s, jd) {
	if (Math.abs(jd - s.rec.jdsatepoch) > 12) return null;
	const pv = sgp4(s.rec, (jd - s.rec.jdsatepoch) * 1440);
	if (!pv || !pv.position) return null;
	const p = pv.position;
	return [
		p.x,
		p.y * cOB + p.z * sOB,
		p.z * cOB - p.y * sOB
	];
}
function groundEcl(latDeg, lonDeg, ms) {
	const gmst = gstime(new Date(ms));
	const p = ecfToEci(geodeticToEcf({
		latitude: latDeg * Math.PI / 180,
		longitude: lonDeg * Math.PI / 180,
		height: 0
	}), gmst);
	const e = [
		p.x,
		p.y * cOB + p.z * sOB,
		p.z * cOB - p.y * sOB
	];
	const l = Math.hypot(e[0], e[1], e[2]) || 1;
	return [
		e[0] / l,
		e[1] / l,
		e[2] / l
	];
}
async function fetchRegions() {
	const d = await j("https://services.swpc.noaa.gov/json/solar_regions.json", "swpc-regions");
	if (!d || !d.length) return;
	let latest = "";
	for (const r of d) if (r.observed_date > latest) latest = r.observed_date;
	LIVE.regions = d.filter((r) => r.observed_date === latest && r.region != null && r.latitude != null).map((r) => ({
		no: r.region,
		lat: +r.latitude,
		lon: -+r.longitude,
		area: +r.area || 0,
		cls: r.spot_class || "",
		mag: r.mag_class || "",
		spots: +r.number_spots || 0,
		cp: +r.c_flare_probability || 0,
		mp: +r.m_flare_probability || 0,
		xp: +r.x_flare_probability || 0,
		cx: +r.c_xray_events || 0,
		mx: +r.m_xray_events || 0,
		xx: +r.x_xray_events || 0,
		date: latest
	})).filter((r) => Math.abs(r.lon) <= 92);
}
async function fetchExtra() {
	let d = await j("data/live-extra.json", "live-extra");
	if (!d) d = await j("https://raw.githubusercontent.com/blanpa/known-universe/live-data/live-extra.json", "live-extra");
	if (d && (d.gw || d.fireballs)) LIVE.extra = d;
}
async function fetchEpic() {
	const d = await j(`https://api.nasa.gov/EPIC/api/natural?api_key=${nasaKey()}`, "nasa-epic");
	if (!d || !d.length) return;
	const it = d[d.length - 1];
	LIVE.epic = {
		url: `https://api.nasa.gov/EPIC/archive/natural/${it.date.slice(0, 10).replace(/-/g, "/")}/jpg/${it.image}.jpg?api_key=${nasaKey()}`,
		date: it.date
	};
}
async function fetchLaunches() {
	const d = await j("https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=5&mode=list", "launchlib");
	if (d && d.results) LIVE.launches = d.results.map((l) => ({
		n: l.name,
		t: Date.parse(l.net),
		status: l.status ? l.status.abbrev || "" : ""
	}));
}
var SHOWERS = [
	{
		n: "Quadrantids",
		from: [12, 28],
		to: [1, 12],
		peak: "Jan 3",
		ra: 230,
		dec: 49,
		zhr: 110
	},
	{
		n: "Lyrids",
		from: [4, 14],
		to: [4, 30],
		peak: "Apr 22",
		ra: 271,
		dec: 34,
		zhr: 18
	},
	{
		n: "η-Aquariids",
		from: [4, 19],
		to: [5, 28],
		peak: "May 6",
		ra: 338,
		dec: -1,
		zhr: 50
	},
	{
		n: "α-Capricornids",
		from: [7, 3],
		to: [8, 15],
		peak: "Jul 30",
		ra: 307,
		dec: -10,
		zhr: 5
	},
	{
		n: "S δ-Aquariids",
		from: [7, 12],
		to: [8, 23],
		peak: "Jul 30",
		ra: 340,
		dec: -16,
		zhr: 25
	},
	{
		n: "Perseids",
		from: [7, 17],
		to: [8, 24],
		peak: "Aug 13",
		ra: 48,
		dec: 58,
		zhr: 100
	},
	{
		n: "Orionids",
		from: [10, 2],
		to: [11, 7],
		peak: "Oct 21",
		ra: 95,
		dec: 16,
		zhr: 20
	},
	{
		n: "Draconids",
		from: [10, 6],
		to: [10, 10],
		peak: "Oct 8",
		ra: 262,
		dec: 54,
		zhr: 10
	},
	{
		n: "S Taurids",
		from: [9, 10],
		to: [11, 20],
		peak: "Oct 10",
		ra: 32,
		dec: 9,
		zhr: 5
	},
	{
		n: "N Taurids",
		from: [10, 20],
		to: [12, 10],
		peak: "Nov 12",
		ra: 58,
		dec: 22,
		zhr: 5
	},
	{
		n: "Leonids",
		from: [11, 6],
		to: [11, 30],
		peak: "Nov 17",
		ra: 152,
		dec: 22,
		zhr: 15
	},
	{
		n: "Geminids",
		from: [12, 4],
		to: [12, 17],
		peak: "Dec 14",
		ra: 112,
		dec: 33,
		zhr: 150
	},
	{
		n: "Ursids",
		from: [12, 17],
		to: [12, 26],
		peak: "Dec 22",
		ra: 217,
		dec: 76,
		zhr: 10
	}
];
function activeShowers(ms) {
	const d = new Date(ms), key = (d.getMonth() + 1) * 100 + d.getDate();
	return SHOWERS.filter((s) => {
		const a = s.from[0] * 100 + s.from[1], b = s.to[0] * 100 + s.to[1];
		return a <= b ? key >= a && key <= b : key >= a || key <= b;
	});
}
var started = false;
var _runAll = null;
function refreshLive() {
	if (_runAll) _runAll();
}
function startLive() {
	if (started) return;
	started = true;
	const wx = () => fetchWeather().then(publish, () => {});
	const ev = () => Promise.allSettled([
		fetchCmes(),
		fetchNeos(),
		fetchRegions()
	]).then(publish);
	const midi = () => Promise.allSettled([fetchExtra(), fetchLaunches()]).then(publish);
	const slow = () => Promise.allSettled([fetchSats(), fetchEpic()]).then(publish);
	wx();
	ev();
	midi();
	slow();
	_runAll = () => {
		wx();
		ev();
		midi();
		slow();
	};
	setInterval(wx, 300 * 1e3);
	setInterval(ev, 1800 * 1e3);
	setInterval(midi, 7200 * 1e3);
	setInterval(slow, 360 * 60 * 1e3);
}
//#endregion
//#region src/components/LivePanel.svelte
var root$4 = /* @__PURE__ */ from_html(`<button type="button" class="label lbl-btn"><span class="lb-t"><!>Space weather · live</span> <span><!></span></button>`);
var root_1$4 = /* @__PURE__ */ from_html(`<div class="label"><span class="lb-t"><!>Space weather · live</span></div>`);
var root_2$2 = /* @__PURE__ */ from_html(`<div class="lv-wx"><span class="lv-chip">Kp <b> </b></span> <span class="lv-chip">wind <b> </b> km/s</span> <span class="lv-chip">Bz <b> </b> nT</span> <span class="lv-chip">X-ray <b> </b></span></div>`);
var root_3$1 = /* @__PURE__ */ from_html(`<div class="lv-sub"><b style="color:#ffab6e">Earth-directed CME in flight</b></div>`);
var root_4 = /* @__PURE__ */ from_html(`<div class="lv-sub"> </div>`);
var root_5 = /* @__PURE__ */ from_html(`<b style="color:#ffab6e">· Earth-directed!</b>`);
var root_6 = /* @__PURE__ */ from_html(`<div class="lv-row"><span class="lv-dot"></span> <span class="lv-nm"> </span> <span class="lv-val"> </span></div>`);
var root_7 = /* @__PURE__ */ from_html(`<div class="lv-sub"> <!></div> <!>`, 1);
var root_8 = /* @__PURE__ */ from_html(`<div class="lv-sub">no CME currently in flight</div>`);
var root_9 = /* @__PURE__ */ from_html(`<button type="button"><span class="lv-dot"></span> <span class="lv-nm"> </span> <span class="lv-val"> </span></button>`);
var root_10 = /* @__PURE__ */ from_html(`<button type="button" class="lv-more"> </button>`);
var root_11 = /* @__PURE__ */ from_html(`<div class="label" style="margin-top:10px"><span class="lb-t"><!>Earth flybys · next 7 days</span></div> <!> <!>`, 1);
var root_12 = /* @__PURE__ */ from_html(`<div class="lv-row"><span class="lv-dot" style="background:#9fb8ff"></span> <span class="lv-nm"> </span> <span class="lv-val"> </span></div>`);
var root_13 = /* @__PURE__ */ from_html(`<div class="label" style="margin-top:10px"><span class="lb-t"><!>Gravitational waves</span></div> <!>`, 1);
var root_14 = /* @__PURE__ */ from_html(`<div class="lv-row"><span class="lv-dot" style="background:#c9d6f2"></span> <span class="lv-nm lv-trunc"> </span> <span class="lv-val"> </span></div>`);
var root_15 = /* @__PURE__ */ from_html(`<div class="label" style="margin-top:10px"><span class="lb-t"><!>Next launches</span></div> <!>`, 1);
var root_16 = /* @__PURE__ */ from_html(`<div class="lv-sub" style="margin-top:8px"> </div>`);
var root_17 = /* @__PURE__ */ from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <div class="lv-src">SWPC · DONKI · NeoWs · CelesTrak · GraceDB · CNEOS · LL2</div>`, 1);
var root_18 = /* @__PURE__ */ from_html(`<div><!> <!> <!> <!></div>`);
function LivePanel($$anchor, $$props) {
	push($$props, true);
	const $liveData = () => store_get(liveData, "$liveData", $$stores);
	const [$$stores, $$cleanup] = setup_stores();
	let onpick = prop($$props, "onpick", 3, null), collapsible = prop($$props, "collapsible", 3, true);
	let showAll = /* @__PURE__ */ state(false);
	let open = /* @__PURE__ */ state(proxy(untrack(() => !collapsible())));
	const kpCol = (k) => k >= 6 ? "#ff7676" : k >= 4 ? "#ffd27a" : "#7fe08a";
	const xrCol = (x) => !x ? "var(--dim)" : x[0] === "X" ? "#ff7676" : x[0] === "M" ? "#ffab6e" : x[0] === "C" ? "#ffd27a" : "#9fb0d0";
	const dt = (t) => new Date(t).toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	});
	const dts = (t) => new Date(t).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric"
	});
	const ldf = (ld) => ld < 10 ? ld.toFixed(1) : Math.round(ld);
	const dia = (d) => d == null ? "?" : d >= 1e3 ? (d / 1e3).toFixed(1) + " km" : Math.round(d) + " m";
	const farYr = (f) => {
		if (!f) return "";
		const y = 1 / (f * 86400 * 365.25);
		return y >= 1e6 ? "1/" + (y / 1e6).toFixed(0) + " Myr" : y >= 1 ? "1/" + Math.round(y) + " yr" : "1/" + Math.max(1, Math.round(y * 365)) + " d";
	};
	const inRel = (t) => {
		const h = (t - Date.now()) / 36e5;
		return h < 0 ? "now" : h < 1 ? Math.round(h * 60) + " min" : h < 48 ? Math.round(h) + " h" : Math.round(h / 24) + " d";
	};
	let active = /* @__PURE__ */ user_derived(() => $liveData() ? $liveData().cmes.filter((c) => {
		const r = .1 + c.v * (Date.now() - c.t) / 1e3 / 1496e5;
		return r > 0 && r < 2.6;
	}) : []);
	let neos = /* @__PURE__ */ user_derived(() => $liveData() ? get(showAll) ? $liveData().neos : $liveData().neos.slice(0, 5) : []);
	let maxM = /* @__PURE__ */ user_derived(() => $liveData()?.regions?.length ? Math.max(...$liveData().regions.map((r) => r.mp)) : 0);
	let gw = /* @__PURE__ */ user_derived(() => $liveData()?.extra?.gw ?? []);
	let fbs = /* @__PURE__ */ user_derived(() => ($liveData()?.extra?.fireballs ?? []).filter((f) => Date.now() - f.t < 30 * 864e5));
	let biggestFb = /* @__PURE__ */ user_derived(() => get(fbs).length ? Math.max(...get(fbs).map((f) => f.kt)) : 0);
	let showers = /* @__PURE__ */ user_derived(() => $liveData() ? activeShowers(Date.now()) : []);
	let stats = /* @__PURE__ */ user_derived(() => $liveData() && api.liveStats ? api.liveStats() : null);
	function go(id) {
		if (api.liveNeoFocus) api.liveNeoFocus(id);
		if (onpick()) onpick()();
	}
	var fragment = comment();
	var node = first_child(fragment);
	var consequent_15 = ($$anchor) => {
		var div = root_18();
		let classes;
		var node_1 = child(div);
		var consequent = ($$anchor) => {
			var button = root$4();
			var span = child(button);
			Icon(child(span), {
				name: "live",
				size: 14
			});
			next();
			reset(span);
			var span_1 = sibling(span, 2);
			let classes_1;
			Icon(child(span_1), {
				name: "chevron",
				size: 13
			});
			reset(span_1);
			reset(button);
			template_effect(() => {
				set_attribute(button, "aria-expanded", get(open));
				classes_1 = set_class(span_1, 1, "caret", null, classes_1, { open: get(open) });
			});
			delegated("click", button, () => set(open, !get(open)));
			append($$anchor, button);
		};
		var alternate = ($$anchor) => {
			var div_1 = root_1$4();
			var span_2 = child(div_1);
			Icon(child(span_2), {
				name: "live",
				size: 14
			});
			next();
			reset(span_2);
			reset(div_1);
			append($$anchor, div_1);
		};
		if_block(node_1, ($$render) => {
			if (collapsible()) $$render(consequent);
			else $$render(alternate, -1);
		});
		var node_5 = sibling(node_1, 2);
		var consequent_1 = ($$anchor) => {
			var div_2 = root_2$2();
			var span_3 = child(div_2);
			var b = sibling(child(span_3));
			var text = child(b, true);
			reset(b);
			reset(span_3);
			var span_4 = sibling(span_3, 2);
			var b_1 = sibling(child(span_4));
			var text_1 = child(b_1, true);
			reset(b_1);
			next();
			reset(span_4);
			var span_5 = sibling(span_4, 2);
			var b_2 = sibling(child(span_5));
			var text_2 = child(b_2, true);
			reset(b_2);
			next();
			reset(span_5);
			var span_6 = sibling(span_5, 2);
			var b_3 = sibling(child(span_6));
			var text_3 = child(b_3, true);
			reset(b_3);
			reset(span_6);
			reset(div_2);
			template_effect(($0, $1, $2, $3) => {
				set_style(b, `color:${$0 ?? ""}`);
				set_text(text, $1);
				set_text(text_1, $2);
				set_style(b_2, `color:${($liveData().wx.bz ?? 0) <= -5 ? "#ff7676" : "var(--ink)"}`);
				set_text(text_2, $liveData().wx.bz ?? "–");
				set_style(b_3, `color:${$3 ?? ""}`);
				set_text(text_3, $liveData().wx.xray ?? "–");
			}, [
				() => kpCol($liveData().wx.kp ?? 0),
				() => $liveData().wx.kp?.toFixed(1) ?? "–",
				() => $liveData().wx.wind ? Math.round($liveData().wx.wind) : "–",
				() => xrCol($liveData().wx.xray)
			]);
			append($$anchor, div_2);
		};
		if_block(node_5, ($$render) => {
			if ($liveData().wx) $$render(consequent_1);
		});
		var node_6 = sibling(node_5, 2);
		var consequent_2 = ($$anchor) => {
			append($$anchor, root_3$1());
		};
		var d_1 = /* @__PURE__ */ user_derived(() => !get(open) && get(active).some((c) => c.earthDir));
		if_block(node_6, ($$render) => {
			if (get(d_1)) $$render(consequent_2);
		});
		var node_7 = sibling(node_6, 2);
		var consequent_14 = ($$anchor) => {
			var fragment_1 = root_17();
			var node_8 = first_child(fragment_1);
			var consequent_3 = ($$anchor) => {
				var div_4 = root_4();
				var text_4 = child(div_4);
				reset(div_4);
				template_effect(() => set_text(text_4, `${$liveData().regions.length ?? ""} active regions on the Sun${get(maxM) ? ` · M-flare odds ${get(maxM)}%` : ""}`));
				append($$anchor, div_4);
			};
			if_block(node_8, ($$render) => {
				if ($liveData().regions?.length) $$render(consequent_3);
			});
			var node_9 = sibling(node_8, 2);
			var consequent_5 = ($$anchor) => {
				var fragment_2 = root_7();
				var div_5 = first_child(fragment_2);
				var text_5 = child(div_5);
				var node_10 = sibling(text_5);
				var consequent_4 = ($$anchor) => {
					append($$anchor, root_5());
				};
				var d_2 = /* @__PURE__ */ user_derived(() => get(active).some((c) => c.earthDir));
				if_block(node_10, ($$render) => {
					if (get(d_2)) $$render(consequent_4);
				});
				reset(div_5);
				each(sibling(div_5, 2), 17, () => get(active).slice(0, 3), (c) => c.t + "" + c.lon, ($$anchor, c) => {
					var div_6 = root_6();
					var span_7 = child(div_6);
					var span_8 = sibling(span_7, 2);
					var text_6 = child(span_8, true);
					reset(span_8);
					var span_9 = sibling(span_8, 2);
					var text_7 = child(span_9);
					reset(span_9);
					reset(div_6);
					template_effect(($0, $1, $2) => {
						set_style(span_7, `background:${get(c).v >= 800 ? "#ff6050" : get(c).v >= 500 ? "#ff9650" : "#ffc86e"}`);
						set_text(text_6, $0);
						set_text(text_7, `${$1 ?? ""} km/s${$2 ?? ""}`);
					}, [
						() => dt(get(c).t),
						() => Math.round(get(c).v),
						() => get(c).earthDir ? ` · Earth ~ ${dt(get(c).eta)}` : ""
					]);
					append($$anchor, div_6);
				});
				template_effect(() => set_text(text_5, `${get(active).length ?? ""} CME${get(active).length > 1 ? "s" : ""} in flight `));
				append($$anchor, fragment_2);
			};
			var alternate_1 = ($$anchor) => {
				append($$anchor, root_8());
			};
			if_block(node_9, ($$render) => {
				if (get(active).length) $$render(consequent_5);
				else $$render(alternate_1, -1);
			});
			var node_12 = sibling(node_9, 2);
			var consequent_7 = ($$anchor) => {
				var fragment_3 = root_11();
				var div_8 = first_child(fragment_3);
				var span_10 = child(div_8);
				Icon(child(span_10), {
					name: "comet",
					size: 13
				});
				next();
				reset(span_10);
				reset(div_8);
				var node_14 = sibling(div_8, 2);
				each(node_14, 17, () => get(neos), (o) => o.id, ($$anchor, o) => {
					var button_1 = root_9();
					let classes_2;
					var span_11 = child(button_1);
					var span_12 = sibling(span_11, 2);
					var text_8 = child(span_12);
					reset(span_12);
					var span_13 = sibling(span_12, 2);
					var text_9 = child(span_13);
					reset(span_13);
					reset(button_1);
					template_effect(($0, $1, $2) => {
						classes_2 = set_class(button_1, 1, "lv-row lv-click", null, classes_2, { "lv-off": !get(o).kd });
						set_style(span_11, `background:${get(o).pha || get(o).sentry ? "#ff6e5a" : "#ffb260"}`);
						set_text(text_8, `${get(o).n ?? ""}${get(o).pha ? " ⚠" : ""}`);
						set_text(text_9, `${$0 ?? ""} · ${$1 ?? ""} LD · ${$2 ?? ""}`);
					}, [
						() => dt(get(o).t),
						() => ldf(get(o).ld),
						() => dia(get(o).dia)
					]);
					delegated("click", button_1, () => go(get(o).id));
					append($$anchor, button_1);
				});
				var node_15 = sibling(node_14, 2);
				var consequent_6 = ($$anchor) => {
					var button_2 = root_10();
					var text_10 = child(button_2, true);
					reset(button_2);
					template_effect(() => set_text(text_10, get(showAll) ? "– fewer" : `+ ${$liveData().neos.length - 5} more`));
					delegated("click", button_2, () => set(showAll, !get(showAll)));
					append($$anchor, button_2);
				};
				if_block(node_15, ($$render) => {
					if ($liveData().neos.length > 5) $$render(consequent_6);
				});
				append($$anchor, fragment_3);
			};
			if_block(node_12, ($$render) => {
				if ($liveData().neos.length) $$render(consequent_7);
			});
			var node_16 = sibling(node_12, 2);
			var consequent_8 = ($$anchor) => {
				var div_9 = root_4();
				var text_11 = child(div_9);
				reset(div_9);
				template_effect(() => set_text(text_11, `${get(fbs).length ?? ""} fireballs in 30 d · biggest ${get(biggestFb) ?? ""} kt — marked on Earth`));
				append($$anchor, div_9);
			};
			if_block(node_16, ($$render) => {
				if (get(fbs).length) $$render(consequent_8);
			});
			var node_17 = sibling(node_16, 2);
			var consequent_9 = ($$anchor) => {
				var fragment_4 = root_13();
				var div_10 = first_child(fragment_4);
				var span_14 = child(div_10);
				Icon(child(span_14), {
					name: "live",
					size: 13
				});
				next();
				reset(span_14);
				reset(div_10);
				each(sibling(div_10, 2), 17, () => get(gw).slice(0, 3), (g) => g.id, ($$anchor, g) => {
					var div_11 = root_12();
					var span_15 = sibling(child(div_11), 2);
					var text_12 = child(span_15, true);
					reset(span_15);
					var span_16 = sibling(span_15, 2);
					var text_13 = child(span_16);
					reset(span_16);
					reset(div_11);
					template_effect(($0, $1) => {
						set_text(text_12, get(g).id);
						set_text(text_13, `${$0 ?? ""} · FAR ${$1 ?? ""}`);
					}, [() => dts(get(g).t), () => farYr(get(g).far)]);
					append($$anchor, div_11);
				});
				append($$anchor, fragment_4);
			};
			if_block(node_17, ($$render) => {
				if (get(gw).length) $$render(consequent_9);
			});
			var node_20 = sibling(node_17, 2);
			var consequent_10 = ($$anchor) => {
				var fragment_5 = root_15();
				var div_12 = first_child(fragment_5);
				var span_17 = child(div_12);
				Icon(child(span_17), {
					name: "probe",
					size: 13
				});
				next();
				reset(span_17);
				reset(div_12);
				each(sibling(div_12, 2), 1, () => $liveData().launches.slice(0, 3), (l) => l.n + l.t, ($$anchor, l) => {
					var div_13 = root_14();
					var span_18 = sibling(child(div_13), 2);
					var text_14 = child(span_18, true);
					reset(span_18);
					var span_19 = sibling(span_18, 2);
					var text_15 = child(span_19);
					reset(span_19);
					reset(div_13);
					template_effect(($0) => {
						set_text(text_14, get(l).n);
						set_text(text_15, `in ${$0 ?? ""}`);
					}, [() => inRel(get(l).t)]);
					append($$anchor, div_13);
				});
				append($$anchor, fragment_5);
			};
			if_block(node_20, ($$render) => {
				if ($liveData().launches?.length) $$render(consequent_10);
			});
			var node_23 = sibling(node_20, 2);
			var consequent_11 = ($$anchor) => {
				var div_14 = root_16();
				var text_16 = child(div_14);
				reset(div_14);
				template_effect(($0) => set_text(text_16, `active showers: ${$0 ?? ""}`), [() => get(showers).map((s) => `${s.n} (ZHR ${s.zhr})`).join(" · ")]);
				append($$anchor, div_14);
			};
			if_block(node_23, ($$render) => {
				if (get(showers).length) $$render(consequent_11);
			});
			var node_24 = sibling(node_23, 2);
			var consequent_12 = ($$anchor) => {
				var div_15 = root_4();
				var text_17 = child(div_15);
				reset(div_15);
				template_effect(() => set_text(text_17, `${$liveData().sats ?? ""} satellites tracked — zoom to Earth`));
				append($$anchor, div_15);
			};
			if_block(node_24, ($$render) => {
				if ($liveData().sats) $$render(consequent_12);
			});
			var node_25 = sibling(node_24, 2);
			var consequent_13 = ($$anchor) => {
				var div_16 = root_4();
				var text_18 = child(div_16);
				reset(div_16);
				template_effect(() => set_text(text_18, `${get(stats).exoY ?? ""} systems discovered in ${get(stats).year ?? ""}`));
				append($$anchor, div_16);
			};
			if_block(node_25, ($$render) => {
				if (get(stats)?.exoY) $$render(consequent_13);
			});
			next(2);
			append($$anchor, fragment_1);
		};
		if_block(node_7, ($$render) => {
			if (get(open)) $$render(consequent_14);
		});
		reset(div);
		template_effect(() => classes = set_class(div, 1, "panel live-panel", null, classes, { mini: !get(open) }));
		append($$anchor, div);
	};
	if_block(node, ($$render) => {
		if ($liveData()) $$render(consequent_15);
	});
	append($$anchor, fragment);
	pop();
	$$cleanup();
}
delegate(["click"]);
//#endregion
//#region src/components/PoiBar.svelte
var root$3 = /* @__PURE__ */ from_html(`<button type="button" class="poi"><!> </button>`);
var root_1$3 = /* @__PURE__ */ from_html(`<div role="group" aria-label="Jump to"></div>`);
function PoiBar($$anchor, $$props) {
	push($$props, true);
	let variant = prop($$props, "variant", 3, ""), onpick = prop($$props, "onpick", 3, () => {});
	const POIS = [
		["sun", "Sun"],
		["globe", "Earth"],
		["planet", "Mars"],
		["planet", "Jupiter"],
		["ringed", "Saturn"],
		["ice", "Pluto"],
		["probe", "Voyager 1"],
		["comet", "3I/ATLAS"],
		["star", "Proxima Centauri"],
		["system", "TRAPPIST-1"],
		["blackhole", "Sgr A*"],
		["galaxy", "Andromeda"]
	];
	function go(n) {
		if (api.doSearch) api.doSearch(n);
		onpick()(n);
	}
	var div = root_1$3();
	each(div, 21, () => POIS, ([ic, n]) => n, ($$anchor, $$item) => {
		var $$array = /* @__PURE__ */ user_derived(() => to_array(get($$item), 2));
		let ic = () => get($$array)[0];
		let n = () => get($$array)[1];
		var button = root$3();
		var node = child(button);
		Icon(node, {
			get name() {
				return ic();
			},
			size: 13
		});
		var text = sibling(node, 1, true);
		reset(button);
		template_effect(() => {
			set_attribute(button, "title", `Fly to ${n() ?? ""}`);
			set_text(text, n());
		});
		delegated("click", button, () => go(n()));
		append($$anchor, button);
	});
	reset(div);
	action(div, ($$node, $$action_arg) => reserve?.($$node, $$action_arg), () => "poi-" + (variant() || "sheet"));
	template_effect(() => set_class(div, 1, `poibar ${variant() ? "poibar-" + variant() : ""}`));
	append($$anchor, div);
	pop();
}
delegate(["click"]);
//#endregion
//#region src/components/MobileNav.svelte
var root$2 = /* @__PURE__ */ from_html(`<!> <!> <div class="ms-actions"><button type="button"><!> </button> <button type="button"><!>Measure</button> <button type="button"><!>Share view</button> <button type="button"><!>Start view</button></div> <!> <!>`, 1);
var root_1$2 = /* @__PURE__ */ from_html(`<div id="mobsheet" role="dialog" aria-modal="false"><div class="ms-head"><button type="button" class="ms-grab" aria-label="Sheet size — drag, or press to cycle"><span></span></button> <div class="ms-headrow"><span class="ms-title"><!> <small></small></span> <span class="ms-btns"><button type="button" class="ms-x" aria-label="Expand or collapse"><!></button> <button type="button" class="ms-x" aria-label="Close"><!></button></span></div></div> <div class="ms-body"><!></div></div>`);
var root_2$1 = /* @__PURE__ */ from_html(`<nav id="mobbar" aria-label="Main"><button type="button"><!>Search</button> <button type="button"><!>Layers</button> <button type="button"><!>Sky</button> <button type="button"><!>Time</button> <button type="button" class="mb"><!>Tour</button></nav> <div id="mobhead" class="panel"><span class="mh-app"><span class="dot" aria-hidden="true"></span>Known Universe</span> <span class="mh-band"> </span> <span class="mh-where mono"> </span></div> <!>`, 1);
function MobileNav($$anchor, $$props) {
	push($$props, true);
	const $timeBar = () => store_get(timeBar, "$timeBar", $$stores);
	const $camera = () => store_get(camera, "$camera", $$stores);
	const [$$stores, $$cleanup] = setup_stores();
	const SNAP = {
		peek: .34,
		half: .6,
		full: .92
	};
	const ORDER = [
		"peek",
		"half",
		"full"
	];
	const SHEET_H = .92;
	let mobPanel = /* @__PURE__ */ state(null);
	let snap = /* @__PURE__ */ state("half");
	let dragPx = /* @__PURE__ */ state(0);
	let dragging = /* @__PURE__ */ state(false);
	let start = 0;
	let vh = 800;
	let moved = false;
	let visible = /* @__PURE__ */ user_derived(() => SNAP[get(snap)]);
	let shiftPx = /* @__PURE__ */ user_derived(() => (SHEET_H - get(visible)) * vh + get(dragPx));
	function openSheet(w) {
		if (get(mobPanel) === w) {
			set(mobPanel, null);
			return;
		}
		set(mobPanel, w, true);
		set(snap, "half");
		set(dragPx, 0);
	}
	function toggleTime() {
		timeBar.update((v) => !v);
		set(mobPanel, null);
	}
	function act(fn) {
		fn();
		set(mobPanel, null);
	}
	function down(e) {
		vh = window.innerHeight;
		set(dragging, true);
		moved = false;
		start = e.clientY;
		set(dragPx, 0);
		e.currentTarget.setPointerCapture && e.currentTarget.setPointerCapture(e.pointerId);
	}
	function move(e) {
		if (!get(dragging)) return;
		const dy = e.clientY - start;
		if (Math.abs(dy) > 4) moved = true;
		const max = (SHEET_H - SNAP.peek) * vh;
		set(dragPx, Math.max(-(SHEET_H - SNAP.full) * vh - (SHEET_H - get(visible)) * vh, Math.min(dy, max * .55 + (max - (SHEET_H - get(visible)) * vh))), true);
		set(dragPx, Math.max(get(dragPx), (SHEET_H - SNAP.full) * vh - (SHEET_H - get(visible)) * vh), true);
	}
	function up() {
		if (!get(dragging)) return;
		set(dragging, false);
		const nowVis = get(visible) - get(dragPx) / vh;
		if (nowVis < SNAP.peek * .62) {
			set(mobPanel, null);
			set(dragPx, 0);
			return;
		}
		let best = ORDER[0], bd = Infinity;
		for (const k of ORDER) {
			const d = Math.abs(SNAP[k] - nowVis);
			if (d < bd) {
				bd = d;
				best = k;
			}
		}
		set(snap, best, true);
		set(dragPx, 0);
	}
	function cycle() {
		set(snap, ORDER[(ORDER.indexOf(get(snap)) + 1) % ORDER.length], true);
	}
	function grabClick() {
		if (!moved) cycle();
	}
	function grabKey(e) {
		const i = ORDER.indexOf(get(snap));
		if (e.key === "ArrowUp") {
			e.preventDefault();
			set(snap, ORDER[Math.min(ORDER.length - 1, i + 1)], true);
		}
		if (e.key === "ArrowDown") {
			e.preventDefault();
			set(snap, ORDER[Math.max(0, i - 1)], true);
		}
	}
	var fragment = root_2$1();
	var nav = first_child(fragment);
	var button = child(nav);
	let classes;
	Icon(child(button), {
		name: "search",
		size: 20
	});
	next();
	reset(button);
	var button_1 = sibling(button, 2);
	let classes_1;
	Icon(child(button_1), {
		name: "layers",
		size: 20
	});
	next();
	reset(button_1);
	var button_2 = sibling(button_1, 2);
	let classes_2;
	Icon(child(button_2), {
		name: "scope",
		size: 20
	});
	next();
	reset(button_2);
	var button_3 = sibling(button_2, 2);
	let classes_3;
	Icon(child(button_3), {
		name: "clock",
		size: 20
	});
	next();
	reset(button_3);
	var button_4 = sibling(button_3, 2);
	Icon(child(button_4), {
		name: "compass",
		size: 20
	});
	next();
	reset(button_4);
	reset(nav);
	action(nav, ($$node, $$action_arg) => reserve?.($$node, $$action_arg), () => "mobbar");
	var div = sibling(nav, 2);
	var span = sibling(child(div), 2);
	var text = child(span, true);
	reset(span);
	var span_1 = sibling(span, 2);
	var text_1 = child(span_1, true);
	reset(span_1);
	reset(div);
	action(div, ($$node, $$action_arg) => reserve?.($$node, $$action_arg), () => "mobhead");
	var node_5 = sibling(div, 2);
	var consequent_2 = ($$anchor) => {
		var div_1 = root_1$2();
		let classes_4;
		var div_2 = child(div_1);
		var button_5 = child(div_2);
		var div_3 = sibling(button_5, 2);
		var span_2 = child(div_3);
		var node_6 = child(span_2);
		{
			let $0 = /* @__PURE__ */ user_derived(() => get(mobPanel) === "layers" ? "layers" : get(mobPanel) === "sky" ? "scope" : "search");
			Icon(node_6, {
				get name() {
					return get($0);
				},
				size: 15
			});
		}
		var text_2 = sibling(node_6);
		var small = sibling(text_2);
		small.textContent = `· 20261025-1115`;
		reset(span_2);
		var span_3 = sibling(span_2, 2);
		var button_6 = child(span_3);
		Icon(child(button_6), {
			name: "chevron",
			size: 15
		});
		reset(button_6);
		var button_7 = sibling(button_6, 2);
		Icon(child(button_7), {
			name: "close",
			size: 15
		});
		reset(button_7);
		reset(span_3);
		reset(div_3);
		reset(div_2);
		var div_4 = sibling(div_2, 2);
		var node_9 = child(div_4);
		var consequent = ($$anchor) => {
			Controls($$anchor, { legend: false });
		};
		var consequent_1 = ($$anchor) => {
			SkyPane($$anchor, {});
		};
		var alternate = ($$anchor) => {
			var fragment_3 = root$2();
			var node_10 = first_child(fragment_3);
			SearchBox(node_10, {
				mode: "sheet",
				onpick: () => {
					set(mobPanel, null);
				}
			});
			var node_11 = sibling(node_10, 2);
			PoiBar(node_11, { onpick: () => {
				set(mobPanel, null);
			} });
			var div_5 = sibling(node_11, 2);
			var button_8 = child(div_5);
			var node_12 = child(button_8);
			Icon(node_12, {
				name: "sun",
				size: 15
			});
			var text_3 = sibling(node_12, 1, true);
			reset(button_8);
			var button_9 = sibling(button_8, 2);
			Icon(child(button_9), {
				name: "ruler",
				size: 15
			});
			next();
			reset(button_9);
			var button_10 = sibling(button_9, 2);
			Icon(child(button_10), {
				name: "link",
				size: 15
			});
			next();
			reset(button_10);
			var button_11 = sibling(button_10, 2);
			Icon(child(button_11), {
				name: "reset",
				size: 15
			});
			next();
			reset(button_11);
			reset(div_5);
			var node_16 = sibling(div_5, 2);
			LivePanel(node_16, { onpick: () => {
				set(mobPanel, null);
			} });
			DataPane(sibling(node_16, 2), { compact: true });
			template_effect(() => set_text(text_3, $camera().inSolar ? "Back out" : "Solar system"));
			delegated("click", button_8, () => act(() => api.toggleSolar?.()));
			delegated("click", button_9, () => act(() => api.measure?.()));
			delegated("click", button_10, () => act(() => api.share?.()));
			delegated("click", button_11, () => act(() => api.reset?.()));
			append($$anchor, fragment_3);
		};
		if_block(node_9, ($$render) => {
			if (get(mobPanel) === "layers") $$render(consequent);
			else if (get(mobPanel) === "sky") $$render(consequent_1, 1);
			else $$render(alternate, -1);
		});
		reset(div_4);
		reset(div_1);
		template_effect(() => {
			set_style(div_1, `transform:translateY(${get(shiftPx) ?? ""}px)`);
			set_attribute(div_1, "aria-label", get(mobPanel) === "layers" ? "Layers" : get(mobPanel) === "sky" ? "Sky" : "Search");
			classes_4 = set_class(div_1, 1, "", null, classes_4, {
				full: get(snap) === "full",
				dragging: get(dragging)
			});
			set_text(text_2, ` ${get(mobPanel) === "layers" ? "Layers" : get(mobPanel) === "sky" ? "Sky" : "Search"} `);
		});
		delegated("pointerdown", button_5, down);
		delegated("pointermove", button_5, move);
		delegated("pointerup", button_5, up);
		event("pointercancel", button_5, up);
		delegated("click", button_5, grabClick);
		delegated("keydown", button_5, grabKey);
		delegated("click", button_6, cycle);
		delegated("click", button_7, () => {
			set(mobPanel, null);
		});
		append($$anchor, div_1);
	};
	if_block(node_5, ($$render) => {
		if (get(mobPanel)) $$render(consequent_2);
	});
	template_effect(() => {
		classes = set_class(button, 1, "mb", null, classes, { active: get(mobPanel) === "search" });
		set_attribute(button, "aria-pressed", get(mobPanel) === "search");
		classes_1 = set_class(button_1, 1, "mb", null, classes_1, { active: get(mobPanel) === "layers" });
		set_attribute(button_1, "aria-pressed", get(mobPanel) === "layers");
		classes_2 = set_class(button_2, 1, "mb", null, classes_2, { active: get(mobPanel) === "sky" });
		set_attribute(button_2, "aria-pressed", get(mobPanel) === "sky");
		classes_3 = set_class(button_3, 1, "mb", null, classes_3, { active: $timeBar() });
		set_attribute(button_3, "aria-pressed", $timeBar());
		set_text(text, $camera().band);
		set_text(text_1, $camera().distText);
	});
	delegated("click", button, () => openSheet("search"));
	delegated("click", button_1, () => openSheet("layers"));
	delegated("click", button_2, () => openSheet("sky"));
	delegated("click", button_3, toggleTime);
	delegated("click", button_4, () => act(() => api.tour?.start()));
	append($$anchor, fragment);
	pop();
	$$cleanup();
}
delegate([
	"click",
	"pointerdown",
	"pointermove",
	"pointerup",
	"keydown"
]);
//#endregion
//#region src/components/ScaleLadder.svelte
var root$1 = /* @__PURE__ */ from_html(`<button type="button" class="ld-rung"><span class="ld-tick"></span><span class="ld-l"> </span></button>`);
var root_1$1 = /* @__PURE__ */ from_html(`<div role="group" aria-label="Scale"><div class="ld-track" role="slider" tabindex="0" aria-label="Scale ladder" aria-valuemin="0" aria-valuemax="100"><!> <div class="ld-mark" aria-hidden="true"></div></div></div>`);
function ScaleLadder($$anchor, $$props) {
	push($$props, true);
	const $camera = () => store_get(camera, "$camera", $$stores);
	const [$$stores, $$cleanup] = setup_stores();
	let variant = prop($$props, "variant", 3, "edge");
	const PC_AU = 484814e-11;
	const PC_LY = 1 / 3.261564;
	const RUNGS = [
		{
			pc: 1 * PC_AU,
			l: "1 AU"
		},
		{
			pc: 100 * PC_AU,
			l: "100 AU"
		},
		{
			pc: 1 * PC_LY,
			l: "1 ly"
		},
		{
			pc: 100 * PC_LY,
			l: "100 ly"
		},
		{
			pc: 1e4 * PC_LY,
			l: "10 kly"
		},
		{
			pc: 1e6 * PC_LY,
			l: "1 Mly"
		},
		{
			pc: 1e8 * PC_LY,
			l: "100 Mly"
		},
		{
			pc: 1e10 * PC_LY,
			l: "10 Gly"
		},
		{
			pc: 143e8,
			l: "CMB"
		}
	];
	const LO = Math.log10(RUNGS[0].pc) - 1;
	const HI = Math.log10(RUNGS[RUNGS.length - 1].pc) + .3;
	const pos = (pc) => 1 - (Math.log10(Math.max(1e-12, pc)) - LO) / (HI - LO);
	let framing = /* @__PURE__ */ user_derived(() => $camera().real ? $camera().camZ : Math.pow(10, $camera().camZ - 6));
	let y = /* @__PURE__ */ user_derived(() => Math.max(0, Math.min(1, pos(get(framing)))));
	let track;
	let dragging = false;
	function pcAt(e) {
		const r = track.getBoundingClientRect();
		const t = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
		return Math.pow(10, LO + (1 - t) * (HI - LO));
	}
	function down(e) {
		dragging = true;
		track.setPointerCapture?.(e.pointerId);
		api.flyToScale?.(pcAt(e));
	}
	function move(e) {
		if (dragging) api.flyToScale?.(pcAt(e));
	}
	function up() {
		dragging = false;
	}
	function key(e) {
		const f = e.key === "ArrowUp" ? .5 : e.key === "ArrowDown" ? 2 : null;
		if (f) {
			e.preventDefault();
			api.flyToScale?.(get(framing) * f);
		}
	}
	var div = root_1$1();
	var div_1 = child(div);
	var node = child(div_1);
	each(node, 17, () => RUNGS, (r) => r.l, ($$anchor, r) => {
		var button = root$1();
		var span = sibling(child(button));
		var text = child(span, true);
		reset(span);
		reset(button);
		template_effect(($0) => {
			set_style(button, `top:${$0 ?? ""}%`);
			set_attribute(button, "title", `Frame ${get(r).l ?? ""}`);
			set_text(text, get(r).l);
		}, [() => pos(get(r).pc) * 100]);
		delegated("click", button, (e) => {
			e.stopPropagation();
			api.flyToScale?.(get(r).pc);
		});
		delegated("pointerdown", button, (e) => e.stopPropagation());
		append($$anchor, button);
	});
	var div_2 = sibling(node, 2);
	reset(div_1);
	bind_this(div_1, ($$value) => track = $$value, () => track);
	reset(div);
	action(div, ($$node, $$action_arg) => reserve?.($$node, $$action_arg), () => "ladder-" + variant());
	template_effect(($0) => {
		set_class(div, 1, `ladder ladder-${variant() ?? ""}`);
		set_attribute(div, "id", variant() === "edge" ? "ladder" : void 0);
		set_attribute(div_1, "aria-valuenow", $0);
		set_style(div_2, `top:${get(y) * 100}%`);
	}, [() => Math.round((1 - get(y)) * 100)]);
	delegated("pointerdown", div_1, down);
	delegated("pointermove", div_1, move);
	delegated("pointerup", div_1, up);
	event("pointercancel", div_1, up);
	delegated("keydown", div_1, key);
	append($$anchor, div);
	pop();
	$$cleanup();
}
delegate([
	"pointerdown",
	"pointermove",
	"pointerup",
	"keydown",
	"click"
]);
//#endregion
//#region src/App.svelte
var root = /* @__PURE__ */ from_html(`<div class="panel"><div class="label">Milky Way</div><div class="hint">Switch the “Milky Way · Sgr A*” layer on to see the map.</div></div>`);
var root_1 = /* @__PURE__ */ from_html(`<span aria-hidden="true"></span>`);
var root_2 = /* @__PURE__ */ from_html(`<button type="button"><!><span class="rb-l"> </span> <!></button>`);
var root_3 = /* @__PURE__ */ from_html(`<canvas id="gl"></canvas> <canvas id="sky"></canvas> <!> <div id="left-col"><!> <!> <!> <!></div> <!> <div id="rail-wrap"><div id="railpanel"><div><!></div> <div><!></div> <div><!></div> <div><!></div> <div><!></div> <div><!></div> <div><!></div> <div><!></div></div> <nav id="rail" aria-label="Panels and tools"><!> <div class="rail-gap"></div> <button type="button" class="rb" title="A guided flight from Earth to the edge of the observable universe"><!><span class="rb-l">Tour</span></button> <button type="button" title="Click two objects to measure the real distance between them"><!><span class="rb-l">Measure</span></button> <button type="button" class="rb" title="Copy a link to this exact view"><!><span class="rb-l">Share</span></button> <button type="button" class="rb" title="Back to the start view (Home)"><!><span class="rb-l">Reset</span></button></nav></div> <!> <!> <!> <!> <!> <!>`, 1);
function App($$anchor, $$props) {
	push($$props, true);
	const $sources = () => store_get(sources, "$sources", $$stores);
	const $timeBar = () => store_get(timeBar, "$timeBar", $$stores);
	const $camera = () => store_get(camera, "$camera", $$stores);
	const $toggleState = () => store_get(toggleState, "$toggleState", $$stores);
	const $measure = () => store_get(measure, "$measure", $$stores);
	const [$$stores, $$cleanup] = setup_stores();
	const RAIL = [
		{
			k: "layers",
			icon: "layers",
			label: "Layers"
		},
		{
			k: "legend",
			icon: "legend",
			label: "Legend"
		},
		{
			k: "map",
			icon: "galaxy",
			label: "Map"
		},
		{
			k: "live",
			icon: "live",
			label: "Live"
		},
		{
			k: "time",
			icon: "clock",
			label: "Time"
		},
		{
			k: "sky",
			icon: "scope",
			label: "Sky"
		},
		{
			k: "data",
			icon: "db",
			label: "Data"
		},
		{
			k: "analysis",
			icon: "chart",
			label: "Analyse"
		}
	];
	let srcErr = /* @__PURE__ */ user_derived(() => Object.values($sources()).some((r) => r.state === "error"));
	let srcBusy = /* @__PURE__ */ user_derived(() => Object.values($sources()).some((r) => r.state === "busy"));
	let panel = /* @__PURE__ */ state(null);
	user_effect(() => {
		document.body.classList.toggle("rail-open", !!get(panel));
	});
	user_effect(() => {
		document.body.classList.toggle("show-time", $timeBar());
	});
	user_effect(() => {
		document.body.classList.toggle("sky-on", !!$camera().sky);
	});
	function pick(k) {
		set(panel, get(panel) === k ? null : k, true);
	}
	function esc(e) {
		if (e.key === "Escape" && get(panel)) set(panel, null);
	}
	function dragover(e) {
		if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
	}
	async function drop(e) {
		const f = e.dataTransfer?.files?.[0];
		if (!f) return;
		e.preventDefault();
		if (/\.(fits?|fts)$/i.test(f.name)) api.importFits?.(await f.arrayBuffer(), f.name);
		else api.importUser?.(await f.text(), f.name);
		set(panel, "sky");
	}
	var fragment = root_3();
	event("keydown", $window, esc);
	event("dragover", $window, dragover);
	event("drop", $window, drop);
	var node = sibling(first_child(fragment), 4);
	PoiBar(node, { variant: "top" });
	var div = sibling(node, 2);
	var node_1 = child(div);
	ContextHeader(node_1, {});
	var node_2 = sibling(node_1, 2);
	SearchBox(node_2, {});
	var node_3 = sibling(node_2, 2);
	InfoCard(node_3, {});
	TransitCard(sibling(node_3, 2), {});
	reset(div);
	action(div, ($$node, $$action_arg) => reserve?.($$node, $$action_arg), () => "left");
	var node_5 = sibling(div, 2);
	NavConsole(node_5, {});
	var div_1 = sibling(node_5, 2);
	var div_2 = child(div_1);
	let classes;
	var div_3 = child(div_2);
	let classes_1;
	Controls(child(div_3), {});
	reset(div_3);
	var div_4 = sibling(div_3, 2);
	let classes_2;
	Legend(child(div_4), {});
	reset(div_4);
	var div_5 = sibling(div_4, 2);
	let classes_3;
	var node_8 = child(div_5);
	var consequent = ($$anchor) => {
		MwMap($$anchor, {});
	};
	var alternate = ($$anchor) => {
		append($$anchor, root());
	};
	if_block(node_8, ($$render) => {
		if ($toggleState()["t-mw"] !== false) $$render(consequent);
		else $$render(alternate, -1);
	});
	reset(div_5);
	var div_7 = sibling(div_5, 2);
	let classes_4;
	LivePanel(child(div_7), { collapsible: false });
	reset(div_7);
	var div_8 = sibling(div_7, 2);
	let classes_5;
	TimePane(child(div_8), {});
	reset(div_8);
	var div_9 = sibling(div_8, 2);
	let classes_6;
	SkyPane(child(div_9), {});
	reset(div_9);
	var div_10 = sibling(div_9, 2);
	let classes_7;
	DataPane(child(div_10), {});
	reset(div_10);
	var div_11 = sibling(div_10, 2);
	let classes_8;
	AnalysisPane(child(div_11), {});
	reset(div_11);
	reset(div_2);
	action(div_2, ($$node, $$action_arg) => reserve?.($$node, $$action_arg), () => "railpanel");
	var nav = sibling(div_2, 2);
	var node_14 = child(nav);
	each(node_14, 17, () => RAIL, (r) => r.k, ($$anchor, r) => {
		var button = root_2();
		let classes_9;
		var node_15 = child(button);
		Icon(node_15, {
			get name() {
				return get(r).icon;
			},
			size: 19
		});
		var span = sibling(node_15);
		var text = child(span, true);
		reset(span);
		var node_16 = sibling(span, 2);
		var consequent_1 = ($$anchor) => {
			var span_1 = root_1();
			let classes_10;
			template_effect(() => classes_10 = set_class(span_1, 1, "rb-dot", null, classes_10, { err: get(srcErr) }));
			append($$anchor, span_1);
		};
		if_block(node_16, ($$render) => {
			if (get(r).k === "data" && (get(srcErr) || get(srcBusy))) $$render(consequent_1);
		});
		reset(button);
		template_effect(() => {
			classes_9 = set_class(button, 1, "rb", null, classes_9, { on: get(panel) === get(r).k });
			set_attribute(button, "aria-pressed", get(panel) === get(r).k);
			set_attribute(button, "title", get(r).label);
			set_text(text, get(r).label);
		});
		delegated("click", button, () => pick(get(r).k));
		append($$anchor, button);
	});
	var button_1 = sibling(node_14, 4);
	Icon(child(button_1), {
		name: "compass",
		size: 19
	});
	next();
	reset(button_1);
	var button_2 = sibling(button_1, 2);
	let classes_11;
	Icon(child(button_2), {
		name: "ruler",
		size: 19
	});
	next();
	reset(button_2);
	var button_3 = sibling(button_2, 2);
	Icon(child(button_3), {
		name: "link",
		size: 19
	});
	next();
	reset(button_3);
	var button_4 = sibling(button_3, 2);
	Icon(child(button_4), {
		name: "reset",
		size: 19
	});
	next();
	reset(button_4);
	reset(nav);
	action(nav, ($$node, $$action_arg) => reserve?.($$node, $$action_arg), () => "rail");
	reset(div_1);
	var node_21 = sibling(div_1, 2);
	ScaleLadder(node_21, { variant: "edge" });
	var node_22 = sibling(node_21, 2);
	ScaleLadder(node_22, { variant: "strip" });
	var node_23 = sibling(node_22, 2);
	var consequent_2 = ($$anchor) => {
		Timeline($$anchor, {});
	};
	if_block(node_23, ($$render) => {
		if ($timeBar()) $$render(consequent_2);
	});
	var node_24 = sibling(node_23, 2);
	SkyStatus(node_24, {});
	var node_25 = sibling(node_24, 2);
	TourPanel(node_25, {});
	MobileNav(sibling(node_25, 2), {});
	template_effect(() => {
		classes = set_class(div_2, 1, "", null, classes, { open: !!get(panel) });
		classes_1 = set_class(div_3, 1, "rp-pane", null, classes_1, { on: get(panel) === "layers" });
		classes_2 = set_class(div_4, 1, "rp-pane", null, classes_2, { on: get(panel) === "legend" });
		classes_3 = set_class(div_5, 1, "rp-pane", null, classes_3, { on: get(panel) === "map" });
		classes_4 = set_class(div_7, 1, "rp-pane", null, classes_4, { on: get(panel) === "live" });
		classes_5 = set_class(div_8, 1, "rp-pane", null, classes_5, { on: get(panel) === "time" });
		classes_6 = set_class(div_9, 1, "rp-pane", null, classes_6, { on: get(panel) === "sky" });
		classes_7 = set_class(div_10, 1, "rp-pane", null, classes_7, { on: get(panel) === "data" });
		classes_8 = set_class(div_11, 1, "rp-pane", null, classes_8, { on: get(panel) === "analysis" });
		classes_11 = set_class(button_2, 1, "rb", null, classes_11, { on: $measure() });
		set_attribute(button_2, "aria-pressed", $measure());
	});
	delegated("click", button_1, () => api.tour?.start());
	delegated("click", button_2, () => api.measure?.());
	delegated("click", button_3, () => api.share?.());
	delegated("click", button_4, () => api.reset?.());
	append($$anchor, fragment);
	pop();
	$$cleanup();
}
delegate(["click"]);
//#endregion
//#region \0vite/preload-helper.js
var scriptRel = "modulepreload";
var assetsURL = function(dep, importerUrl) {
	return new URL(dep, importerUrl).href;
};
var seen = {};
var __vitePreload = function preload(baseModule, deps, importerUrl) {
	let promise = Promise.resolve();
	if (deps && deps.length > 0) {
		const links = document.getElementsByTagName("link");
		const cspNonceMeta = document.querySelector("meta[property=csp-nonce]");
		const cspNonce = cspNonceMeta?.nonce || cspNonceMeta?.getAttribute("nonce");
		function allSettled(promises) {
			return Promise.all(promises.map((p) => Promise.resolve(p).then((value) => ({
				status: "fulfilled",
				value
			}), (reason) => ({
				status: "rejected",
				reason
			}))));
		}
		function importMetaResolve(specifier) {
			if (import.meta.resolve) return import.meta.resolve(specifier);
			return new URL(
				specifier,
				/** #__KEEP__ */
				import.meta.url
			).href;
		}
		promise = allSettled(deps.map((dep) => {
			dep = assetsURL(dep, importerUrl);
			dep = importMetaResolve(dep);
			if (dep in seen) return;
			seen[dep] = true;
			const isCss = dep.endsWith(".css");
			for (let i = links.length - 1; i >= 0; i--) {
				const link = links[i];
				if (link.href === dep && (!isCss || link.rel === "stylesheet")) return;
			}
			const link = document.createElement("link");
			link.rel = isCss ? "stylesheet" : scriptRel;
			if (!isCss) link.as = "script";
			link.crossOrigin = "";
			link.href = dep;
			if (cspNonce) link.setAttribute("nonce", cspNonce);
			document.head.appendChild(link);
			if (isCss) return new Promise((res, rej) => {
				link.addEventListener("load", res);
				link.addEventListener("error", () => rej(/* @__PURE__ */ new Error(`Unable to preload CSS for ${dep}`)));
			});
		}));
	}
	function handlePreloadError(err) {
		const e = new Event("vite:preloadError", { cancelable: true });
		e.payload = err;
		window.dispatchEvent(e);
		if (!e.defaultPrevented) throw err;
	}
	return promise.then((res) => {
		for (const item of res || []) {
			if (item.status !== "rejected") continue;
			handlePreloadError(item.reason);
		}
		return baseModule().catch(handlePreloadError);
	});
};
//#endregion
//#region src/main.js
function showErr(msg) {
	let b = document.getElementById("errbar");
	if (!b) {
		b = document.createElement("div");
		b.id = "errbar";
		b.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:9999;background:#7f1d1d;color:#fff;font:12px monospace;padding:8px 12px;white-space:pre-wrap;max-height:40vh;overflow:auto";
		document.body.appendChild(b);
	}
	b.textContent += msg + "\n";
}
window.addEventListener("error", (e) => showErr("⚠ " + (e.message || e.type) + " @ " + (e.filename || "").split("/").pop() + ":" + e.lineno));
window.addEventListener("unhandledrejection", (e) => showErr("⚠ promise: " + (e.reason && e.reason.message || e.reason)));
mount(App, { target: document.getElementById("app") });
function boot() {
	return __vitePreload(() => import("./engine-CyCoCiGK.js").then(() => {
		try {
			restore();
		} catch (e) {}
	}), [], import.meta.url);
}
var getJSON = (u, id, name) => tfetch(id, {
	name,
	group: "catalogue"
}, u).then((r) => {
	if (!r.ok) throw new Error(u + " → HTTP " + r.status);
	return r.json();
});
var fail = (e) => {
	document.body.innerHTML = "<p style=\"color:#e9edfa;font-family:monospace;padding:2em\">Error loading data: " + e + "</p>";
};
if (window.__DATA__) boot().catch(fail);
else Promise.all([getJSON("data/data.json?b=20261025-1115", "data-json", "data.json · stars, exoplanets, galaxies"), getJSON("data/catalog.json?b=20261025-1115", "catalog-json", "catalog.json · solar system, deep sky, pulsars")]).then(([d, c]) => {
	window.__DATA__ = d;
	window.__CATALOG__ = c;
	const m = d.meta || {};
	count("data-json", (m.nHyg || 0) + (m.nStars || 0) + (m.nGal || 0));
	return boot();
}).catch(fail);
//#endregion
export { timeline as A, tfetch as B, samp as C, stats as D, skyCursor as E, api as F, count as I, declare as L, tour as M, transit as N, survey as O, userLayer as P, mark as R, observer as S, selection as T, timg as V, lightcurve as _, satEcl as a, movers as b, camera as c, facColor as d, facList as f, labels as g, kinematics as h, refreshLive as i, toggleState as j, timeBar as k, crossmatch as l, fielddiag as m, activeShowers as n, startLive as o, fieldQuery as p, groundEcl as r, RESERVED as s, LIVE as t, encounters as u, measure as v, searchMsg as w, nav as x, measureLog as y, tally as z };
