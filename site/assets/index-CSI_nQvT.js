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
//#region node_modules/clsx/dist/clsx.mjs
function r(e) {
	var t, f, n = "";
	if ("string" == typeof e || "number" == typeof e) n += e;
	else if ("object" == typeof e) if (Array.isArray(e)) {
		var o = e.length;
		for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
	} else for (f in e) e[f] && (n && (n += " "), n += f);
	return n;
}
function clsx$1() {
	for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
	return n;
}
//#endregion
//#region node_modules/svelte/src/internal/shared/attributes.js
/**
* Small wrapper around clsx to preserve Svelte's (weird) handling of falsy values.
* TODO Svelte 6 revisit this, and likely turn all falsy values into the empty string (what clsx also does)
* @param  {any} value
*/
function clsx(value) {
	if (typeof value === "object") return clsx$1(value);
	else return value ?? "";
}
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
//#endregion
//#region node_modules/svelte/src/internal/disclose-version.js
if (typeof window !== "undefined") ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region node_modules/svelte/src/internal/flags/legacy.js
enable_legacy_mode_flag();
//#endregion
//#region src/components/TopPanel.svelte
var root$13 = /* @__PURE__ */ from_html(`<div class="panel" id="hud-tl"><h1><span class="dot"></span>Known Universe</h1> <div class="stats"><div class="stat"><div class="k mono" id="s-sys">0</div><div class="l">Systems visible</div></div> <div class="stat"><div class="k mono" id="s-pl">0</div><div class="l">Planets</div></div> <div class="stat"><div class="k mono" id="s-near">—</div><div class="l">Nearest (ly)</div></div> <div class="stat"><div class="k mono" id="s-far">—</div><div class="l">Farthest (ly)</div></div></div> <button id="solarBtn">☉ Into the solar system</button> <div id="btnGrid"><button id="tourBtn" title="A guided flight from Earth to the edge of the observable universe">🧭 Tour</button> <button id="shareBtn" title="Copy a link to this exact view">🔗 Share</button> <button id="measureBtn" title="Click two objects to measure the real distance between them">📏 Measure</button> <button id="resetBtn2" title="Back to the full view">⟲ Reset</button></div></div>`);
function TopPanel($$anchor) {
	function resetView() {
		const b = document.getElementById("resetBtn");
		if (b) b.click();
	}
	var div = root$13();
	var div_1 = sibling(child(div), 6);
	var button = sibling(child(div_1), 6);
	reset(div_1);
	reset(div);
	delegated("click", button, resetView);
	append($$anchor, div);
}
delegate(["click"]);
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
function j(url) {
	return fetch(url).then((r) => r.ok ? r.json() : null).catch(() => null);
}
function day(off) {
	return new Date(Date.now() + off * 864e5).toISOString().slice(0, 10);
}
function publish() {
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
	const [kp, sp, mag, xr] = await Promise.all([
		j("https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json"),
		j("https://services.swpc.noaa.gov/products/summary/solar-wind-speed.json"),
		j("https://services.swpc.noaa.gov/products/summary/solar-wind-mag-field.json"),
		j("https://services.swpc.noaa.gov/json/goes/primary/xrays-6-hour.json")
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
	const d = await j(`https://api.nasa.gov/DONKI/CMEAnalysis?startDate=${day(-5)}&endDate=${day(0)}&mostAccurateOnly=true&api_key=${nasaKey()}`);
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
	const d = await j(`https://api.nasa.gov/neo/rest/v1/neo/${id}?api_key=${nasaKey()}`);
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
	const d = await j(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${day(0)}&end_date=${day(7)}&api_key=${nasaKey()}`);
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
	"geo"
];
async function fetchSats() {
	let c = tleCache();
	if (!c || typeof c.groups !== "object" || !c.groups) c = { groups: {} };
	let changed = false;
	for (const g of SAT_GROUPS) {
		const e = c.groups[g];
		if (e && Date.now() - e.ts < 6 * 36e5) continue;
		const t = await fetch(`https://celestrak.org/NORAD/elements/gp.php?GROUP=${g}&FORMAT=tle`).then((r) => r.ok ? r.text() : null).catch(() => null);
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
					ow: /^ONEWEB/i.test(n)
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
	const d = await j("https://services.swpc.noaa.gov/json/solar_regions.json");
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
	let d = await j("data/live-extra.json");
	if (!d) d = await j("https://raw.githubusercontent.com/blanpa/known-universe/live-data/live-extra.json");
	if (d && (d.gw || d.fireballs)) LIVE.extra = d;
}
async function fetchEpic() {
	const d = await j(`https://api.nasa.gov/EPIC/api/natural?api_key=${nasaKey()}`);
	if (!d || !d.length) return;
	const it = d[d.length - 1];
	LIVE.epic = {
		url: `https://api.nasa.gov/EPIC/archive/natural/${it.date.slice(0, 10).replace(/-/g, "/")}/jpg/${it.image}.jpg?api_key=${nasaKey()}`,
		date: it.date
	};
}
async function fetchLaunches() {
	const d = await j("https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=5&mode=list");
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
	setInterval(wx, 300 * 1e3);
	setInterval(ev, 1800 * 1e3);
	setInterval(midi, 7200 * 1e3);
	setInterval(slow, 360 * 60 * 1e3);
}
//#endregion
//#region src/lib/engine.js
var UI = {};
var api = {};
function __run() {
	"use strict";
	const DATA = window.__DATA__, META = DATA.meta, STARS = DATA.stars;
	const PC2LY = 3.261564;
	const cv = document.getElementById("sky"), ctx = cv.getContext("2d");
	const _rawFillText = ctx.fillText.bind(ctx);
	ctx.fillText = (s, x, y, mw) => {
		const pw = ctx.lineWidth, ps = ctx.strokeStyle, pj = ctx.lineJoin;
		ctx.lineWidth = 2.4;
		ctx.lineJoin = "round";
		ctx.strokeStyle = "rgba(5,7,14,0.75)";
		mw === void 0 ? ctx.strokeText(s, x, y) : ctx.strokeText(s, x, y, mw);
		ctx.lineWidth = pw;
		ctx.strokeStyle = ps;
		ctx.lineJoin = pj;
		mw === void 0 ? _rawFillText(s, x, y) : _rawFillText(s, x, y, mw);
	};
	api.clickToggle = clickToggle;
	api.doSearch = doSearch;
	api.suggest = suggestList;
	api.toggleFac = toggleFac;
	api.facColorToggle = facColorToggle;
	let W = 0, H = 0, DPR = 1, GLDPR = 1;
	const dists = STARS.map((s) => s.d).slice().sort((a, b) => a - b);
	const R0 = dists[Math.floor(dists.length * .9)] || META.maxDist;
	META.maxDist;
	STARS.forEach((s) => {
		const r = s.d || 1e-6;
		s._dx = s.x / r;
		s._dy = s.y / r;
		s._dz = s.z / r;
		s._r = r;
		s._col = tempColor(s.t);
		s._search = (s.h + " " + s.p.map((p) => p.n).join(" ")).toLowerCase();
	});
	const S = {
		yaw: .5,
		pitch: -.5,
		camZ: 3,
		year: 2026,
		tOffsetDays: 0,
		autorot: false,
		freelook: false,
		rings: true,
		veil: true,
		size: true,
		galaxies: true,
		hyg: true,
		gpu: true,
		gaia: true,
		web: true,
		qso: true,
		ob: true,
		vars: true,
		edge: true,
		facColor: false,
		facHidden: /* @__PURE__ */ new Set(),
		solar: true,
		moons: true,
		mw: true,
		mw3d: true,
		dso: true,
		psr: true,
		oclu: true,
		ast: true,
		tno: true,
		probes: true,
		helio: true,
		belt: true,
		con: true,
		hz: true,
		lag: true,
		lens: true,
		pm: false,
		pmYears: 0,
		cme: true,
		neo: true,
		sat: true,
		sunAR: true,
		met: true,
		iso: true,
		realScale: false,
		hover: null,
		pinned: null,
		focusStar: null,
		focusT: 0
	};
	const SUN = {
		n: "Sun",
		rk: 696340,
		c: [
			255,
			238,
			178
		],
		slug: "sun",
		kind: "Stern"
	};
	const PLANETS = [
		{
			n: "Mercury",
			a: .387,
			rk: 2439.7,
			c: [
				176,
				168,
				158
			],
			slug: "mercury",
			moons: [],
			k: [
				.38709927,
				37e-8,
				.20563593,
				1906e-8,
				7.00497902,
				-.00594749,
				252.2503235,
				149472.67411175,
				77.45779628,
				.16047689,
				48.33076593,
				-.12534081
			]
		},
		{
			n: "Venus",
			a: .723,
			rk: 6051.8,
			c: [
				222,
				196,
				140
			],
			slug: "venus",
			moons: [],
			k: [
				.72333566,
				39e-7,
				.00677672,
				-4107e-8,
				3.39467605,
				-7889e-7,
				181.9790995,
				58517.81538729,
				131.60246718,
				.00268329,
				76.67984255,
				-.27769418
			]
		},
		{
			n: "Earth",
			a: 1,
			rk: 6371,
			c: [
				104,
				157,
				222
			],
			slug: "earth",
			moons: [{
				n: "Moon",
				am: 384,
				rk: 1737,
				c: [
					188,
					188,
					190
				]
			}],
			k: [
				1.00000261,
				562e-8,
				.01671123,
				-4392e-8,
				-1531e-8,
				-.01294668,
				100.46457166,
				35999.37244981,
				102.93768193,
				.32327364,
				0,
				0
			]
		},
		{
			n: "Mars",
			a: 1.524,
			rk: 3389.5,
			c: [
				209,
				122,
				74
			],
			slug: "mars",
			moons: [{
				n: "Phobos",
				am: 9.4,
				rk: 11,
				c: [
					150,
					140,
					130
				]
			}, {
				n: "Deimos",
				am: 23.5,
				rk: 6,
				c: [
					150,
					140,
					130
				]
			}],
			k: [
				1.52371034,
				1847e-8,
				.0933941,
				7882e-8,
				1.84969142,
				-.00813131,
				-4.55343205,
				19140.30268499,
				-23.94362959,
				.44441088,
				49.55953891,
				-.29257343
			]
		},
		{
			n: "Jupiter",
			a: 5.203,
			rk: 69911,
			c: [
				214,
				182,
				142
			],
			slug: "jupiter",
			moons: [
				{
					n: "Amalthea",
					am: 181,
					rk: 83,
					c: [
						196,
						140,
						110
					]
				},
				{
					n: "Io",
					am: 422,
					rk: 1821,
					c: [
						226,
						214,
						148
					]
				},
				{
					n: "Europa",
					am: 671,
					rk: 1560,
					c: [
						212,
						202,
						182
					]
				},
				{
					n: "Ganymede",
					am: 1070,
					rk: 2634,
					c: [
						170,
						162,
						152
					]
				},
				{
					n: "Callisto",
					am: 1883,
					rk: 2410,
					c: [
						128,
						120,
						120
					]
				}
			],
			k: [
				5.202887,
				-11607e-8,
				.04838624,
				-13253e-8,
				1.30439695,
				-.00183714,
				34.39644051,
				3034.74612775,
				14.72847983,
				.21252668,
				100.47390909,
				.20469106
			]
		},
		{
			n: "Saturn",
			a: 9.537,
			rk: 58232,
			c: [
				224,
				206,
				158
			],
			slug: "saturn",
			ring: true,
			moons: [
				{
					n: "Mimas",
					am: 185,
					rk: 198,
					c: [
						214,
						214,
						218
					]
				},
				{
					n: "Enceladus",
					am: 238,
					rk: 252,
					c: [
						222,
						222,
						226
					]
				},
				{
					n: "Tethys",
					am: 295,
					rk: 531,
					c: [
						200,
						200,
						204
					]
				},
				{
					n: "Dione",
					am: 377,
					rk: 561,
					c: [
						195,
						195,
						200
					]
				},
				{
					n: "Rhea",
					am: 527,
					rk: 764,
					c: [
						182,
						182,
						186
					]
				},
				{
					n: "Titan",
					am: 1222,
					rk: 2575,
					c: [
						214,
						170,
						86
					]
				},
				{
					n: "Iapetus",
					am: 3561,
					rk: 735,
					c: [
						150,
						140,
						130
					]
				}
			],
			k: [
				9.53667594,
				-.0012506,
				.05386179,
				-50991e-8,
				2.48599187,
				.00193609,
				49.95424423,
				1222.49362201,
				92.59887831,
				-.41897216,
				113.66242448,
				-.28867794
			]
		},
		{
			n: "Uranus",
			a: 19.191,
			rk: 25362,
			c: [
				170,
				214,
				222
			],
			slug: "uranus",
			uring: true,
			moons: [
				{
					n: "Miranda",
					am: 130,
					rk: 236,
					c: [
						170,
						170,
						175
					]
				},
				{
					n: "Ariel",
					am: 191,
					rk: 579,
					c: [
						178,
						178,
						182
					]
				},
				{
					n: "Umbriel",
					am: 266,
					rk: 585,
					c: [
						150,
						150,
						155
					]
				},
				{
					n: "Titania",
					am: 436,
					rk: 789,
					c: [
						172,
						172,
						176
					]
				},
				{
					n: "Oberon",
					am: 583,
					rk: 761,
					c: [
						160,
						155,
						155
					]
				}
			],
			k: [
				19.18916464,
				-.00196176,
				.04725744,
				-4397e-8,
				.77263783,
				-.00242939,
				313.23810451,
				428.48202785,
				170.9542763,
				.40805281,
				74.01692503,
				.04240589
			]
		},
		{
			n: "Neptune",
			a: 30.07,
			rk: 24622,
			c: [
				92,
				126,
				222
			],
			slug: "neptune",
			moons: [
				{
					n: "Proteus",
					am: 118,
					rk: 210,
					c: [
						150,
						150,
						155
					]
				},
				{
					n: "Triton",
					am: 355,
					rk: 1353,
					c: [
						192,
						196,
						202
					]
				},
				{
					n: "Nereid",
					am: 5514,
					rk: 170,
					c: [
						170,
						170,
						176
					]
				}
			],
			k: [
				30.06992276,
				26291e-8,
				.00859048,
				5105e-8,
				1.77004347,
				35372e-8,
				-55.12002969,
				218.45945325,
				44.96476227,
				-.32241464,
				131.78422574,
				-.00508664
			]
		}
	];
	const DWARFS = [
		{
			n: "Ceres",
			a: 2.77,
			rk: 473,
			c: [
				150,
				145,
				140
			],
			slug: "dwarf-planets",
			moons: [],
			kd: {
				a: 2.765552595,
				e: .079692295,
				i: 10.5880278,
				om: 80.24862682,
				w: 73.29421453,
				ma: 274.4193464,
				n: .21430445,
				ep: 2461200.5
			}
		},
		{
			n: "Pluto",
			a: 39.59,
			rk: 1188,
			c: [
				202,
				176,
				150
			],
			slug: "pluto",
			moons: [
				{
					n: "Charon",
					am: 19.6,
					rk: 606,
					c: [
						172,
						166,
						166
					]
				},
				{
					n: "Nix",
					am: 48.7,
					rk: 22,
					c: [
						180,
						180,
						184
					]
				},
				{
					n: "Hydra",
					am: 64.7,
					rk: 25,
					c: [
						180,
						180,
						184
					]
				}
			],
			kd: {
				a: 39.58862939,
				e: .251837878,
				i: 17.14771141,
				om: 110.2923841,
				w: 113.7090015,
				ma: 38.68366347,
				n: .003956839,
				ep: 2457588.5
			}
		},
		{
			n: "Haumea",
			a: 43.06,
			rk: 816,
			c: [
				212,
				206,
				200
			],
			slug: "haumea",
			moons: [],
			kd: {
				a: 43.06029024,
				e: .194443015,
				i: 28.20847393,
				om: 121.7860561,
				w: 240.6905473,
				ma: 223.2104119,
				n: .003488098,
				ep: 2461200.5
			}
		},
		{
			n: "Makemake",
			a: 45.57,
			rk: 715,
			c: [
				192,
				160,
				140
			],
			slug: "makemake",
			moons: [],
			kd: {
				a: 45.57093317,
				e: .158888995,
				i: 29.02785604,
				om: 79.29483382,
				w: 297.0922733,
				ma: 169.9379962,
				n: .00320385,
				ep: 2461200.5
			}
		},
		{
			n: "Eris",
			a: 67.93,
			rk: 1163,
			c: [
				206,
				206,
				212
			],
			slug: "eris",
			moons: [],
			kd: {
				a: 67.93394688,
				e: .438238535,
				i: 43.92582795,
				om: 36.00477044,
				w: 150.7949236,
				ma: 211.7744343,
				n: .001760248,
				ep: 2461200.5
			}
		}
	];
	const SMALL = [
		{
			n: "Vesta",
			t: "AST",
			rk: 262,
			kd: {
				a: 2.361365965,
				e: .090203744,
				i: 7.143925545,
				om: 103.7012933,
				w: 151.4686478,
				ma: 81.19015608,
				n: .271618361,
				ep: 2461200.5
			}
		},
		{
			n: "Pallas",
			t: "AST",
			rk: 256,
			kd: {
				a: 2.769559011,
				e: .2307001,
				i: 34.93279322,
				om: 172.8866193,
				w: 310.9699162,
				ma: 254.2496522,
				n: .213839603,
				ep: 2461200.5
			}
		},
		{
			n: "Hygiea",
			t: "AST",
			rk: 217,
			kd: {
				a: 3.150974034,
				e: .106709274,
				i: 3.829529946,
				om: 283.1198928,
				w: 312.4242387,
				ma: 252.0344242,
				n: .176212551,
				ep: 2461200.5
			}
		},
		{
			n: "Juno",
			t: "AST",
			rk: 127,
			kd: {
				a: 2.670989527,
				e: .255699984,
				i: 12.98659237,
				om: 169.8115953,
				w: 247.8950743,
				ma: 262.7322945,
				n: .225785369,
				ep: 2461200.5
			}
		},
		{
			n: "Psyche",
			t: "AST",
			rk: 113,
			kd: {
				a: 2.925720466,
				e: .134932474,
				i: 3.098749116,
				om: 149.9753859,
				w: 230.0326783,
				ma: 79.76939505,
				n: .196949476,
				ep: 2461200.5
			}
		},
		{
			n: "Eros",
			t: "AST",
			rk: 8.4,
			kd: {
				a: 1.458243717,
				e: .222877963,
				i: 10.8285441,
				om: 304.2679713,
				w: 178.9181319,
				ma: 62.51145502,
				n: .559704635,
				ep: 2461200.5
			}
		},
		{
			n: "Bennu",
			t: "AST",
			rk: .24,
			kd: {
				a: 1.126391026,
				e: .203745076,
				i: 6.03494377,
				om: 2.060866196,
				w: 66.22306084,
				ma: 101.703952,
				n: .82446135,
				ep: 2455562.5
			}
		},
		{
			n: "Ryugu",
			t: "AST",
			rk: .45,
			kd: {
				a: 1.190918932,
				e: .191073005,
				i: 5.866442495,
				om: 251.2897124,
				w: 211.6089939,
				ma: 62.34067434,
				n: .758369354,
				ep: 2461200.5
			}
		},
		{
			n: "1P/Halley",
			t: "COM",
			rk: 5.5,
			kd: {
				a: 17.92863505,
				e: .967935996,
				i: 162.19053,
				om: 59.09894721,
				w: 112.2414315,
				ma: 274.3823371,
				n: .012983244,
				ep: 2439875.5
			}
		},
		{
			n: "2P/Encke",
			t: "COM",
			rk: 2.4,
			kd: {
				a: 2.21968871,
				e: .847749697,
				i: 11.41227811,
				om: 334.1935846,
				w: 187.1342464,
				ma: 243.1260693,
				n: .298034105,
				ep: 2459847.5
			}
		},
		{
			n: "67P C-G",
			t: "COM",
			rk: 2,
			kd: {
				a: 3.46224949,
				e: .640908131,
				i: 7.040294907,
				om: 50.1355738,
				w: 12.79824973,
				ma: 8.859927419,
				n: .152991229,
				ep: 2457305.5
			}
		},
		{
			n: "Hale-Bopp",
			t: "COM",
			rk: 30,
			kd: {
				a: 177.4333839,
				e: .994981003,
				i: 89.28759425,
				om: 282.7334214,
				w: 130.4146671,
				ma: 3.878386339,
				n: 417014e-9,
				ep: 2459837.5
			}
		},
		{
			n: "9P/Tempel 1",
			t: "COM",
			rk: 3,
			kd: {
				a: 3.146133759,
				e: .509702833,
				i: 10.47342815,
				om: 68.75357468,
				w: 179.1972754,
				ma: 336.5854439,
				n: .176619357,
				ep: 2457470.5
			}
		}
	];
	SMALL.forEach((o) => {
		o.kind = o.t === "COM" ? "Comet" : "Asteroid";
	});
	const COMETS2 = [
		{
			"n": "C/1811 W1 (Pons)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 82.88,
				"e": .9809,
				"i": 31.26,
				"om": 95.63,
				"w": 314.5,
				"ma": -0,
				"n": .00130626,
				"ep": 2382828
			}
		},
		{
			"n": "C/1840 U1 (Bremiker)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 43.45,
				"e": .9659,
				"i": 57.9,
				"om": 251.21,
				"w": 133.51,
				"ma": .06,
				"n": .00344128,
				"ep": 2393440.5
			}
		},
		{
			"n": "C/1853 G1 (Schweizer)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 84.81,
				"e": .9893,
				"i": 122.2,
				"om": 43.02,
				"w": 199.23,
				"ma": .02,
				"n": .00126192,
				"ep": 2398000.5
			}
		},
		{
			"n": "C/1855 G1 (Schweizer)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 63.01,
				"e": .9652,
				"i": 128.58,
				"om": 191.75,
				"w": 323.09,
				"ma": 0,
				"n": .00197056,
				"ep": 2398620
			}
		},
		{
			"n": "C/1855 L1 (Donati)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 39.91,
				"e": .9858,
				"i": 156.87,
				"om": 262.23,
				"w": 22.49,
				"ma": -.05,
				"n": .00390914,
				"ep": 2398720.5
			}
		},
		{
			"n": "C/1857 O1 (Peters)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 38.13,
				"e": .9804,
				"i": 32.76,
				"om": 202.83,
				"w": 180.94,
				"ma": .04,
				"n": .00418604,
				"ep": 2399560.5
			}
		},
		{
			"n": "C/1861 G1 (Thatcher)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 55.68,
				"e": .9835,
				"i": 79.77,
				"om": 31.87,
				"w": 213.45,
				"ma": -.02,
				"n": .00237222,
				"ep": 2400920.5
			}
		},
		{
			"n": "C/1861 J1 (Great comet)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 55.08,
				"e": .9851,
				"i": 85.44,
				"om": 280.91,
				"w": 330.08,
				"ma": -.04,
				"n": .00241109,
				"ep": 2400920.5
			}
		},
		{
			"n": "C/1874 Q1 (Coggia)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 45.4,
				"e": .9628,
				"i": 34.13,
				"om": 217.63,
				"w": 149.59,
				"ma": -.01,
				"n": .00322196,
				"ep": 2405720.5
			}
		},
		{
			"n": "C/1885 R1 (Brooks)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 42.24,
				"e": .9823,
				"i": 59.1,
				"om": 206.37,
				"w": 42.85,
				"ma": -.01,
				"n": .0035902,
				"ep": 2409760.5
			}
		},
		{
			"n": "C/1887 B2 (Brooks)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 99.97,
				"e": .9837,
				"i": 104.27,
				"om": 281.51,
				"w": 159.42,
				"ma": .01,
				"n": 98605e-8,
				"ep": 2410360.5
			}
		},
		{
			"n": "C/1894 G1 (Gale)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 88.91,
				"e": .9889,
				"i": 86.96,
				"om": 207.89,
				"w": 324.17,
				"ma": .06,
				"n": .00117565,
				"ep": 2412983.5
			}
		},
		{
			"n": "C/1898 F1 (Perrine)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 56.02,
				"e": .9804,
				"i": 72.53,
				"om": 263.87,
				"w": 47.31,
				"ma": .14,
				"n": .00235066,
				"ep": 2414427.5
			}
		},
		{
			"n": "C/1905 W1 (Schaer)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 75.85,
				"e": .9861,
				"i": 140.53,
				"om": 224.3,
				"w": 132.47,
				"ma": .06,
				"n": .00149201,
				"ep": 2417185.5
			}
		},
		{
			"n": "C/1906 V1 (Thiele)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 63.06,
				"e": .9808,
				"i": 56.37,
				"om": 86.09,
				"w": 8.63,
				"ma": .03,
				"n": .00196822,
				"ep": 2417553.5
			}
		},
		{
			"n": "C/1907 G1 (Grigg-Mellish)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 62.43,
				"e": .9852,
				"i": 109.95,
				"om": 190.47,
				"w": 328.6,
				"ma": .04,
				"n": .00199809,
				"ep": 2417683.5
			}
		},
		{
			"n": "C/1911 O1 (Brooks)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 39.59,
				"e": .9876,
				"i": 33.34,
				"om": 293.7,
				"w": 153.56,
				"ma": 359.75,
				"n": .00395663,
				"ep": 2419275.5
			}
		},
		{
			"n": "C/1922 B1 (Reid)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 125,
				"e": .987,
				"i": 32.45,
				"om": 275.6,
				"w": 183.68,
				"ma": 0,
				"n": 70524e-8,
				"ep": 2422991.3
			}
		},
		{
			"n": "C/1931 O1 (Nagata)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 48.55,
				"e": .9785,
				"i": 42.3,
				"om": 192.25,
				"w": 320.09,
				"ma": .34,
				"n": .00291353,
				"ep": 2426619.5
			}
		},
		{
			"n": "C/1932 G1 (Houghton-Ensor)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 45.01,
				"e": .9721,
				"i": 74.28,
				"om": 213.48,
				"w": 303.52,
				"ma": -.02,
				"n": .00326393,
				"ep": 2426760.5
			}
		},
		{
			"n": "C/1932 P1 (Peltier-Whipple)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 44.89,
				"e": .9769,
				"i": 71.72,
				"om": 345.47,
				"w": 38.47,
				"ma": 359.99,
				"n": .00327702,
				"ep": 2426950.5
			}
		},
		{
			"n": "C/1932 Y1 (Dodwell-Forbes)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 40.62,
				"e": .9722,
				"i": 24.5,
				"om": 78.59,
				"w": 327.36,
				"ma": .08,
				"n": .0038071,
				"ep": 2427092.5
			}
		},
		{
			"n": "C/1937 P1 (Hubble)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 71.04,
				"e": .9725,
				"i": 11.58,
				"om": 97.8,
				"w": 147.49,
				"ma": -.01,
				"n": .00164608,
				"ep": 2428480.5
			}
		},
		{
			"n": "C/1940 O1 (Whipple-Paraskevopoulos)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 56.49,
				"e": .9808,
				"i": 54.69,
				"om": 135.06,
				"w": 235.74,
				"ma": .02,
				"n": .00232138,
				"ep": 2429920.5
			}
		},
		{
			"n": "C/1941 B1 (Friend-Reese-Honda)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 50.16,
				"e": .9812,
				"i": 26.28,
				"om": 329.79,
				"w": 132.73,
				"ma": 0,
				"n": .00277439,
				"ep": 2430014.9
			}
		},
		{
			"n": "C/1952 H1 (Mrkos)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 77.5,
				"e": .9834,
				"i": 112.03,
				"om": 122.36,
				"w": 144.9,
				"ma": .03,
				"n": .00144461,
				"ep": 2434195.5
			}
		},
		{
			"n": "C/1955 L1 (Mrkos)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 49.54,
				"e": .9892,
				"i": 86.5,
				"om": 48.94,
				"w": 32.51,
				"ma": .11,
				"n": .00282664,
				"ep": 2435302.5
			}
		},
		{
			"n": "C/1961 R1 (Humason)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 205.4,
				"e": .9896,
				"i": 153.28,
				"om": 155.44,
				"w": 233.56,
				"ma": .05,
				"n": 33481e-8,
				"ep": 2438161.5
			}
		},
		{
			"n": "C/1964 N1 (Ikeya)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 55.9,
				"e": .9853,
				"i": 171.92,
				"om": 269.95,
				"w": 290.77,
				"ma": 359.99,
				"n": .00235823,
				"ep": 2438604.5
			}
		},
		{
			"n": "C/1973 H1 (Huchra)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 88.11,
				"e": .9729,
				"i": 48.33,
				"om": 57.84,
				"w": 123.47,
				"ma": .09,
				"n": .0011917,
				"ep": 2441832.5
			}
		},
		{
			"n": "C/1974 O1 (Cesco)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 66.59,
				"e": .9794,
				"i": 173.16,
				"om": 165.74,
				"w": 176.76,
				"ma": .18,
				"n": .0018138,
				"ep": 2442280.5
			}
		},
		{
			"n": "C/1975 T2 (Suzuki-Saigusa-Mori)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 58.2,
				"e": .9856,
				"i": 118.23,
				"om": 216.81,
				"w": 152.02,
				"ma": .03,
				"n": .00221983,
				"ep": 2442716.5
			}
		},
		{
			"n": "C/1979 S1 (Meier)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 53.03,
				"e": .973,
				"i": 67.08,
				"om": 297.63,
				"w": 112.56,
				"ma": .04,
				"n": .00255224,
				"ep": 2444179.5
			}
		},
		{
			"n": "C/1979 Y1 (Bradfield)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 45.59,
				"e": .988,
				"i": 148.6,
				"om": 103.22,
				"w": 257.61,
				"ma": .11,
				"n": .00320184,
				"ep": 2444263.5
			}
		},
		{
			"n": "C/1983 H1 (IRAS-Araki-Alcock)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 98.03,
				"e": .9899,
				"i": 73.25,
				"om": 49.1,
				"w": 192.85,
				"ma": 359.99,
				"n": .00101547,
				"ep": 2445467.5
			}
		},
		{
			"n": "C/1984 U2 (Shoemaker)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 41.75,
				"e": .9709,
				"i": 13.88,
				"om": 223.48,
				"w": 229.21,
				"ma": 360,
				"n": .00365359,
				"ep": 2446068.5
			}
		},
		{
			"n": "C/1985 T1 (Thiele)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 78.79,
				"e": .9833,
				"i": 139.07,
				"om": 53.01,
				"w": 53,
				"ma": 360,
				"n": .00140928,
				"ep": 2446415.5
			}
		},
		{
			"n": "C/1986 E1 (Shoemaker)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 67.6,
				"e": .9468,
				"i": 159.81,
				"om": 294.84,
				"w": 123.57,
				"ma": .17,
				"n": .00177331,
				"ep": 2446598.5
			}
		},
		{
			"n": "C/1992 Q2 (Helin-Lawrence)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 58.95,
				"e": .9654,
				"i": 106.85,
				"om": 194.67,
				"w": 268.85,
				"ma": 359.94,
				"n": .0021776,
				"ep": 2449033.5
			}
		},
		{
			"n": "C/1994 E1 (Mueller)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 55.34,
				"e": .9684,
				"i": 145.14,
				"om": 5.18,
				"w": 98.92,
				"ma": .31,
				"n": .00239412,
				"ep": 2449451.5
			}
		},
		{
			"n": "C/1995 Q2 (Hartley-Drinkwater)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 56.38,
				"e": .9665,
				"i": 168.01,
				"om": 300.75,
				"w": 314,
				"ma": .08,
				"n": .00232818,
				"ep": 2449966.5
			}
		},
		{
			"n": "C/1996 R1 (Hergenrother-Spahr)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 131.7,
				"e": .9856,
				"i": 145.81,
				"om": 149.75,
				"w": 139.46,
				"ma": .02,
				"n": 65212e-8,
				"ep": 2450354.5
			}
		},
		{
			"n": "C/1997 O1 (Tilbrook)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 87.02,
				"e": .9842,
				"i": 115.8,
				"om": 231.25,
				"w": 336.19,
				"ma": .09,
				"n": .00121416,
				"ep": 2450716.5
			}
		},
		{
			"n": "C/1998 K1 (Mueller)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 62.29,
				"e": .9452,
				"i": 35.64,
				"om": 18.26,
				"w": 165.25,
				"ma": 359.82,
				"n": .00200483,
				"ep": 2450969.5
			}
		},
		{
			"n": "C/1998 K5 (LINEAR)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 72.4,
				"e": .9867,
				"i": 9.93,
				"om": 211.12,
				"w": 99.46,
				"ma": .02,
				"n": .00159991,
				"ep": 2451021.5
			}
		},
		{
			"n": "C/1998 U5 (LINEAR)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 102.9,
				"e": .988,
				"i": 131.76,
				"om": 66.65,
				"w": 51.13,
				"ma": 359.98,
				"n": 94424e-8,
				"ep": 2451148.5
			}
		},
		{
			"n": "C/1999 K2 (Ferris)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 154.7,
				"e": .9658,
				"i": 82.19,
				"om": 300.32,
				"w": 4.57,
				"ma": .04,
				"n": 51223e-8,
				"ep": 2451353.5
			}
		},
		{
			"n": "C/1999 L3 (LINEAR)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 77.58,
				"e": .9744,
				"i": 166.1,
				"om": 140.16,
				"w": 353.3,
				"ma": 359.98,
				"n": .00144238,
				"ep": 2451536.5
			}
		},
		{
			"n": "C/2000 J1 (Ferris)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 55.59,
				"e": .9543,
				"i": 98.79,
				"om": 28.44,
				"w": 147.22,
				"ma": 360,
				"n": .00237798,
				"ep": 2451675.5
			}
		},
		{
			"n": "C/2001 Q1 (NEAT)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 171.3,
				"e": .9659,
				"i": 66.95,
				"om": 139.26,
				"w": 175.46,
				"ma": 0,
				"n": 43961e-8,
				"ep": 2452180.5
			}
		},
		{
			"n": "C/2001 S1 (Skiff)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 53.46,
				"e": .9299,
				"i": 139.13,
				"om": 330.12,
				"w": 285.17,
				"ma": .31,
				"n": .00252151,
				"ep": 2452187.5
			}
		},
		{
			"n": "C/2002 Q2 (LINEAR)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 58.94,
				"e": .9779,
				"i": 96.77,
				"om": 154.29,
				"w": 125.47,
				"ma": .04,
				"n": .00217816,
				"ep": 2452521.5
			}
		},
		{
			"n": "C/2002 VQ94 (LINEAR)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 201.6,
				"e": .9663,
				"i": 70.52,
				"om": 35.02,
				"w": 100.05,
				"ma": .07,
				"n": 34432e-8,
				"ep": 2453980.5
			}
		},
		{
			"n": "C/2003 H2 (LINEAR)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 38.16,
				"e": .9429,
				"i": 74.22,
				"om": 79.84,
				"w": 155.08,
				"ma": .02,
				"n": .00418111,
				"ep": 2452781.5
			}
		},
		{
			"n": "C/2003 K1 (Spacewatch)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 41.83,
				"e": .9501,
				"i": 129.83,
				"om": 250.06,
				"w": 314.48,
				"ma": .58,
				"n": .00364311,
				"ep": 2452789.5
			}
		},
		{
			"n": "C/2003 L2 (LINEAR)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 154.4,
				"e": .9815,
				"i": 82.05,
				"om": 273.56,
				"w": 119.84,
				"ma": 359.94,
				"n": 51373e-8,
				"ep": 2452899.5
			}
		},
		{
			"n": "C/2003 S4-A (LINEAR)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 36.89,
				"e": .895,
				"i": 40.71,
				"om": 224.55,
				"w": 155.33,
				"ma": .57,
				"n": .00439887,
				"ep": 2453285.5
			}
		},
		{
			"n": "C/2003 S4-B (LINEAR)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 39.97,
				"e": .904,
				"i": 40.4,
				"om": 224.54,
				"w": 153.68,
				"ma": .53,
				"n": .00390034,
				"ep": 2453285.5
			}
		},
		{
			"n": "C/2004 DZ61 (Catalina-LINEAR)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 45.78,
				"e": .956,
				"i": 66.81,
				"om": 172.79,
				"w": 44.46,
				"ma": 359.79,
				"n": .00318193,
				"ep": 2453085.5
			}
		},
		{
			"n": "C/2004 HV60 (Spacewatch)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 60.56,
				"e": .9492,
				"i": 92.71,
				"om": 44.83,
				"w": 148.09,
				"ma": .28,
				"n": .00209134,
				"ep": 2453125.5
			}
		},
		{
			"n": "C/2004 K3 (LINEAR)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 58.12,
				"e": .981,
				"i": 111.93,
				"om": 275.54,
				"w": 60.49,
				"ma": 359.96,
				"n": .00222441,
				"ep": 2453167.5
			}
		},
		{
			"n": "C/2004 Q1 (Tucker)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 186.7,
				"e": .989,
				"i": 56.09,
				"om": 22.13,
				"w": 32.97,
				"ma": 0,
				"n": 38636e-8,
				"ep": 2453350.5
			}
		},
		{
			"n": "C/2005 H1 (LINEAR)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 46.26,
				"e": .8969,
				"i": 81.51,
				"om": 71.49,
				"w": 95.21,
				"ma": .66,
				"n": .00313253,
				"ep": 2453518.5
			}
		},
		{
			"n": "C/2005 N4 (Catalina)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 58.49,
				"e": .9606,
				"i": 116.63,
				"om": 64.04,
				"w": 136.55,
				"ma": .03,
				"n": .00220334,
				"ep": 2453565.5
			}
		},
		{
			"n": "C/2005 O1 (NEAT)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 51,
				"e": .9296,
				"i": 155.98,
				"om": 304.8,
				"w": 324.74,
				"ma": .23,
				"n": .00270613,
				"ep": 2453594.5
			}
		},
		{
			"n": "C/2005 P3 (SWAN)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 42.6,
				"e": .9877,
				"i": 89.71,
				"om": 242.78,
				"w": 32.14,
				"ma": .09,
				"n": .00354478,
				"ep": 2453618.5
			}
		},
		{
			"n": "C/2005 YW (LINEAR)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 190.4,
				"e": .9895,
				"i": 40.54,
				"om": 302.21,
				"w": 234.63,
				"ma": 360,
				"n": 37515e-8,
				"ep": 2454065.5
			}
		},
		{
			"n": "C/2006 M1 (LINEAR)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 153.7,
				"e": .9769,
				"i": 54.88,
				"om": 231.62,
				"w": 122.89,
				"ma": 359.97,
				"n": 51724e-8,
				"ep": 2454093.5
			}
		},
		{
			"n": "C/2006 V1 (Catalina)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 257.6,
				"e": .9896,
				"i": 31.12,
				"om": 335.72,
				"w": 253.4,
				"ma": 359.95,
				"n": 23839e-8,
				"ep": 2454217.5
			}
		},
		{
			"n": "C/2007 D2 (Spacewatch)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 55.7,
				"e": .9776,
				"i": 178.62,
				"om": 297.13,
				"w": 65.13,
				"ma": .22,
				"n": .00237094,
				"ep": 2454156.5
			}
		},
		{
			"n": "C/2007 E1 (Garradd)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 65,
				"e": .9802,
				"i": 174.39,
				"om": 153.83,
				"w": 7.1,
				"ma": 359.99,
				"n": .00188076,
				"ep": 2454241.5
			}
		},
		{
			"n": "C/2007 H2 (Skiff)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 49.8,
				"e": .9717,
				"i": 52.19,
				"om": 203.77,
				"w": 319.3,
				"ma": .18,
				"n": .00280453,
				"ep": 2454214.5
			}
		},
		{
			"n": "C/2007 K1 (Lemmon)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 434.3,
				"e": .9787,
				"i": 108.43,
				"om": 294.66,
				"w": 51.97,
				"ma": .01,
				"n": 1089e-7,
				"ep": 2454277.5
			}
		},
		{
			"n": "C/2007 K5 (Lovejoy)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 49.31,
				"e": .9767,
				"i": 64.88,
				"om": 193.74,
				"w": 255.58,
				"ma": .13,
				"n": .00284644,
				"ep": 2454266.5
			}
		},
		{
			"n": "C/2007 K6 (McNaught)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 223.3,
				"e": .9846,
				"i": 105.06,
				"om": 298.08,
				"w": 337.14,
				"ma": 0,
				"n": 29537e-8,
				"ep": 2454293.5
			}
		},
		{
			"n": "C/2007 M3 (LINEAR)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 171.4,
				"e": .9798,
				"i": 161.76,
				"om": 41.62,
				"w": 125.74,
				"ma": 359.99,
				"n": 43923e-8,
				"ep": 2454330.5
			}
		},
		{
			"n": "C/2007 T5 (Gibbs)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 46.88,
				"e": .9136,
				"i": 45.62,
				"om": 109.84,
				"w": 34.42,
				"ma": 359.63,
				"n": .0030706,
				"ep": 2454491.5
			}
		},
		{
			"n": "C/2008 G1 (Gibbs)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 365.1,
				"e": .9891,
				"i": 72.86,
				"om": 215.92,
				"w": 63.7,
				"ma": 359.96,
				"n": 14128e-8,
				"ep": 2454594.5
			}
		},
		{
			"n": "C/2008 H1 (LINEAR)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 51.68,
				"e": .9466,
				"i": 75.49,
				"om": 34.63,
				"w": 96.04,
				"ma": .16,
				"n": .0026529,
				"ep": 2454602.5
			}
		},
		{
			"n": "C/2008 J1 (Boattini)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 166.1,
				"e": .9896,
				"i": 61.78,
				"om": 273.42,
				"w": 68.12,
				"ma": .01,
				"n": 46042e-8,
				"ep": 2454681.5
			}
		},
		{
			"n": "C/2008 J5 (Garradd)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 72.44,
				"e": .9729,
				"i": 93.27,
				"om": 287.08,
				"w": 313.38,
				"ma": .14,
				"n": .00159859,
				"ep": 2454642.5
			}
		},
		{
			"n": "C/2008 X3 (LINEAR)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 43.76,
				"e": .9565,
				"i": 66.47,
				"om": 337.75,
				"w": 140.8,
				"ma": .3,
				"n": .00340477,
				"ep": 2454838.5
			}
		},
		{
			"n": "C/2009 B2 (LINEAR)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 41.77,
				"e": .9443,
				"i": 156.87,
				"om": 18.81,
				"w": 192.5,
				"ma": .01,
				"n": .00365096,
				"ep": 2454901.5
			}
		},
		{
			"n": "C/2009 E1 (Itagaki)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 40.18,
				"e": .9851,
				"i": 127.45,
				"om": 105.96,
				"w": 48.96,
				"ma": .08,
				"n": .00386981,
				"ep": 2454950.5
			}
		},
		{
			"n": "C/2009 F1 (Larson)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 106,
				"e": .9827,
				"i": 171.38,
				"om": 357.95,
				"w": 219.58,
				"ma": 359.92,
				"n": 90312e-8,
				"ep": 2454916.5
			}
		},
		{
			"n": "C/2009 F2 (McNaught)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 346.1,
				"e": .983,
				"i": 59.37,
				"om": 214.06,
				"w": 336.34,
				"ma": .04,
				"n": 15307e-8,
				"ep": 2455386.5
			}
		},
		{
			"n": "C/2009 F5 (McNaught)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 80.17,
				"e": .972,
				"i": 84.99,
				"om": 219.06,
				"w": 297.37,
				"ma": .25,
				"n": .00137305,
				"ep": 2454958.5
			}
		},
		{
			"n": "C/2009 K4 (Gibbs)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 41.33,
				"e": .9625,
				"i": 34.82,
				"om": 30.13,
				"w": 127.47,
				"ma": 359.96,
				"n": .00370942,
				"ep": 2454991.5
			}
		},
		{
			"n": "C/2010 D4 (WISE)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 64.67,
				"e": .8895,
				"i": 105.66,
				"om": 266.78,
				"w": 44.49,
				"ma": .71,
				"n": .00189518,
				"ep": 2455298.5
			}
		},
		{
			"n": "C/2010 DG56 (WISE)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 67.54,
				"e": .9764,
				"i": 160.42,
				"om": 3.87,
				"w": 318.29,
				"ma": .08,
				"n": .00177567,
				"ep": 2455374.5
			}
		},
		{
			"n": "C/2010 E1 (Garradd)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 110.4,
				"e": .9759,
				"i": 71.7,
				"om": 169.29,
				"w": 296.99,
				"ma": .12,
				"n": 84967e-8,
				"ep": 2455286.5
			}
		},
		{
			"n": "C/2010 F1 (Boattini)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 68.38,
				"e": .9475,
				"i": 64.94,
				"om": 344.39,
				"w": 127.51,
				"ma": .25,
				"n": .00174305,
				"ep": 2455288.5
			}
		},
		{
			"n": "C/2010 G2 (Hill)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 96.19,
				"e": .9794,
				"i": 103.75,
				"om": 246.78,
				"w": 137.43,
				"ma": 359.96,
				"n": .00104474,
				"ep": 2455772.5
			}
		},
		{
			"n": "C/2010 J1 (Boattini)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 36.72,
				"e": .9538,
				"i": 134.38,
				"om": 254.81,
				"w": 333.11,
				"ma": .47,
				"n": .00442945,
				"ep": 2455339.5
			}
		},
		{
			"n": "C/2010 KW7 (WISE)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 99.85,
				"e": .9743,
				"i": 147.06,
				"om": 104.76,
				"w": 332.31,
				"ma": .04,
				"n": 98783e-8,
				"ep": 2455524.5
			}
		},
		{
			"n": "C/2010 L4 (WISE)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 80.07,
				"e": .9647,
				"i": 102.82,
				"om": 125.54,
				"w": 95.77,
				"ma": .18,
				"n": .00137562,
				"ep": 2455385.5
			}
		},
		{
			"n": "C/2011 Q4 (SWAN)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 43.04,
				"e": .9742,
				"i": 147.84,
				"om": 252.09,
				"w": 1.88,
				"ma": .16,
				"n": .00349056,
				"ep": 2455870.5
			}
		},
		{
			"n": "C/2012 E3 (PANSTARRS)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 221.4,
				"e": .9827,
				"i": 105.66,
				"om": 5.53,
				"w": 103.52,
				"ma": .1,
				"n": 29918e-8,
				"ep": 2456015.5
			}
		},
		{
			"n": "C/2012 F1 (Gibbs)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 74.39,
				"e": .9657,
				"i": 159.4,
				"om": 129.97,
				"w": 300.43,
				"ma": .05,
				"n": .00153615,
				"ep": 2456008.5
			}
		},
		{
			"n": "C/2012 X1 (LINEAR)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 153.3,
				"e": .9896,
				"i": 44.37,
				"om": 113.15,
				"w": 132.11,
				"ma": 359.97,
				"n": 51927e-8,
				"ep": 2456644.5
			}
		},
		{
			"n": "C/2012 Y1 (LINEAR)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 37.94,
				"e": .9469,
				"i": 20.96,
				"om": 193.25,
				"w": 268.83,
				"ma": 359.99,
				"n": .00421753,
				"ep": 2456309.5
			}
		},
		{
			"n": "C/2013 H1 (La Sagra)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 181.6,
				"e": .9854,
				"i": 27.09,
				"om": 84.97,
				"w": 136.58,
				"ma": 360,
				"n": 40275e-8,
				"ep": 2456430.5
			}
		},
		{
			"n": "C/2013 J6 (Catalina)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 59.84,
				"e": .9596,
				"i": 85.05,
				"om": 68.42,
				"w": 125.64,
				"ma": .1,
				"n": .0021292,
				"ep": 2456439.5
			}
		},
		{
			"n": "C/2013 K1 (Christensen)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 79.79,
				"e": .9881,
				"i": 42.34,
				"om": 125.91,
				"w": 171.33,
				"ma": 0,
				"n": .00138287,
				"ep": 2456443.5
			}
		},
		{
			"n": "C/2013 N4 (Borisov)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 48.04,
				"e": .9748,
				"i": 37.04,
				"om": 322.61,
				"w": 142.28,
				"ma": .07,
				"n": .00296005,
				"ep": 2456550.5
			}
		},
		{
			"n": "C/2013 PE67 (Catalina-Spacewatch)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 55.64,
				"e": .9668,
				"i": 116.72,
				"om": 325.96,
				"w": 59.48,
				"ma": 359.94,
				"n": .00237478,
				"ep": 2456609.5
			}
		},
		{
			"n": "C/2013 UQ4 (Catalina)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 60.57,
				"e": .9822,
				"i": 145.26,
				"om": 317.66,
				"w": 23.31,
				"ma": .01,
				"n": .00209083,
				"ep": 2456850.5
			}
		},
		{
			"n": "C/2014 C3 (NEOWISE)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 108.4,
				"e": .9828,
				"i": 151.78,
				"om": 204.41,
				"w": 345.88,
				"ma": .06,
				"n": 87329e-8,
				"ep": 2456744.5
			}
		},
		{
			"n": "C/2014 F2 (Tenagra)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 148.2,
				"e": .9709,
				"i": 119.06,
				"om": 267.45,
				"w": 86.04,
				"ma": 359.92,
				"n": 5463e-7,
				"ep": 2456875.5
			}
		},
		{
			"n": "C/2014 G3 (PANSTARRS)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 55.69,
				"e": .9156,
				"i": 155.82,
				"om": 4.54,
				"w": 147.8,
				"ma": 359.69,
				"n": .00237158,
				"ep": 2456925.5
			}
		},
		{
			"n": "C/2014 H1 (Christensen)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 141.2,
				"e": .9849,
				"i": 99.94,
				"om": 34.7,
				"w": 169.18,
				"ma": .01,
				"n": 58742e-8,
				"ep": 2456780.5
			}
		},
		{
			"n": "C/2014 M3 (Catalina)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 137.9,
				"e": .9824,
				"i": 164.91,
				"om": 80.37,
				"w": 93.74,
				"ma": .02,
				"n": 60864e-8,
				"ep": 2456865.5
			}
		},
		{
			"n": "C/2014 S2 (PANSTARRS)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 169.8,
				"e": .9876,
				"i": 64.67,
				"om": 8.12,
				"w": 87.81,
				"ma": .01,
				"n": 44545e-8,
				"ep": 2457397.5
			}
		},
		{
			"n": "C/2014 S3 (PANSTARRS)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 88.17,
				"e": .9768,
				"i": 169.32,
				"om": 356.05,
				"w": 293.14,
				"ma": .07,
				"n": .00119048,
				"ep": 2456938.5
			}
		},
		{
			"n": "C/2014 W5 (Lemmon-PANSTARRS)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 114.9,
				"e": .9791,
				"i": 145.49,
				"om": 245.34,
				"w": 281.26,
				"ma": 359.71,
				"n": 80025e-8,
				"ep": 2457065.5
			}
		},
		{
			"n": "C/2015 D4 (Borisov)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 78.82,
				"e": .9891,
				"i": 77.3,
				"om": 305.81,
				"w": 314.69,
				"ma": .22,
				"n": .00140848,
				"ep": 2457111.5
			}
		},
		{
			"n": "C/2015 F2 (Polonia)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 38.36,
				"e": .9684,
				"i": 28.69,
				"om": 262.55,
				"w": 352.03,
				"ma": .06,
				"n": .00414845,
				"ep": 2457156.5
			}
		},
		{
			"n": "C/2015 F4 (Jacques)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 116.4,
				"e": .9859,
				"i": 48.7,
				"om": 285.96,
				"w": 36.35,
				"ma": .01,
				"n": 78483e-8,
				"ep": 2457256.5
			}
		},
		{
			"n": "C/2015 K1 (MASTER)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 180.6,
				"e": .9858,
				"i": 29.38,
				"om": 5.18,
				"w": 280.2,
				"ma": .13,
				"n": 40609e-8,
				"ep": 2457264.5
			}
		},
		{
			"n": "C/2015 M3 (PANSTARRS)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 132.9,
				"e": .9733,
				"i": 65.95,
				"om": 143.09,
				"w": 123.76,
				"ma": 0,
				"n": 6433e-7,
				"ep": 2457268.5
			}
		},
		{
			"n": "C/2015 T4 (PANSTARRS)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 87.04,
				"e": .9736,
				"i": 87.92,
				"om": 251.79,
				"w": 270.14,
				"ma": 359.77,
				"n": .00121374,
				"ep": 2457372.5
			}
		},
		{
			"n": "C/2016 A8 (LINEAR)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 35.06,
				"e": .9463,
				"i": 148.21,
				"om": 111.23,
				"w": 130.27,
				"ma": 359.91,
				"n": .00474773,
				"ep": 2457611.5
			}
		},
		{
			"n": "C/2016 C2 (NEOWISE)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 64.02,
				"e": .9756,
				"i": 38.16,
				"om": 24.4,
				"w": 214.4,
				"ma": 359.93,
				"n": .00192411,
				"ep": 2457459.5
			}
		},
		{
			"n": "C/2016 T1 (Matheny)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 126.1,
				"e": .9818,
				"i": 129.82,
				"om": 56.23,
				"w": 137.35,
				"ma": 359.95,
				"n": 69604e-8,
				"ep": 2457717.5
			}
		},
		{
			"n": "C/2016 T2 (Matheny)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 101.8,
				"e": .9813,
				"i": 81.31,
				"om": 339.1,
				"w": 92.28,
				"ma": 359.97,
				"n": 95958e-8,
				"ep": 2457721.5
			}
		},
		{
			"n": "C/2016 T3 (PANSTARRS)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 142.3,
				"e": .9814,
				"i": 22.68,
				"om": 271.75,
				"w": 194.68,
				"ma": 359.96,
				"n": 58063e-8,
				"ep": 2457929.5
			}
		},
		{
			"n": "C/2017 A1 (PANSTARRS)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 80.36,
				"e": .9715,
				"i": 49.79,
				"om": 121.07,
				"w": 2.04,
				"ma": 359.87,
				"n": .00136818,
				"ep": 2457793.5
			}
		},
		{
			"n": "C/2017 A3 (Elenin)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 43.35,
				"e": .9111,
				"i": 98.51,
				"om": 97.9,
				"w": 304.11,
				"ma": .04,
				"n": .00345319,
				"ep": 2457794.5
			}
		},
		{
			"n": "C/2017 C2 (PANSTARRS)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 98.46,
				"e": .9753,
				"i": 118.58,
				"om": 249.82,
				"w": 138.78,
				"ma": .05,
				"n": .00100882,
				"ep": 2457823.5
			}
		},
		{
			"n": "C/2017 D5 (PANSTARRS)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 112.7,
				"e": .9808,
				"i": 131.04,
				"om": 92.72,
				"w": 287.82,
				"ma": .05,
				"n": 82379e-8,
				"ep": 2457817.5
			}
		},
		{
			"n": "C/2017 M3 (PANSTARRS)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 174,
				"e": .9732,
				"i": 77.51,
				"om": 7,
				"w": 110.33,
				"ma": .08,
				"n": 42942e-8,
				"ep": 2458055.5
			}
		},
		{
			"n": "C/2018 E1 (ATLAS)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 54.49,
				"e": .9503,
				"i": 72.48,
				"om": 146.84,
				"w": 299.47,
				"ma": 359.99,
				"n": .00245035,
				"ep": 2458222.5
			}
		},
		{
			"n": "C/2018 V4 (Africano)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 210.8,
				"e": .9848,
				"i": 69,
				"om": 78.38,
				"w": .01,
				"ma": 359.97,
				"n": 32203e-8,
				"ep": 2458439.5
			}
		},
		{
			"n": "C/2018 X2 (Fitzsimmons)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 154.9,
				"e": .9863,
				"i": 23.07,
				"om": 340.83,
				"w": 162.05,
				"ma": 359.92,
				"n": 51124e-8,
				"ep": 2458524.5
			}
		},
		{
			"n": "C/2019 A9 (PANSTARRS)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 38.82,
				"e": .9633,
				"i": 84.34,
				"om": 278.37,
				"w": 237.8,
				"ma": 359.5,
				"n": .00407494,
				"ep": 2458567.5
			}
		},
		{
			"n": "C/2019 B1 (Africano)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 155.4,
				"e": .9897,
				"i": 123.36,
				"om": 290.43,
				"w": 174.88,
				"ma": 359.98,
				"n": 50878e-8,
				"ep": 2458524.5
			}
		},
		{
			"n": "C/2019 D1 (Flewelling)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 137.8,
				"e": .9885,
				"i": 34.1,
				"om": 231.72,
				"w": 70.48,
				"ma": .02,
				"n": 6093e-7,
				"ep": 2458653.5
			}
		},
		{
			"n": "C/2019 J1 (Lemmon)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 71.55,
				"e": .9654,
				"i": 24.55,
				"om": 98.09,
				"w": 167.79,
				"ma": .11,
				"n": .00162851,
				"ep": 2458652.5
			}
		},
		{
			"n": "C/2019 K5 (Young)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 151.1,
				"e": .9865,
				"i": 15.32,
				"om": 177.19,
				"w": 174.92,
				"ma": .04,
				"n": 53065e-8,
				"ep": 2458739.5
			}
		},
		{
			"n": "C/2019 LB7 (Kleyna)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 35.12,
				"e": .9293,
				"i": 164.23,
				"om": 3.29,
				"w": 335.89,
				"ma": .4,
				"n": .00473557,
				"ep": 2458653.5
			}
		},
		{
			"n": "C/2019 O2 (PANSTARRS)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 57.34,
				"e": .8311,
				"i": 93.29,
				"om": 48.31,
				"w": 129.66,
				"ma": 358.48,
				"n": .00226996,
				"ep": 2459374.5
			}
		},
		{
			"n": "C/2019 S4 (Lemmon)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 242.7,
				"e": .9858,
				"i": 92.03,
				"om": 63.17,
				"w": 71.35,
				"ma": 359.99,
				"n": 26068e-8,
				"ep": 2458897.5
			}
		},
		{
			"n": "C/2020 B2 (Lemmon)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 67.88,
				"e": .9592,
				"i": 55.7,
				"om": 354.34,
				"w": 143.63,
				"ma": .02,
				"n": .00176235,
				"ep": 2458883.5
			}
		},
		{
			"n": "C/2020 K4 (PANSTARRS)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 45.71,
				"e": .9612,
				"i": 125.91,
				"om": 264.11,
				"w": 310.29,
				"ma": .32,
				"n": .00318924,
				"ep": 2459016.5
			}
		},
		{
			"n": "C/2020 N2 (ATLAS)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 101.9,
				"e": .9824,
				"i": 161.03,
				"om": 257.08,
				"w": 331.23,
				"ma": 359.98,
				"n": 95817e-8,
				"ep": 2459060.5
			}
		},
		{
			"n": "C/2020 PV6 (PANSTARRS)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 41.7,
				"e": .945,
				"i": 128.24,
				"om": 329.14,
				"w": 71.38,
				"ma": .01,
				"n": .00366016,
				"ep": 2459487.5
			}
		},
		{
			"n": "C/2020 Q1 (Borisov)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 59.47,
				"e": .9779,
				"i": 142.92,
				"om": 52.38,
				"w": 9.88,
				"ma": .05,
				"n": .0021491,
				"ep": 2459098.5
			}
		},
		{
			"n": "C/2020 R2 (PANSTARRS)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 413.4,
				"e": .9887,
				"i": 53.22,
				"om": 195.09,
				"w": 211.71,
				"ma": 359.97,
				"n": 11726e-8,
				"ep": 2459412.5
			}
		},
		{
			"n": "C/2020 R4 (ATLAS)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 96.71,
				"e": .9894,
				"i": 164.46,
				"om": 323.27,
				"w": 46.71,
				"ma": .01,
				"n": .00103633,
				"ep": 2459286.5
			}
		},
		{
			"n": "C/2020 U3 (Rankin)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 64.65,
				"e": .9648,
				"i": 30.18,
				"om": 282.68,
				"w": 124.26,
				"ma": 359.86,
				"n": .00189606,
				"ep": 2459175.5
			}
		},
		{
			"n": "C/2020 X4 (Leonard)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 43.17,
				"e": .8794,
				"i": 80.49,
				"om": 161.91,
				"w": 139.91,
				"ma": .37,
				"n": .00347481,
				"ep": 2459273.5
			}
		},
		{
			"n": "C/2020 Y3 (ATLAS)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 151.1,
				"e": .9868,
				"i": 83.1,
				"om": 191.43,
				"w": 342.04,
				"ma": .04,
				"n": 53065e-8,
				"ep": 2459270.5
			}
		},
		{
			"n": "C/2021 A4 (NEOWISE)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 42.82,
				"e": .9732,
				"i": 111.57,
				"om": 307.08,
				"w": 204.67,
				"ma": 359.89,
				"n": .0035175,
				"ep": 2459261.5
			}
		},
		{
			"n": "C/2021 A10 (NEOWISE)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 92.8,
				"e": .9863,
				"i": 151.52,
				"om": 188.35,
				"w": 82.27,
				"ma": 359.95,
				"n": .00110251,
				"ep": 2459243.5
			}
		},
		{
			"n": "C/2021 B3 (NEOWISE)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 34.95,
				"e": .9382,
				"i": 119.49,
				"om": 67.28,
				"w": 293.56,
				"ma": 359.89,
				"n": .00477016,
				"ep": 2459261.5
			}
		},
		{
			"n": "C/2021 C3 (Catalina)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 63.34,
				"e": .9641,
				"i": 122.16,
				"om": 181.92,
				"w": 357.15,
				"ma": .09,
				"n": .00195518,
				"ep": 2459301.5
			}
		},
		{
			"n": "C/2021 G1 (Leonard)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 75.92,
				"e": .9549,
				"i": 131.57,
				"om": 270.7,
				"w": 107.5,
				"ma": 359.86,
				"n": .00148994,
				"ep": 2459325.5
			}
		},
		{
			"n": "C/2021 J2 (PANSTARRS)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 117.2,
				"e": .9599,
				"i": 156.21,
				"om": 23.33,
				"w": 172.06,
				"ma": .1,
				"n": 77681e-8,
				"ep": 2459611.5
			}
		},
		{
			"n": "C/2021 Q3 (ATLAS)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 74.71,
				"e": .9303,
				"i": 77.78,
				"om": 307.9,
				"w": 114.09,
				"ma": 359.98,
				"n": .00152629,
				"ep": 2459589.5
			}
		},
		{
			"n": "C/2021 U4 (Leonard)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 43.96,
				"e": .9593,
				"i": 152.88,
				"om": 241.8,
				"w": 237.29,
				"ma": 359.81,
				"n": .00338156,
				"ep": 2459514.5
			}
		},
		{
			"n": "C/2021 U5 (Catalina)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 217.1,
				"e": .9891,
				"i": 39.05,
				"om": 182.76,
				"w": 321.47,
				"ma": .01,
				"n": 30812e-8,
				"ep": 2459629.5
			}
		},
		{
			"n": "C/2022 J1 (Maury-Attard)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 47.72,
				"e": .9664,
				"i": 105.93,
				"om": 280.72,
				"w": 305.66,
				"ma": .28,
				"n": .00298988,
				"ep": 2459724.5
			}
		},
		{
			"n": "C/2022 J2 (Bok)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 92.44,
				"e": .9802,
				"i": 149.09,
				"om": 252.56,
				"w": 133.06,
				"ma": 359.9,
				"n": .00110896,
				"ep": 2459788.5
			}
		},
		{
			"n": "C/2022 L4 (PANSTARRS)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 254.2,
				"e": .9881,
				"i": 141.22,
				"om": 66.05,
				"w": 125.3,
				"ma": .05,
				"n": 24319e-8,
				"ep": 2459742.5
			}
		},
		{
			"n": "C/2022 N1 (Attard-Maury)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 37.07,
				"e": .96,
				"i": 164.74,
				"om": 301.86,
				"w": 41.07,
				"ma": 359.83,
				"n": .00436687,
				"ep": 2459792.5
			}
		},
		{
			"n": "C/2022 P3 (ZTF)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 243.3,
				"e": .9895,
				"i": 59.52,
				"om": 72.23,
				"w": .09,
				"ma": .02,
				"n": 25971e-8,
				"ep": 2459873.5
			}
		},
		{
			"n": "C/2022 U2 (ATLAS)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 95.68,
				"e": .9861,
				"i": 48.25,
				"om": 304.48,
				"w": 147.91,
				"ma": 359.99,
				"n": .00105311,
				"ep": 2459951.5
			}
		},
		{
			"n": "C/2022 V2 (Lemmon)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 36.85,
				"e": .944,
				"i": 98.91,
				"om": 332.87,
				"w": 168.95,
				"ma": 359.74,
				"n": .00440603,
				"ep": 2460190.5
			}
		},
		{
			"n": "C/2023 TD22 (Lemmon)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 48.08,
				"e": .951,
				"i": 170.49,
				"om": 5.56,
				"w": 32.53,
				"ma": 359.9,
				"n": .00295636,
				"ep": 2460537.5
			}
		},
		{
			"n": "C/2024 C4 (ATLAS)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 84.04,
				"e": .9825,
				"i": 79.29,
				"om": 220.69,
				"w": 321.52,
				"ma": .1,
				"n": .00127931,
				"ep": 2460420.5
			}
		},
		{
			"n": "C/2024 E2 (Bok)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 51.96,
				"e": .852,
				"i": 155.65,
				"om": 135.65,
				"w": 358.04,
				"ma": .38,
				"n": .00263148,
				"ep": 2460386.5
			}
		},
		{
			"n": "C/2024 G1 (Wierzchos)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 120.7,
				"e": .9674,
				"i": 95.4,
				"om": 30.6,
				"w": 128.23,
				"ma": 359.92,
				"n": 74326e-8,
				"ep": 2460500.5
			}
		},
		{
			"n": "C/2024 J2 (Wierzchos)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 146.1,
				"e": .9876,
				"i": 79.3,
				"om": 189.06,
				"w": 143.15,
				"ma": 359.98,
				"n": 55812e-8,
				"ep": 2460717.5
			}
		},
		{
			"n": "C/2024 PN7 (PANSTARRS)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 67.45,
				"e": .9774,
				"i": 101.21,
				"om": 358.58,
				"w": 74.27,
				"ma": 359.97,
				"n": .00177923,
				"ep": 2460635.5
			}
		},
		{
			"n": "C/2024 T3 (PANSTARRS)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 84.42,
				"e": .956,
				"i": 53.48,
				"om": 74.83,
				"w": 336.89,
				"ma": 360,
				"n": .00127068,
				"ep": 2460749.5
			}
		},
		{
			"n": "C/2024 V2 (Sarneczky)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 37.42,
				"e": .9668,
				"i": 95.97,
				"om": 102.19,
				"w": 13.69,
				"ma": .05,
				"n": .00430575,
				"ep": 2460630.5
			}
		},
		{
			"n": "C/2024 W1 (PANSTARRS)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 44.85,
				"e": .9429,
				"i": 83.2,
				"om": 310.73,
				"w": 256.73,
				"ma": 359.68,
				"n": .00328141,
				"ep": 2460657.5
			}
		},
		{
			"n": "C/2024 X2 (ATLAS)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 50.58,
				"e": .9273,
				"i": 109.22,
				"om": 122.52,
				"w": 315.78,
				"ma": 360,
				"n": .00273991,
				"ep": 2460863.5
			}
		},
		{
			"n": "C/2024 Y1 (Masek)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 61.74,
				"e": .9867,
				"i": 64.75,
				"om": 112.55,
				"w": 238.14,
				"ma": .07,
				"n": .00203167,
				"ep": 2460675.5
			}
		},
		{
			"n": "C/2025 K4 (Siverd)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 43.34,
				"e": .9416,
				"i": 38.54,
				"om": 297.08,
				"w": 326.94,
				"ma": 359.85,
				"n": .00345438,
				"ep": 2460842.5
			}
		},
		{
			"n": "C/2025 R1 (ATLAS)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 165.7,
				"e": .9881,
				"i": 110.03,
				"om": 60.4,
				"w": 77.55,
				"ma": 359.99,
				"n": 46208e-8,
				"ep": 2460980.5
			}
		},
		{
			"n": "C/2026 AZ17 (Bok)",
			"t": "COM2",
			"rk": 2,
			"kd": {
				"a": 64.79,
				"e": .9618,
				"i": 36.23,
				"om": 149.98,
				"w": 146.91,
				"ma": 359.64,
				"n": .00188991,
				"ep": 2461179.5
			}
		}
	];
	COMETS2.forEach((o) => {
		o.kind = "Comet";
	});
	SMALL.push.apply(SMALL, COMETS2);
	const PROBES = [
		{
			"n": "Voyager 1",
			"rk": 9,
			"c": [
				120,
				230,
				255
			],
			"launch": 1977,
			"note": "farthest human object — interstellar space",
			"p": [
				-32.065,
				-136.18,
				98.5296
			],
			"v": [
				-.00119599,
				-.00786129,
				.0056789
			],
			"ep": 2461232.5
		},
		{
			"n": "Voyager 2",
			"rk": 9,
			"c": [
				120,
				210,
				255
			],
			"launch": 1977,
			"note": "interstellar space (since 2018)",
			"p": [
				39.6912,
				-105.022,
				-89.1673
			],
			"v": [
				.00242767,
				-.0053948,
				-.00653671
			],
			"ep": 2461232.5
		},
		{
			"n": "Pioneer 10",
			"rk": 8,
			"c": [
				200,
				180,
				255
			],
			"launch": 1972,
			"note": "toward Aldebaran",
			"p": [
				24.013,
				139.1196,
				7.3639
			],
			"v": [
				70847e-8,
				.00679988,
				34835e-8
			],
			"ep": 2461232.5
		},
		{
			"n": "Pioneer 11",
			"rk": 8,
			"c": [
				200,
				180,
				255
			],
			"launch": 1973,
			"note": "first Saturn flyby",
			"p": [
				28.8958,
				-110.2903,
				28.114
			],
			"v": [
				.00233191,
				-.00583198,
				.00140466
			],
			"ep": 2461232.5
		},
		{
			"n": "New Horizons",
			"rk": 8,
			"c": [
				255,
				210,
				140
			],
			"launch": 2006,
			"note": "Pluto & Arrokoth flyby",
			"p": [
				20.5957,
				-61.6842,
				2.2672
			],
			"v": [
				.00306695,
				-.00721806,
				28407e-8
			],
			"ep": 2461232.5
		},
		{
			"n": "JWST",
			"rk": 6,
			"c": [
				255,
				170,
				120
			],
			"launch": 2021,
			"note": "Sun–Earth L2 observatory",
			"p": [
				.3198,
				-.9761,
				-.0018
			],
			"v": [
				.01610974,
				.0053675,
				4694e-8
			],
			"ep": 2461232.5
		},
		{
			"n": "Parker Solar Probe",
			"rk": 6,
			"c": [
				255,
				200,
				90
			],
			"launch": 2018,
			"note": "fastest human object — grazing the Sun",
			"p": [
				.5245,
				-.4604,
				-.0366
			],
			"v": [
				.00905282,
				.00166762,
				-49849e-8
			],
			"ep": 2461232.5
		},
		{
			"n": "Gaia",
			"rk": 6,
			"c": [
				190,
				220,
				255
			],
			"launch": 2013,
			"note": "at L2 — mapped 1.8 billion stars",
			"p": [
				-.1545,
				-1.0296,
				5e-4
			],
			"v": [
				.01667287,
				-.00291597,
				-2175e-8
			],
			"ep": 2461232.5
		},
		{
			"n": "JUICE",
			"rk": 6,
			"c": [
				160,
				235,
				190
			],
			"launch": 2023,
			"note": "en route to Jupiter’s icy moons (2031)",
			"p": [
				.9652,
				-1.0511,
				-.0031
			],
			"v": [
				.00629175,
				.01077249,
				2806e-8
			],
			"ep": 2461232.5
		},
		{
			"n": "BepiColombo",
			"rk": 6,
			"c": [
				255,
				190,
				140
			],
			"launch": 2018,
			"note": "en route to Mercury orbit",
			"p": [
				.1594,
				-.4179,
				-.0485
			],
			"v": [
				.02075527,
				.0114862,
				-96565e-8
			],
			"ep": 2461232.5
		},
		{
			"n": "Lucy",
			"rk": 6,
			"c": [
				220,
				200,
				150
			],
			"launch": 2021,
			"note": "touring the Jupiter trojans",
			"p": [
				-3.7374,
				-3.0009,
				-.2502
			],
			"v": [
				-4203e-8,
				-.00592255,
				666e-7
			],
			"ep": 2461232.5
		},
		{
			"n": "Psyche",
			"rk": 6,
			"c": [
				200,
				190,
				230
			],
			"launch": 2023,
			"note": "to the metal asteroid Psyche (2029)",
			"p": [
				.9768,
				1.03,
				-.0596
			],
			"v": [
				-.01075502,
				.01258478,
				-37429e-8
			],
			"ep": 2461232.5
		},
		{
			"n": "Europa Clipper",
			"rk": 6,
			"c": [
				170,
				215,
				255
			],
			"launch": 2024,
			"note": "to Europa’s subsurface ocean (2030)",
			"p": [
				-.0758,
				-1.4334,
				-.0137
			],
			"v": [
				.01367679,
				.00632608,
				-39132e-8
			],
			"ep": 2461232.5
		}
	];
	const TNOS = [
		{
			"n": "Sedna",
			"rk": 500,
			"c": [
				220,
				130,
				110
			],
			"note": "extreme detached TNO (aphelion ~937 AU)",
			"kd": {
				"a": 544,
				"e": .86,
				"i": 11.9,
				"om": 145,
				"w": 311,
				"ma": 359,
				"n": 777e-7,
				"ep": 2461200.5
			}
		},
		{
			"n": "Quaoar",
			"rk": 545,
			"c": [
				200,
				170,
				150
			],
			"note": "TNO with ring & moon Weywot",
			"kd": {
				"a": 43.2,
				"e": .0352,
				"i": 7.99,
				"om": 189,
				"w": 163,
				"ma": 293,
				"n": .00348,
				"ep": 2461200.5
			}
		},
		{
			"n": "Gonggong",
			"rk": 615,
			"c": [
				210,
				140,
				120
			],
			"note": "scattered-disc dwarf, moon Xiangliu",
			"kd": {
				"a": 66.9,
				"e": .504,
				"i": 30.9,
				"om": 337,
				"w": 207,
				"ma": 112,
				"n": .0018,
				"ep": 2461200.5
			}
		},
		{
			"n": "Orcus",
			"rk": 460,
			"c": [
				180,
				190,
				210
			],
			"note": "plutino, moon Vanth",
			"kd": {
				"a": 39.4,
				"e": .221,
				"i": 20.6,
				"om": 268,
				"w": 73.6,
				"ma": 189,
				"n": .00399,
				"ep": 2461200.5
			}
		},
		{
			"n": "Varuna",
			"rk": 335,
			"c": [
				205,
				175,
				150
			],
			"note": "classical TNO",
			"kd": {
				"a": 43.2,
				"e": .0516,
				"i": 17.1,
				"om": 97.2,
				"w": 273,
				"ma": 116,
				"n": .00347,
				"ep": 2461200.5
			}
		},
		{
			"n": "Ixion",
			"rk": 310,
			"c": [
				200,
				160,
				140
			],
			"note": "plutino",
			"kd": {
				"a": 39.3,
				"e": .244,
				"i": 19.7,
				"om": 71.1,
				"w": 301,
				"ma": 295,
				"n": .00399,
				"ep": 2461200.5
			}
		},
		{
			"n": "Salacia",
			"rk": 430,
			"c": [
				190,
				195,
				205
			],
			"note": "TNO, moon Actaea",
			"kd": {
				"a": 42.1,
				"e": .105,
				"i": 23.9,
				"om": 280,
				"w": 309,
				"ma": 135,
				"n": .00361,
				"ep": 2461200.5
			}
		},
		{
			"n": "Mani",
			"rk": 400,
			"c": [
				205,
				180,
				160
			],
			"note": "2002 MS4, large classical TNO",
			"kd": {
				"a": 41.6,
				"e": .148,
				"i": 17.7,
				"om": 216,
				"w": 215,
				"ma": 230,
				"n": .00367,
				"ep": 2461200.5
			}
		},
		{
			"n": "Arrokoth",
			"rk": 18,
			"c": [
				210,
				160,
				130
			],
			"note": "New Horizons 2019 flyby (contact binary)",
			"kd": {
				"a": 44.1,
				"e": .0356,
				"i": 2.45,
				"om": 159,
				"w": 189,
				"ma": 311,
				"n": .00337,
				"ep": 2461200.5
			}
		},
		{
			"n": "Chariklo",
			"rk": 129,
			"c": [
				180,
				200,
				210
			],
			"note": "largest Centaur, has rings",
			"kd": {
				"a": 15.7,
				"e": .171,
				"i": 23.4,
				"om": 300,
				"w": 241,
				"ma": 130,
				"n": .0158,
				"ep": 2461200.5
			}
		},
		{
			"n": "Chiron",
			"rk": 105,
			"c": [
				190,
				205,
				215
			],
			"note": "Centaur / comet 95P",
			"kd": {
				"a": 13.7,
				"e": .38,
				"i": 6.93,
				"om": 209,
				"w": 339,
				"ma": 217,
				"n": .0195,
				"ep": 2461200.5
			}
		},
		{
			"n": "Pholus",
			"rk": 100,
			"c": [
				210,
				150,
				120
			],
			"note": "very red Centaur",
			"kd": {
				"a": 20.3,
				"e": .575,
				"i": 24.8,
				"om": 119,
				"w": 355,
				"ma": 137,
				"n": .0108,
				"ep": 2461200.5
			}
		}
	];
	TNOS.forEach((t) => {
		t.kind = /Chariklo|Chiron|Pholus/.test(t.n) ? "Centaur" : "Trans-Neptunian object";
		t.moons = [];
		t.slug = "dwarf-planets";
	});
	PROBES.forEach((p) => {
		p.kind = "Spacecraft";
		p.moons = [];
	});
	const MOON_EPH = {
		"Phobos": {
			"p": [
				-.702245,
				-.650733,
				.288786
			],
			"n": [
				.432804,
				-.068142,
				.898909
			],
			"w": 19.70206424,
			"ep": 2461232.5
		},
		"Europa": {
			"p": [
				-.943438,
				-.33025,
				-.029339
			],
			"n": [
				-.020442,
				-.03038,
				.999329
			],
			"w": 1.76932274,
			"ep": 2461232.5
		},
		"Elara": {
			"p": [
				.87104,
				.028839,
				-.490365
			],
			"n": [
				.491197,
				-.059056,
				.869044
			],
			"w": .03326608,
			"ep": 2461232.5
		},
		"Pasiphae": {
			"p": [
				-.083777,
				-.994813,
				.057698
			],
			"n": [
				.441223,
				-.088949,
				-.892978
			],
			"w": .00868105,
			"ep": 2461232.5
		},
		"Adrastea": {
			"p": [
				-.825838,
				-.562979,
				-.032344
			],
			"n": [
				-.014695,
				-.035853,
				.999249
			],
			"w": 21.07456742,
			"ep": 2461232.5
		},
		"Metis": {
			"p": [
				.87443,
				.48421,
				.030212
			],
			"n": [
				-.014707,
				-.035789,
				.999251
			],
			"w": 21.27963743,
			"ep": 2461232.5
		},
		"Themisto": {
			"p": [
				-.836453,
				-.434427,
				.334095
			],
			"n": [
				-.076209,
				.695899,
				.714084
			],
			"w": .03378441,
			"ep": 2461232.5
		},
		"Kalyke": {
			"p": [
				.450267,
				-.873164,
				-.186667
			],
			"n": [
				.069022,
				.24247,
				-.967701
			],
			"w": .00827215,
			"ep": 2461232.5
		},
		"Iocaste": {
			"p": [
				-.735453,
				-.584564,
				.342628
			],
			"n": [
				.030689,
				-.533887,
				-.844999
			],
			"w": .01703524,
			"ep": 2461232.5
		},
		"Hermippe": {
			"p": [
				-.892325,
				.042992,
				-.449342
			],
			"n": [
				.412873,
				-.324644,
				-.850965
			],
			"w": .00791607,
			"ep": 2461232.5
		},
		"Eurydome": {
			"p": [
				.604205,
				-.61826,
				.502684
			],
			"n": [
				.394185,
				-.316344,
				-.86287
			],
			"w": .00629745,
			"ep": 2461232.5
		},
		"Euanthe": {
			"p": [
				-.260741,
				.862547,
				-.43362
			],
			"n": [
				-.227855,
				-.491451,
				-.84057
			],
			"w": .00772261,
			"ep": 2461232.5
		},
		"Orthosie": {
			"p": [
				.019582,
				-.902782,
				.429651
			],
			"n": [
				-.337906,
				-.410423,
				-.846979
			],
			"w": .00744634,
			"ep": 2461232.5
		},
		"Pasithee": {
			"p": [
				.283558,
				.958931,
				-.006752
			],
			"n": [
				.247043,
				-.079851,
				-.965709
			],
			"w": .01472325,
			"ep": 2461232.5
		},
		"Hegemone": {
			"p": [
				-.396468,
				-.910265,
				-.11929
			],
			"n": [
				.44417,
				-.076475,
				-.892673
			],
			"w": .00726165,
			"ep": 2461232.5
		},
		"Aoede": {
			"p": [
				.855031,
				-.423176,
				-.299739
			],
			"n": [
				-.396652,
				-.161359,
				-.903676
			],
			"w": .00796009,
			"ep": 2461232.5
		},
		"Helike": {
			"p": [
				.565554,
				-.746888,
				-.349726
			],
			"n": [
				.012146,
				.431555,
				-.902005
			],
			"w": .00882612,
			"ep": 2461232.5
		},
		"Carpo": {
			"p": [
				-.52836,
				-.443399,
				-.724039
			],
			"n": [
				-.377486,
				-.641182,
				.668124
			],
			"w": .00499208,
			"ep": 2461232.5
		},
		"Eukelade": {
			"p": [
				.938227,
				-.291888,
				-.185825
			],
			"n": [
				-.227713,
				-.116495,
				-.966734
			],
			"w": .00753921,
			"ep": 2461232.5
		},
		"Kore": {
			"p": [
				.842988,
				-.026927,
				.537258
			],
			"n": [
				.468117,
				-.455333,
				-.757323
			],
			"w": .00436499,
			"ep": 2461232.5
		},
		"Dia": {
			"p": [
				.856366,
				-.254458,
				.44932
			],
			"n": [
				-.436672,
				.10755,
				.893169
			],
			"w": .01358405,
			"ep": 2461232.5
		},
		"S2016 J1": {
			"p": [
				-.750471,
				-.344032,
				.564301
			],
			"n": [
				-.399995,
				-.443263,
				-.802198
			],
			"w": .00892591,
			"ep": 2461232.5
		},
		"S2003 J18": {
			"p": [
				-.287311,
				.811237,
				.509261
			],
			"n": [
				-.501007,
				.325866,
				-.80175
			],
			"w": .01183039,
			"ep": 2461232.5
		},
		"Eirene": {
			"p": [
				.96129,
				-.086056,
				-.261757
			],
			"n": [
				-.267052,
				-.057007,
				-.961995
			],
			"w": .01152338,
			"ep": 2461232.5
		},
		"S2017 J1": {
			"p": [
				.892252,
				.446171,
				-.069418
			],
			"n": [
				.222073,
				-.567464,
				-.792886
			],
			"w": .00517975,
			"ep": 2461232.5
		},
		"S2003 J19": {
			"p": [
				.771418,
				-.636119,
				-.016299
			],
			"n": [
				.130489,
				.18321,
				-.974375
			],
			"w": .00804881,
			"ep": 2461232.5
		},
		"Valetudo": {
			"p": [
				-.286981,
				.806689,
				-.516619
			],
			"n": [
				-.348589,
				.414387,
				.840696
			],
			"w": .01472848,
			"ep": 2461232.5
		},
		"S2017 J2": {
			"p": [
				-.448131,
				.893598,
				-.025713
			],
			"n": [
				.201711,
				.073051,
				-.976717
			],
			"w": .01043585,
			"ep": 2461232.5
		},
		"S2017 J3": {
			"p": [
				-.450937,
				-.814135,
				-.365842
			],
			"n": [
				.498286,
				.110436,
				-.85995
			],
			"w": .01474159,
			"ep": 2461232.5
		},
		"S2017 J7": {
			"p": [
				-.988563,
				-.007121,
				.150643
			],
			"n": [
				-.120456,
				-.563748,
				-.817116
			],
			"w": .00735571,
			"ep": 2461232.5
		},
		"S2017 J8": {
			"p": [
				.653722,
				-.716953,
				-.242128
			],
			"n": [
				-.096717,
				.238181,
				-.966393
			],
			"w": .00643164,
			"ep": 2461232.5
		},
		"S2017 J9": {
			"p": [
				-.533162,
				-.733772,
				.42109
			],
			"n": [
				-.170205,
				-.394525,
				-.902984
			],
			"w": .00726682,
			"ep": 2461232.5
		},
		"Ersa": {
			"p": [
				.132677,
				-.984045,
				-.118541
			],
			"n": [
				.511094,
				-.034547,
				.85883
			],
			"w": .02057734,
			"ep": 2461232.5
		},
		"Mimas": {
			"p": [
				.926232,
				.300824,
				-.227154
			],
			"n": [
				.076743,
				.439497,
				.89496
			],
			"w": 6.66706137,
			"ep": 2461232.5
		},
		"Tethys": {
			"p": [
				-.989863,
				-.08089,
				.116742
			],
			"n": [
				.066559,
				.461925,
				.884418
			],
			"w": 3.32830737,
			"ep": 2461232.5
		},
		"Dione": {
			"p": [
				-.884559,
				.442871,
				-.146356
			],
			"n": [
				.085279,
				.462052,
				.882743
			],
			"w": 2.2957181,
			"ep": 2461232.5
		},
		"Rhea": {
			"p": [
				.938212,
				-.33433,
				.08934
			],
			"n": [
				.082307,
				.466334,
				.880771
			],
			"w": 1.39085452,
			"ep": 2461232.5
		},
		"Titan": {
			"p": [
				.878117,
				-.455188,
				.147358
			],
			"n": [
				.08808,
				.456528,
				.885338
			],
			"w": .39404324,
			"ep": 2461232.5
		},
		"Iapetus": {
			"p": [
				-.2203,
				-.939995,
				.260534
			],
			"n": [
				.1922,
				.220029,
				.956371
			],
			"w": .07920296,
			"ep": 2461232.5
		},
		"Phoebe": {
			"p": [
				.970221,
				.209186,
				-.122114
			],
			"n": [
				-.12435,
				-.002484,
				-.992235
			],
			"w": .01049762,
			"ep": 2461232.5
		},
		"Epimetheus": {
			"p": [
				-.935069,
				.342218,
				-.092379
			],
			"n": [
				.080667,
				.459217,
				.884654
			],
			"w": 9.21712947,
			"ep": 2461232.5
		},
		"Helene": {
			"p": [
				-.649636,
				-.644685,
				.402932
			],
			"n": [
				.084392,
				.465575,
				.880975
			],
			"w": 2.26657757,
			"ep": 2461232.5
		},
		"Calypso": {
			"p": [
				-.58791,
				.742606,
				-.320779
			],
			"n": [
				.07193,
				.442969,
				.893647
			],
			"w": 3.32840933,
			"ep": 2461232.5
		},
		"Atlas": {
			"p": [
				.649464,
				-.697586,
				.302607
			],
			"n": [
				.08546,
				.462403,
				.882542
			],
			"w": 10.44272262,
			"ep": 2461232.5
		},
		"Pandora": {
			"p": [
				.629301,
				-.712137,
				.311194
			],
			"n": [
				.08613,
				.461865,
				.882759
			],
			"w": 10.07598049,
			"ep": 2461232.5
		},
		"Ymir": {
			"p": [
				-.99207,
				-.052405,
				.114238
			],
			"n": [
				-.117376,
				.061314,
				-.991193
			],
			"w": .00909934,
			"ep": 2461232.5
		},
		"Paaliaq": {
			"p": [
				-.79426,
				-.24326,
				-.556754
			],
			"n": [
				-.32419,
				-.605324,
				.726969
			],
			"w": .04052445,
			"ep": 2461232.5
		},
		"Tarvos": {
			"p": [
				-.669151,
				.354691,
				.653018
			],
			"n": [
				.554278,
				-.347102,
				.756502
			],
			"w": .0041537,
			"ep": 2461232.5
		},
		"Suttungr": {
			"p": [
				.815055,
				.573162,
				-.084682
			],
			"n": [
				-.105747,
				.003459,
				-.994387
			],
			"w": .00531562,
			"ep": 2461232.5
		},
		"Kiviuq": {
			"p": [
				-.388202,
				.667307,
				.635611
			],
			"n": [
				-.193355,
				-.733326,
				.651802
			],
			"w": .01788365,
			"ep": 2461232.5
		},
		"Mundilfari": {
			"p": [
				.799993,
				-.586509,
				.126563
			],
			"n": [
				.18969,
				.047107,
				-.980713
			],
			"w": .00453798,
			"ep": 2461232.5
		},
		"Albiorix": {
			"p": [
				.793773,
				-.266313,
				-.546811
			],
			"n": [
				.526142,
				-.150358,
				.836999
			],
			"w": .00251041,
			"ep": 2461232.5
		},
		"Skathi": {
			"p": [
				-.512267,
				-.716794,
				.473063
			],
			"n": [
				-.466906,
				-.229873,
				-.853907
			],
			"w": .00535881,
			"ep": 2461232.5
		},
		"Erriapus": {
			"p": [
				.63613,
				.441936,
				-.63248
			],
			"n": [
				.57999,
				.266738,
				.769716
			],
			"w": .01645065,
			"ep": 2461232.5
		},
		"Narvi": {
			"p": [
				.849972,
				.49173,
				.189076
			],
			"n": [
				-.186449,
				.616439,
				-.76501
			],
			"w": .0103223,
			"ep": 2461232.5
		},
		"Methone": {
			"p": [
				-.928366,
				-.284373,
				.239307
			],
			"n": [
				.085764,
				.462588,
				.882415
			],
			"w": 6.23609487,
			"ep": 2461232.5
		},
		"Pallene": {
			"p": [
				-.410953,
				.822302,
				-.393621
			],
			"n": [
				.086585,
				.465018,
				.881057
			],
			"w": 5.45150895,
			"ep": 2461232.5
		},
		"Polydeuces": {
			"p": [
				-.210542,
				.874171,
				-.437603
			],
			"n": [
				.088529,
				.462847,
				.882006
			],
			"w": 2.22053726,
			"ep": 2461232.5
		},
		"Bebhionn": {
			"p": [
				-.217685,
				-.727195,
				.651
			],
			"n": [
				-.021903,
				.670467,
				.741616
			],
			"w": .02004141,
			"ep": 2461232.5
		},
		"Farbauti": {
			"p": [
				.20345,
				-.920831,
				-.332683
			],
			"n": [
				.136028,
				.363078,
				-.921776
			],
			"w": .00417388,
			"ep": 2461232.5
		},
		"Fenrir": {
			"p": [
				.185918,
				.982503,
				-.011065
			],
			"n": [
				-.304109,
				.04683,
				-.951486
			],
			"w": .00654419,
			"ep": 2461232.5
		},
		"Hati": {
			"p": [
				.497907,
				.825484,
				-.265831
			],
			"n": [
				-.102944,
				-.248103,
				-.963248
			],
			"w": .00438877,
			"ep": 2461232.5
		},
		"Hyrrokkin": {
			"p": [
				.872075,
				.294412,
				.390905
			],
			"n": [
				.440451,
				-.124074,
				-.889161
			],
			"w": .00583084,
			"ep": 2461232.5
		},
		"Kari": {
			"p": [
				.00594,
				-.938513,
				.345193
			],
			"n": [
				-.472792,
				-.306815,
				-.826034
			],
			"w": .00218806,
			"ep": 2461232.5
		},
		"Loge": {
			"p": [
				-.991621,
				.124747,
				-.033549
			],
			"n": [
				.006693,
				-.209745,
				-.977733
			],
			"w": .00410068,
			"ep": 2461232.5
		},
		"Surtur": {
			"p": [
				.813847,
				.523287,
				-.252635
			],
			"n": [
				-.27296,
				-.039535,
				-.961213
			],
			"w": .00526591,
			"ep": 2461232.5
		},
		"Greip": {
			"p": [
				.037823,
				.992726,
				-.114297
			],
			"n": [
				-.014442,
				-.113824,
				-.993396
			],
			"w": .00673506,
			"ep": 2461232.5
		},
		"Aegaeon": {
			"p": [
				-.977749,
				-.131367,
				.163555
			],
			"n": [
				.085498,
				.462419,
				.88253
			],
			"w": 7.77561153,
			"ep": 2461232.5
		},
		"Skrymir": {
			"p": [
				.523165,
				-.850623,
				-.052327
			],
			"n": [
				-.043903,
				.034418,
				-.998443
			],
			"w": .00258253,
			"ep": 2461232.5
		},
		"Gerd": {
			"p": [
				.458351,
				-.888001,
				-.037
			],
			"n": [
				-.13895,
				-.030477,
				-.98983
			],
			"w": .02406527,
			"ep": 2461232.5
		},
		"S2004 S26": {
			"p": [
				.853973,
				.515705,
				-.069125
			],
			"n": [
				-595e-6,
				-.131884,
				-.991265
			],
			"w": .00324595,
			"ep": 2461232.5
		},
		"Eggther": {
			"p": [
				.84489,
				-.513408,
				.150244
			],
			"n": [
				.218585,
				.074995,
				-.972932
			],
			"w": .00796152,
			"ep": 2461232.5
		},
		"Thiazzi": {
			"p": [
				.590307,
				-.791438,
				.158633
			],
			"n": [
				.400542,
				.116588,
				-.908831
			],
			"w": .00183245,
			"ep": 2461232.5
		},
		"S2004 S34": {
			"p": [
				.950176,
				.227469,
				-.213127
			],
			"n": [
				-.176457,
				-.171114,
				-.969321
			],
			"w": .00531647,
			"ep": 2461232.5
		},
		"Alvaldi": {
			"p": [
				-.400028,
				-.915098,
				.050729
			],
			"n": [
				-.020752,
				-.046293,
				-.998712
			],
			"w": .0038331,
			"ep": 2461232.5
		},
		"Ariel": {
			"p": [
				-.167996,
				.171392,
				.970774
			],
			"n": [
				.211683,
				.968069,
				-.134282
			],
			"w": 2.49295257,
			"ep": 2461232.5
		},
		"Miranda": {
			"p": [
				.892361,
				-.318252,
				-.320013
			],
			"n": [
				.285472,
				.947208,
				-.145952
			],
			"w": 4.44519183,
			"ep": 2461232.5
		},
		"Cordelia": {
			"p": [
				.209749,
				.088459,
				.973745
			],
			"n": [
				.209742,
				.968645,
				-.133175
			],
			"w": 18.76898909,
			"ep": 2461232.5
		},
		"Ophelia": {
			"p": [
				.047029,
				.12463,
				.991088
			],
			"n": [
				.209596,
				.968867,
				-.131781
			],
			"w": 16.72112292,
			"ep": 2461232.5
		},
		"Bianca": {
			"p": [
				.517335,
				.015896,
				.855635
			],
			"n": [
				.173696,
				.977066,
				-.123172
			],
			"w": 14.47703037,
			"ep": 2461232.5
		},
		"Portia": {
			"p": [
				.034527,
				-.103392,
				-.994041
			],
			"n": [
				.188635,
				.977431,
				-.095112
			],
			"w": 12.22771758,
			"ep": 2461232.5
		},
		"Rosalind": {
			"p": [
				-.864414,
				.093472,
				-.494016
			],
			"n": [
				.195162,
				.967903,
				-.158354
			],
			"w": 11.18071225,
			"ep": 2461232.5
		},
		"Belinda": {
			"p": [
				.121428,
				-.148091,
				-.981491
			],
			"n": [
				.230008,
				.966092,
				-.117312
			],
			"w": 10.06432105,
			"ep": 2461232.5
		},
		"Puck": {
			"p": [
				-.165706,
				-.113627,
				-.979607
			],
			"n": [
				.22193,
				.963564,
				-.149307
			],
			"w": 8.33791541,
			"ep": 2461232.5
		},
		"Stephano": {
			"p": [
				-.91262,
				.251447,
				.322334
			],
			"n": [
				-.108626,
				.610976,
				-.784161
			],
			"w": .0128508,
			"ep": 2461232.5
		},
		"Trinculo": {
			"p": [
				-.622656,
				-.772168,
				-.12671
			],
			"n": [
				-.080326,
				.22415,
				-.971239
			],
			"w": .00578025,
			"ep": 2461232.5
		},
		"Margaret": {
			"p": [
				.215644,
				-.605456,
				-.766107
			],
			"n": [
				.23881,
				-.728042,
				.642593
			],
			"w": 93549e-8,
			"ep": 2461232.5
		},
		"Perdita": {
			"p": [
				.977166,
				-.171715,
				.125141
			],
			"n": [
				.189865,
				.970053,
				-.15149
			],
			"w": 9.80517436,
			"ep": 2461232.5
		},
		"Cupid": {
			"p": [
				-.286579,
				-.043793,
				-.957055
			],
			"n": [
				.196469,
				.975038,
				-.103446
			],
			"w": 10.13576686,
			"ep": 2461232.5
		},
		"Nereid": {
			"p": [
				.234698,
				.968904,
				.07837
			],
			"n": [
				-.058163,
				-.06648,
				.996091
			],
			"w": .01744669,
			"ep": 2461232.5
		},
		"Naiad": {
			"p": [
				.339904,
				.906255,
				.25133
			],
			"n": [
				.390437,
				-.379104,
				.838951
			],
			"w": 21.34712351,
			"ep": 2461232.5
		},
		"Galatea": {
			"p": [
				-.520861,
				.713758,
				.468245
			],
			"n": [
				.360639,
				-.313182,
				.878554
			],
			"w": 14.65959212,
			"ep": 2461232.5
		},
		"Larissa": {
			"p": [
				.841084,
				-.29573,
				-.452903
			],
			"n": [
				.363611,
				-.310773,
				.878184
			],
			"w": 11.33191818,
			"ep": 2461232.5
		},
		"Proteus": {
			"p": [
				-.910537,
				-.318761,
				.263276
			],
			"n": [
				.364921,
				-.320372,
				.874182
			],
			"w": 5.59841516,
			"ep": 2461232.5
		},
		"Psamathe": {
			"p": [
				.830092,
				-.249885,
				-.498502
			],
			"n": [
				-.522597,
				-.660473,
				-.539136
			],
			"w": 47504e-8,
			"ep": 2461232.5
		},
		"Neso": {
			"p": [
				-.594083,
				.579441,
				-.557955
			],
			"n": [
				.578665,
				-.173964,
				-.796796
			],
			"w": 14904e-8,
			"ep": 2461232.5
		},
		"Hippocamp": {
			"p": [
				.839442,
				.51924,
				-.160395
			],
			"n": [
				.363779,
				-.317617,
				.875662
			],
			"w": 6.62074649,
			"ep": 2461232.5
		},
		"Charon": {
			"p": [
				.723025,
				.470854,
				-.505501
			],
			"n": [
				-.678067,
				.623667,
				-.388928
			],
			"w": .98371051,
			"ep": 2461232.5
		},
		"Nix": {
			"p": [
				-.734872,
				-.563228,
				.377806
			],
			"n": [
				-.677995,
				.62396,
				-.388582
			],
			"w": .25278344,
			"ep": 2461232.5
		},
		"Kerberos": {
			"p": [
				-.521293,
				-.782518,
				-.340468
			],
			"n": [
				-.674928,
				.622202,
				-.396657
			],
			"w": .17822497,
			"ep": 2461232.5
		},
		"Deimos": {
			"p": [
				-.885759,
				.222828,
				.407159
			],
			"n": [
				.40411,
				-.061269,
				.912656
			],
			"w": 4.97701303,
			"ep": 2461232.5
		},
		"Io": {
			"p": [
				.732325,
				-.680808,
				-.014143
			],
			"n": [
				-.01423,
				-.036065,
				.999248
			],
			"w": 3.55155183,
			"ep": 2461232.5
		},
		"Ganymede": {
			"p": [
				-.620169,
				-.783499,
				-.038987
			],
			"n": [
				-.014568,
				-.038187,
				.999164
			],
			"w": .87820795,
			"ep": 2461232.5
		},
		"Callisto": {
			"p": [
				-.37055,
				-.928188,
				-.034058
			],
			"n": [
				-.013463,
				-.031297,
				.999419
			],
			"w": .37648624,
			"ep": 2461232.5
		},
		"Amalthea": {
			"p": [
				.97325,
				-.229734,
				.002563
			],
			"n": [
				-.009977,
				-.031116,
				.999466
			],
			"w": 12.61230463,
			"ep": 2461232.5
		},
		"Himalia": {
			"p": [
				.756457,
				-.477088,
				-.447392
			],
			"n": [
				.273023,
				-.391252,
				.878852
			],
			"w": .02200159,
			"ep": 2461232.5
		},
		"Sinope": {
			"p": [
				-.866317,
				-.481106,
				-.13428
			],
			"n": [
				.276881,
				-.238792,
				-.930761
			],
			"w": .00657815,
			"ep": 2461232.5
		},
		"Lysithea": {
			"p": [
				-.977048,
				.120304,
				-.175795
			],
			"n": [
				-.209939,
				-.403992,
				.890346
			],
			"w": .02589465,
			"ep": 2461232.5
		},
		"Carme": {
			"p": [
				-.965429,
				.066844,
				.251951
			],
			"n": [
				-.234988,
				.19516,
				-.952205
			],
			"w": .00827962,
			"ep": 2461232.5
		},
		"Ananke": {
			"p": [
				-.484331,
				-.774516,
				-.406876
			],
			"n": [
				.496492,
				.139598,
				-.856743
			],
			"w": .01012408,
			"ep": 2461232.5
		},
		"Leda": {
			"p": [
				.544579,
				.745923,
				-.383449
			],
			"n": [
				-.026418,
				.472218,
				.881086
			],
			"w": .02644873,
			"ep": 2461232.5
		},
		"Thebe": {
			"p": [
				.043187,
				.998666,
				.028315
			],
			"n": [
				-.031039,
				-.026986,
				.999154
			],
			"w": 9.58571136,
			"ep": 2461232.5
		},
		"Callirrhoe": {
			"p": [
				-.927889,
				-.341392,
				-.149911
			],
			"n": [
				.301262,
				-.44956,
				-.840914
			],
			"w": .00947176,
			"ep": 2461232.5
		},
		"Megaclite": {
			"p": [
				-.814226,
				-.569417,
				.11314
			],
			"n": [
				.227817,
				-.492642,
				-.839883
			],
			"w": .00540885,
			"ep": 2461232.5
		},
		"Taygete": {
			"p": [
				-.364409,
				-.927471,
				.083684
			],
			"n": [
				.220841,
				-.173369,
				-.959777
			],
			"w": .0053201,
			"ep": 2461232.5
		},
		"Chaldene": {
			"p": [
				-.954745,
				-.181665,
				.235499
			],
			"n": [
				-.263769,
				.151292,
				-.952647
			],
			"w": .01360674,
			"ep": 2461232.5
		},
		"Harpalyke": {
			"p": [
				-.854521,
				-.133309,
				-.502019
			],
			"n": [
				.477093,
				.180696,
				-.860076
			],
			"w": .01182151,
			"ep": 2461232.5
		},
		"Erinome": {
			"p": [
				.385697,
				-.901484,
				.196379
			],
			"n": [
				.22236,
				-.115748,
				-.96807
			],
			"w": .01425673,
			"ep": 2461232.5
		},
		"Isonoe": {
			"p": [
				-.836061,
				.47308,
				.277844
			],
			"n": [
				-.229514,
				.158395,
				-.96033
			],
			"w": .00636321,
			"ep": 2461232.5
		},
		"Praxidike": {
			"p": [
				-.98988,
				-.139973,
				.023363
			],
			"n": [
				.052257,
				-.512608,
				-.857031
			],
			"w": .01141326,
			"ep": 2461232.5
		},
		"Autonoe": {
			"p": [
				-.709219,
				.50157,
				-.495414
			],
			"n": [
				.253241,
				-.474573,
				-.843001
			],
			"w": .00972229,
			"ep": 2461232.5
		},
		"Thyone": {
			"p": [
				.150024,
				.845473,
				-.512511
			],
			"n": [
				-.319311,
				-.449164,
				-.834441
			],
			"w": .00943143,
			"ep": 2461232.5
		},
		"Aitne": {
			"p": [
				.357629,
				.91952,
				.16305
			],
			"n": [
				.217647,
				.08772,
				-.972078
			],
			"w": .00503013,
			"ep": 2461232.5
		},
		"Euporie": {
			"p": [
				.544855,
				.651257,
				.528202
			],
			"n": [
				.401514,
				.35038,
				-.84618
			],
			"w": .01429834,
			"ep": 2461232.5
		},
		"Sponde": {
			"p": [
				-.303474,
				-.928783,
				-.212756
			],
			"n": [
				-.481687,
				.342195,
				-.806771
			],
			"w": .00546121,
			"ep": 2461232.5
		},
		"Kale": {
			"p": [
				.01109,
				.962342,
				.271614
			],
			"n": [
				.005056,
				.271574,
				-.962404
			],
			"w": .01115361,
			"ep": 2461232.5
		},
		"Mneme": {
			"p": [
				-.82586,
				-.329879,
				-.457313
			],
			"n": [
				.455906,
				.08662,
				-.885803
			],
			"w": .00515194,
			"ep": 2461232.5
		},
		"Thelxinoe": {
			"p": [
				-.584496,
				.660296,
				.471566
			],
			"n": [
				-.493795,
				.171695,
				-.852459
			],
			"w": .01185142,
			"ep": 2461232.5
		},
		"Arche": {
			"p": [
				.901543,
				.38492,
				.197628
			],
			"n": [
				.223146,
				-.022293,
				-.97453
			],
			"w": .00547911,
			"ep": 2461232.5
		},
		"Kallichore": {
			"p": [
				-.859685,
				-.468195,
				-.204291
			],
			"n": [
				.122015,
				.200141,
				-.97214
			],
			"w": .00475412,
			"ep": 2461232.5
		},
		"Cyllene": {
			"p": [
				.389747,
				-.72027,
				.573855
			],
			"n": [
				.275621,
				-.503337,
				-.818954
			],
			"w": .0065842,
			"ep": 2461232.5
		},
		"Herse": {
			"p": [
				-.562999,
				.789423,
				-.244627
			],
			"n": [
				.148609,
				-.194471,
				-.969586
			],
			"w": .00604842,
			"ep": 2461232.5
		},
		"S2010 J1": {
			"p": [
				-.43514,
				-.890087,
				.13564
			],
			"n": [
				.160439,
				-.224894,
				-.961084
			],
			"w": .00531404,
			"ep": 2461232.5
		},
		"S2010 J2": {
			"p": [
				-.881262,
				.07833,
				-.466091
			],
			"n": [
				.464409,
				-.039596,
				-.884735
			],
			"w": .00532646,
			"ep": 2461232.5
		},
		"S2011 J2": {
			"p": [
				.925793,
				-.298804,
				.231566
			],
			"n": [
				.32547,
				.318437,
				-.890319
			],
			"w": .00776303,
			"ep": 2461232.5
		},
		"Philophrosyne": {
			"p": [
				-.832079,
				-.318942,
				.453784
			],
			"n": [
				-.303738,
				-.422543,
				-.853932
			],
			"w": .01727628,
			"ep": 2461232.5
		},
		"Eupheme": {
			"p": [
				.80263,
				-.596461,
				.004363
			],
			"n": [
				-.30574,
				-.417679,
				-.855609
			],
			"w": .00954162,
			"ep": 2461232.5
		},
		"Pandia": {
			"p": [
				.942174,
				.291575,
				.165204
			],
			"n": [
				-.269556,
				.366455,
				.890534
			],
			"w": .02364777,
			"ep": 2461232.5
		},
		"S2017 J5": {
			"p": [
				.803197,
				-.593547,
				-.050759
			],
			"n": [
				.096665,
				.213936,
				-.972053
			],
			"w": .0076636,
			"ep": 2461232.5
		},
		"S2017 J6": {
			"p": [
				-.259542,
				.93587,
				-.238296
			],
			"n": [
				.444427,
				-.103323,
				-.889837
			],
			"w": .00582285,
			"ep": 2461232.5
		},
		"S2011 J1": {
			"p": [
				.242971,
				-.931132,
				.271954
			],
			"n": [
				.009628,
				-.278027,
				-.960525
			],
			"w": .01235333,
			"ep": 2461232.5
		},
		"Enceladus": {
			"p": [
				.843772,
				-.504681,
				.182607
			],
			"n": [
				.085518,
				.462317,
				.882581
			],
			"w": 4.58553698,
			"ep": 2461232.5
		},
		"Hyperion": {
			"p": [
				-.968876,
				.245295,
				-.033323
			],
			"n": [
				.082609,
				.447276,
				.890573
			],
			"w": .3137019,
			"ep": 2461232.5
		},
		"Janus": {
			"p": [
				-.492853,
				.788838,
				-.367193
			],
			"n": [
				.082631,
				.462531,
				.882744
			],
			"w": 9.0549038,
			"ep": 2461232.5
		},
		"Telesto": {
			"p": [
				-.390726,
				-.798631,
				.457735
			],
			"n": [
				.067122,
				.471221,
				.879458
			],
			"w": 3.32947876,
			"ep": 2461232.5
		},
		"Prometheus": {
			"p": [
				-.472037,
				.798837,
				-.372882
			],
			"n": [
				.085607,
				.462507,
				.882473
			],
			"w": 10.253316,
			"ep": 2461232.5
		},
		"Pan": {
			"p": [
				.765581,
				.536374,
				-.355231
			],
			"n": [
				.085511,
				.462427,
				.882524
			],
			"w": 10.92630466,
			"ep": 2461232.5
		},
		"Ijiraq": {
			"p": [
				.54895,
				.390856,
				-.738841
			],
			"n": [
				.462374,
				.594377,
				.657971
			],
			"w": .00634707,
			"ep": 2461232.5
		},
		"Siarnaq": {
			"p": [
				-218e-6,
				-.766024,
				-.642812
			],
			"n": [
				.372816,
				-.596531,
				.710745
			],
			"w": .00334823,
			"ep": 2461232.5
		},
		"Thrymr": {
			"p": [
				-.09914,
				-.994763,
				.02485
			],
			"n": [
				-.109821,
				-.013882,
				-.993854
			],
			"w": .00465702,
			"ep": 2461232.5
		},
		"Aegir": {
			"p": [
				.458482,
				.883858,
				.092674
			],
			"n": [
				-.137922,
				.173783,
				-.975078
			],
			"w": .00396592,
			"ep": 2461232.5
		},
		"Bergelmir": {
			"p": [
				-.303291,
				-.942575,
				-.139886
			],
			"n": [
				-.302632,
				.234479,
				-.923815
			],
			"w": .00472113,
			"ep": 2461232.5
		},
		"Bestla": {
			"p": [
				.874286,
				.213996,
				-.435695
			],
			"n": [
				-.270342,
				-.530828,
				-.803204
			],
			"w": .0022507,
			"ep": 2461232.5
		},
		"Fornjot": {
			"p": [
				-.250012,
				-.958491,
				.137073
			],
			"n": [
				-.21086,
				-.084272,
				-.973877
			],
			"w": .0065519,
			"ep": 2461232.5
		},
		"Skoll": {
			"p": [
				.941221,
				-.199946,
				-.272257
			],
			"n": [
				-.317609,
				-.249421,
				-.91483
			],
			"w": .00891398,
			"ep": 2461232.5
		},
		"Anthe": {
			"p": [
				-.278864,
				.861338,
				-.424654
			],
			"n": [
				.085291,
				.462662,
				.882423
			],
			"w": 6.05917868,
			"ep": 2461232.5
		},
		"Jarnsaxa": {
			"p": [
				.561449,
				.82398,
				-.076374
			],
			"n": [
				.166033,
				-.202586,
				-.965087
			],
			"w": .00762665,
			"ep": 2461232.5
		},
		"Tarqeq": {
			"p": [
				.068843,
				-.96323,
				-.259707
			],
			"n": [
				.744471,
				-.12369,
				.656097
			],
			"w": .00613512,
			"ep": 2461232.5
		},
		"Gridr": {
			"p": [
				.631808,
				.738218,
				-.236332
			],
			"n": [
				-.030291,
				-.281148,
				-.959186
			],
			"w": .00913348,
			"ep": 2461232.5
		},
		"Angrboda": {
			"p": [
				-.99089,
				-.12581,
				.048041
			],
			"n": [
				-.047142,
				-.010108,
				-.998837
			],
			"w": .00845529,
			"ep": 2461232.5
		},
		"S2004 S29": {
			"p": [
				-.868941,
				.43596,
				.234268
			],
			"n": [
				.457843,
				.52834,
				.715008
			],
			"w": .0173011,
			"ep": 2461232.5
		},
		"Beli": {
			"p": [
				-.724559,
				.633623,
				.271175
			],
			"n": [
				-.402792,
				-.070025,
				-.912609
			],
			"w": .00488228,
			"ep": 2461232.5
		},
		"Gunnlod": {
			"p": [
				.966984,
				-.105288,
				-.23207
			],
			"n": [
				-.252124,
				-.26274,
				-.931344
			],
			"w": .00579978,
			"ep": 2461232.5
		},
		"Geirrod": {
			"p": [
				-.956091,
				.23189,
				-.179211
			],
			"n": [
				.255941,
				.362764,
				-.896045
			],
			"w": .01580047,
			"ep": 2461232.5
		},
		"Umbriel": {
			"p": [
				.340724,
				.055953,
				.938497
			],
			"n": [
				.210681,
				.968297,
				-.134219
			],
			"w": 1.51614791,
			"ep": 2461232.5
		},
		"Titania": {
			"p": [
				.962795,
				-.230586,
				-.140907
			],
			"n": [
				.212037,
				.967883,
				-.135067
			],
			"w": .72171809,
			"ep": 2461232.5
		},
		"Oberon": {
			"p": [
				.968168,
				-.226178,
				-.107216
			],
			"n": [
				.210858,
				.967792,
				-.137543
			],
			"w": .46669195,
			"ep": 2461232.5
		},
		"Cressida": {
			"p": [
				.941043,
				-.192162,
				.27841
			],
			"n": [
				.229733,
				.967132,
				-.108985
			],
			"w": 13.63902049,
			"ep": 2461232.5
		},
		"Desdemona": {
			"p": [
				.599975,
				-.220581,
				-.769009
			],
			"n": [
				.24165,
				.966307,
				-.08864
			],
			"w": 13.20489787,
			"ep": 2461232.5
		},
		"Juliet": {
			"p": [
				.579321,
				-.19217,
				-.792122
			],
			"n": [
				.163039,
				.979491,
				-.118387
			],
			"w": 12.59664295,
			"ep": 2461232.5
		},
		"Caliban": {
			"p": [
				.2499,
				-.745221,
				-.61822
			],
			"n": [
				.049189,
				.647424,
				-.760541
			],
			"w": .0108827,
			"ep": 2461232.5
		},
		"Sycorax": {
			"p": [
				-.153152,
				.976062,
				.154429
			],
			"n": [
				-.42703,
				.075561,
				-.901075
			],
			"w": .00306932,
			"ep": 2461232.5
		},
		"Prospero": {
			"p": [
				.68539,
				-.716842,
				.127977
			],
			"n": [
				-.348009,
				-.476842,
				-.807163
			],
			"w": .0015868,
			"ep": 2461232.5
		},
		"Setebos": {
			"p": [
				.873736,
				.004213,
				-.486382
			],
			"n": [
				-.482662,
				.131241,
				-.865918
			],
			"w": .00285049,
			"ep": 2461232.5
		},
		"Francisco": {
			"p": [
				-.735395,
				-.432974,
				-.521276
			],
			"n": [
				.521716,
				.129149,
				-.843287
			],
			"w": .01997527,
			"ep": 2461232.5
		},
		"Ferdinand": {
			"p": [
				-.593647,
				-.804517,
				-.018292
			],
			"n": [
				-.155114,
				.136703,
				-.978393
			],
			"w": .00119866,
			"ep": 2461232.5
		},
		"Mab": {
			"p": [
				-.466403,
				.012245,
				-.884488
			],
			"n": [
				.229329,
				.96739,
				-.107536
			],
			"w": 6.85356241,
			"ep": 2461232.5
		},
		"Triton": {
			"p": [
				.800601,
				.083356,
				-.593372
			],
			"n": [
				-.527024,
				.56914,
				-.63113
			],
			"w": 1.06914096,
			"ep": 2461232.5
		},
		"Thalassa": {
			"p": [
				.928434,
				.218769,
				-.300251
			],
			"n": [
				.358393,
				-.314675,
				.878939
			],
			"w": 20.16495687,
			"ep": 2461232.5
		},
		"Despina": {
			"p": [
				.826862,
				.543297,
				-.145357
			],
			"n": [
				.360563,
				-.313744,
				.878384
			],
			"w": 18.77458967,
			"ep": 2461232.5
		},
		"Halimede": {
			"p": [
				-.644995,
				-.10193,
				.757358
			],
			"n": [
				-.569309,
				.725211,
				-.387241
			],
			"w": .00335136,
			"ep": 2461232.5
		},
		"Sao": {
			"p": [
				-.228916,
				-.909119,
				-.347994
			],
			"n": [
				.690356,
				-.403652,
				.600394
			],
			"w": .00177425,
			"ep": 2461232.5
		},
		"Laomedeia": {
			"p": [
				.880658,
				.17528,
				-.440134
			],
			"n": [
				.471413,
				-.416436,
				.7774
			],
			"w": 91528e-8,
			"ep": 2461232.5
		},
		"Hydra": {
			"p": [
				-.131395,
				.412131,
				.9016
			],
			"n": [
				-.679587,
				.624698,
				-.384596
			],
			"w": .16447268,
			"ep": 2461232.5
		},
		"Styx": {
			"p": [
				-.734883,
				-.586059,
				.341295
			],
			"n": [
				-.678042,
				.624262,
				-.388015
			],
			"w": .27465807,
			"ep": 2461232.5
		}
	};
	function moonDirAt(eph, ang) {
		const ca = Math.cos(ang), sa = Math.sin(ang), p0 = eph.p, n = eph.n;
		const dot = p0[0] * n[0] + p0[1] * n[1] + p0[2] * n[2];
		const cr = [
			n[1] * p0[2] - n[2] * p0[1],
			n[2] * p0[0] - n[0] * p0[2],
			n[0] * p0[1] - n[1] * p0[0]
		];
		const e = [
			p0[0] * ca + cr[0] * sa + n[0] * dot * (1 - ca),
			p0[1] * ca + cr[1] * sa + n[1] * dot * (1 - ca),
			p0[2] * ca + cr[2] * sa + n[2] * dot * (1 - ca)
		];
		return [
			e[0],
			e[2],
			e[1]
		];
	}
	function camDir2(v) {
		const cyw = Math.cos(S.yaw), syw = Math.sin(S.yaw), cp2 = Math.cos(S.pitch), sp2 = Math.sin(S.pitch);
		const x1 = v[0] * cyw + v[2] * syw, z1 = -v[0] * syw + v[2] * cyw;
		return [x1, -(v[1] * cp2 - z1 * sp2)];
	}
	const EXTRA_MOONS = {
		"Jupiter": [
			{
				"n": "Metis",
				"am": 128.1,
				"rk": 21.5
			},
			{
				"n": "Adrastea",
				"am": 129,
				"rk": 8.2
			},
			{
				"n": "Thebe",
				"am": 218.7,
				"rk": 49.3
			},
			{
				"n": "Themisto",
				"am": 8678,
				"rk": 5
			},
			{
				"n": "Elara",
				"am": 9861.8,
				"rk": 40
			},
			{
				"n": "Leda",
				"am": 10997.3,
				"rk": 5
			},
			{
				"n": "Lysithea",
				"am": 11280.2,
				"rk": 12
			},
			{
				"n": "Pandia",
				"am": 11643.9,
				"rk": 5
			},
			{
				"n": "Himalia",
				"am": 12167.6,
				"rk": 85
			},
			{
				"n": "Ersa",
				"am": 12615.4,
				"rk": 5
			},
			{
				"n": "Dia",
				"am": 15522.8,
				"rk": 5
			},
			{
				"n": "Philophrosyne",
				"am": 15869.1,
				"rk": 5
			},
			{
				"n": "Iocaste",
				"am": 15893.3,
				"rk": 5
			},
			{
				"n": "Valetudo",
				"am": 16858,
				"rk": 5
			},
			{
				"n": "Euporie",
				"am": 17175.7,
				"rk": 5
			},
			{
				"n": "S2017 J3",
				"am": 17187.6,
				"rk": 5
			},
			{
				"n": "Pasithee",
				"am": 17501.5,
				"rk": 5
			},
			{
				"n": "Erinome",
				"am": 17893.2,
				"rk": 5
			},
			{
				"n": "Chaldene",
				"am": 18160.4,
				"rk": 5
			},
			{
				"n": "S2011 J1",
				"am": 19091.8,
				"rk": 5
			},
			{
				"n": "Harpalyke",
				"am": 19222.6,
				"rk": 5
			},
			{
				"n": "Thelxinoe",
				"am": 19259,
				"rk": 5
			},
			{
				"n": "Praxidike",
				"am": 19262.4,
				"rk": 5
			},
			{
				"n": "S2003 J18",
				"am": 19309,
				"rk": 5
			},
			{
				"n": "Eirene",
				"am": 19825.3,
				"rk": 5
			},
			{
				"n": "Kale",
				"am": 20192.3,
				"rk": 5
			},
			{
				"n": "S2017 J2",
				"am": 20650.4,
				"rk": 5
			},
			{
				"n": "Ananke",
				"am": 20755.1,
				"rk": 10
			},
			{
				"n": "Eupheme",
				"am": 21120.2,
				"rk": 5
			},
			{
				"n": "Thyone",
				"am": 21507.4,
				"rk": 5
			},
			{
				"n": "Callirrhoe",
				"am": 21635.7,
				"rk": 5
			},
			{
				"n": "Autonoe",
				"am": 21735.3,
				"rk": 5
			},
			{
				"n": "S2016 J1",
				"am": 22067.5,
				"rk": 5
			},
			{
				"n": "Pasiphae",
				"am": 22313.3,
				"rk": 18
			},
			{
				"n": "Helike",
				"am": 22559.4,
				"rk": 5
			},
			{
				"n": "Orthosie",
				"am": 22898.2,
				"rk": 5
			},
			{
				"n": "Carme",
				"am": 23280.2,
				"rk": 15
			},
			{
				"n": "Hermippe",
				"am": 23504.2,
				"rk": 5
			},
			{
				"n": "S2003 J19",
				"am": 23678.4,
				"rk": 5
			},
			{
				"n": "Kalyke",
				"am": 23686.9,
				"rk": 5
			},
			{
				"n": "Aoede",
				"am": 23851.9,
				"rk": 5
			},
			{
				"n": "Euanthe",
				"am": 23985.3,
				"rk": 5
			},
			{
				"n": "Eukelade",
				"am": 24152.2,
				"rk": 5
			},
			{
				"n": "S2011 J2",
				"am": 24200.7,
				"rk": 5
			},
			{
				"n": "S2017 J7",
				"am": 24356.2,
				"rk": 5
			},
			{
				"n": "S2017 J9",
				"am": 24509.5,
				"rk": 5
			},
			{
				"n": "S2017 J5",
				"am": 24662.5,
				"rk": 5
			},
			{
				"n": "Hegemone",
				"am": 24878,
				"rk": 5
			},
			{
				"n": "Carpo",
				"am": 25507.2,
				"rk": 5
			},
			{
				"n": "Cyllene",
				"am": 25709.3,
				"rk": 5
			},
			{
				"n": "Sinope",
				"am": 26053.7,
				"rk": 14
			},
			{
				"n": "Isonoe",
				"am": 26769,
				"rk": 5
			},
			{
				"n": "S2017 J8",
				"am": 26965,
				"rk": 5
			},
			{
				"n": "Eurydome",
				"am": 27077.9,
				"rk": 5
			},
			{
				"n": "S2010 J2",
				"am": 27710.1,
				"rk": 5
			},
			{
				"n": "Megaclite",
				"am": 27731.3,
				"rk": 5
			},
			{
				"n": "Herse",
				"am": 27917.8,
				"rk": 5
			},
			{
				"n": "Mneme",
				"am": 27959.3,
				"rk": 5
			},
			{
				"n": "S2017 J6",
				"am": 28101,
				"rk": 5
			},
			{
				"n": "Arche",
				"am": 28224.2,
				"rk": 5
			},
			{
				"n": "S2017 J1",
				"am": 28906.1,
				"rk": 5
			},
			{
				"n": "Taygete",
				"am": 28919.2,
				"rk": 5
			},
			{
				"n": "Sponde",
				"am": 28923.7,
				"rk": 5
			},
			{
				"n": "S2010 J1",
				"am": 28978.4,
				"rk": 5
			},
			{
				"n": "Aitne",
				"am": 29679,
				"rk": 5
			},
			{
				"n": "Kallichore",
				"am": 29986.4,
				"rk": 5
			},
			{
				"n": "Kore",
				"am": 31781.9,
				"rk": 5
			}
		],
		"Saturn": [
			{
				"n": "Pan",
				"am": 133.6,
				"rk": 17.2
			},
			{
				"n": "Atlas",
				"am": 137.7,
				"rk": 20.5
			},
			{
				"n": "Prometheus",
				"am": 139.4,
				"rk": 68.2
			},
			{
				"n": "Pandora",
				"am": 141.2,
				"rk": 52.2
			},
			{
				"n": "Epimetheus",
				"am": 150,
				"rk": 64.9
			},
			{
				"n": "Janus",
				"am": 151.4,
				"rk": 101.7
			},
			{
				"n": "Aegaeon",
				"am": 167.5,
				"rk": 5
			},
			{
				"n": "Methone",
				"am": 194,
				"rk": 5
			},
			{
				"n": "Anthe",
				"am": 197.7,
				"rk": 5
			},
			{
				"n": "Pallene",
				"am": 212.2,
				"rk": 5
			},
			{
				"n": "Telesto",
				"am": 294.6,
				"rk": 16.3
			},
			{
				"n": "Calypso",
				"am": 294.7,
				"rk": 15.3
			},
			{
				"n": "Helene",
				"am": 379.8,
				"rk": 16
			},
			{
				"n": "Polydeuces",
				"am": 383.6,
				"rk": 5
			},
			{
				"n": "Hyperion",
				"am": 1434.2,
				"rk": 133
			},
			{
				"n": "Paaliaq",
				"am": 6458.7,
				"rk": 5
			},
			{
				"n": "Gerd",
				"am": 9140.7,
				"rk": 5
			},
			{
				"n": "Bebhionn",
				"am": 9838.7,
				"rk": 5
			},
			{
				"n": "Kiviuq",
				"am": 9946.3,
				"rk": 5
			},
			{
				"n": "S2004 S29",
				"am": 10857.3,
				"rk": 5
			},
			{
				"n": "Erriapus",
				"am": 11144.2,
				"rk": 5
			},
			{
				"n": "Geirrod",
				"am": 11520,
				"rk": 5
			},
			{
				"n": "Phoebe",
				"am": 13411.8,
				"rk": 106.6
			},
			{
				"n": "Skoll",
				"am": 14694.5,
				"rk": 5
			},
			{
				"n": "Narvi",
				"am": 14734.1,
				"rk": 5
			},
			{
				"n": "Gridr",
				"am": 15860.6,
				"rk": 5
			},
			{
				"n": "Ijiraq",
				"am": 15983,
				"rk": 5
			},
			{
				"n": "Ymir",
				"am": 16342.5,
				"rk": 5
			},
			{
				"n": "Angrboda",
				"am": 16774.6,
				"rk": 5
			},
			{
				"n": "Eggther",
				"am": 17150.2,
				"rk": 5
			},
			{
				"n": "Jarnsaxa",
				"am": 17266.1,
				"rk": 5
			},
			{
				"n": "Greip",
				"am": 18012.2,
				"rk": 5
			},
			{
				"n": "Tarqeq",
				"am": 18983.5,
				"rk": 5
			},
			{
				"n": "Hyrrokkin",
				"am": 19037.3,
				"rk": 5
			},
			{
				"n": "Skathi",
				"am": 19386.6,
				"rk": 5
			},
			{
				"n": "Fenrir",
				"am": 19476,
				"rk": 5
			},
			{
				"n": "Fornjot",
				"am": 19841.7,
				"rk": 5
			},
			{
				"n": "Gunnlod",
				"am": 20171.5,
				"rk": 5
			},
			{
				"n": "Surtur",
				"am": 20471.5,
				"rk": 5
			},
			{
				"n": "Suttungr",
				"am": 21002,
				"rk": 5
			},
			{
				"n": "Tarvos",
				"am": 21181,
				"rk": 5
			},
			{
				"n": "Thrymr",
				"am": 21236.3,
				"rk": 5
			},
			{
				"n": "S2004 S34",
				"am": 21667.7,
				"rk": 5
			},
			{
				"n": "Hati",
				"am": 22019.8,
				"rk": 5
			},
			{
				"n": "Bergelmir",
				"am": 22063.1,
				"rk": 5
			},
			{
				"n": "Mundilfari",
				"am": 22201.7,
				"rk": 5
			},
			{
				"n": "Beli",
				"am": 22242.7,
				"rk": 5
			},
			{
				"n": "Farbauti",
				"am": 23548.3,
				"rk": 5
			},
			{
				"n": "Aegir",
				"am": 24034.2,
				"rk": 5
			},
			{
				"n": "Siarnaq",
				"am": 24339.1,
				"rk": 5
			},
			{
				"n": "Loge",
				"am": 24782.5,
				"rk": 5
			},
			{
				"n": "Alvaldi",
				"am": 24922.9,
				"rk": 5
			},
			{
				"n": "Albiorix",
				"am": 26064.5,
				"rk": 5
			},
			{
				"n": "Skrymir",
				"am": 28494.5,
				"rk": 5
			},
			{
				"n": "S2004 S26",
				"am": 29063.4,
				"rk": 5
			},
			{
				"n": "Bestla",
				"am": 29924.6,
				"rk": 5
			},
			{
				"n": "Kari",
				"am": 31178.6,
				"rk": 5
			},
			{
				"n": "Thiazzi",
				"am": 34265.7,
				"rk": 5
			}
		],
		"Uranus": [
			{
				"n": "Cordelia",
				"am": 49.7,
				"rk": 13
			},
			{
				"n": "Ophelia",
				"am": 53.7,
				"rk": 16
			},
			{
				"n": "Bianca",
				"am": 59.1,
				"rk": 22
			},
			{
				"n": "Cressida",
				"am": 61.6,
				"rk": 33
			},
			{
				"n": "Desdemona",
				"am": 62.8,
				"rk": 29
			},
			{
				"n": "Juliet",
				"am": 64.7,
				"rk": 42
			},
			{
				"n": "Portia",
				"am": 66.1,
				"rk": 55
			},
			{
				"n": "Rosalind",
				"am": 70.1,
				"rk": 29
			},
			{
				"n": "Cupid",
				"am": 74.8,
				"rk": 5
			},
			{
				"n": "Belinda",
				"am": 75.3,
				"rk": 34
			},
			{
				"n": "Perdita",
				"am": 76.6,
				"rk": 5
			},
			{
				"n": "Puck",
				"am": 85.5,
				"rk": 77
			},
			{
				"n": "Mab",
				"am": 97.4,
				"rk": 5
			},
			{
				"n": "Francisco",
				"am": 4617.2,
				"rk": 5
			},
			{
				"n": "Stephano",
				"am": 6713.3,
				"rk": 5
			},
			{
				"n": "Caliban",
				"am": 7141.4,
				"rk": 5
			},
			{
				"n": "Trinculo",
				"am": 10132.7,
				"rk": 5
			},
			{
				"n": "Sycorax",
				"am": 14479.9,
				"rk": 5
			},
			{
				"n": "Setebos",
				"am": 16347.5,
				"rk": 5
			},
			{
				"n": "Margaret",
				"am": 20504.6,
				"rk": 5
			},
			{
				"n": "Prospero",
				"am": 22034.3,
				"rk": 5
			},
			{
				"n": "Ferdinand",
				"am": 27381.9,
				"rk": 5
			}
		],
		"Neptune": [
			{
				"n": "Naiad",
				"am": 48.2,
				"rk": 29
			},
			{
				"n": "Thalassa",
				"am": 50.1,
				"rk": 40
			},
			{
				"n": "Despina",
				"am": 52.5,
				"rk": 74
			},
			{
				"n": "Galatea",
				"am": 61.9,
				"rk": 79
			},
			{
				"n": "Larissa",
				"am": 73.5,
				"rk": 96
			},
			{
				"n": "Hippocamp",
				"am": 105.2,
				"rk": 5
			},
			{
				"n": "Halimede",
				"am": 16290.5,
				"rk": 5
			},
			{
				"n": "Sao",
				"am": 24377,
				"rk": 5
			},
			{
				"n": "Laomedeia",
				"am": 33110,
				"rk": 5
			},
			{
				"n": "Psamathe",
				"am": 57254.5,
				"rk": 5
			},
			{
				"n": "Neso",
				"am": 85266.7,
				"rk": 5
			}
		],
		"Pluto": [{
			"n": "Styx",
			"am": 40.4,
			"rk": 5.2
		}, {
			"n": "Kerberos",
			"am": 56.5,
			"rk": 6
		}]
	};
	for (const b of [...PLANETS, ...DWARFS]) {
		const ex = EXTRA_MOONS[b.n];
		if (ex) for (const m of ex) {
			m.minor = true;
			m.c = [
				152,
				152,
				158
			];
			b.moons.push(m);
		}
	}
	const SUNHIT = { sunhit: true };
	PLANETS.forEach((p) => {
		p.kind = "Planet";
		p.moons.forEach((m) => {
			m.kind = "Moon";
			m.parent = p.n;
			m.pc = p.c;
		});
	});
	DWARFS.forEach((p) => {
		p.kind = "Dwarf planet";
		p.moons.forEach((m) => {
			m.kind = "Moon";
			m.parent = p.n;
			m.pc = p.c;
		});
	});
	SUN.kind = "Star";
	const SOLAR_BODIES = [
		...PLANETS,
		...DWARFS,
		...TNOS
	];
	const D2R = Math.PI / 180;
	const EPOCH_JD = (/* @__PURE__ */ new Date()).getTime() / 864e5 + 2440587.5;
	function solarJD() {
		return EPOCH_JD + S.tOffsetDays;
	}
	function jdToDate(jd) {
		return /* @__PURE__ */ new Date((jd - 2440587.5) * 864e5);
	}
	function dateStr(jd) {
		return jdToDate(jd).toLocaleDateString("en-US", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric"
		});
	}
	function keplerEcl(k, T, E0) {
		const a = k[0] + k[1] * T, e = k[2] + k[3] * T, I = (k[4] + k[5] * T) * D2R;
		const L = k[6] + k[7] * T, wb = k[8] + k[9] * T, O = (k[10] + k[11] * T) * D2R;
		const om = wb * D2R - O;
		let M = (L - wb) * D2R;
		M = Math.atan2(Math.sin(M), Math.cos(M));
		let E = E0 !== void 0 ? E0 : M;
		for (let i = 0; i < 6; i++) E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
		return {
			a,
			e,
			I,
			om,
			O,
			E
		};
	}
	function orbPoint(el, E) {
		const { a, e, I, om, O } = el;
		const xp = a * (Math.cos(E) - e), yp = a * Math.sqrt(1 - e * e) * Math.sin(E);
		const cO = Math.cos(O), sO = Math.sin(O), cI = Math.cos(I), sI = Math.sin(I), cw = Math.cos(om), sw = Math.sin(om);
		return [
			(cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp,
			(cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp,
			sw * sI * xp + cw * sI * yp
		];
	}
	function keplerSB(kd, jd) {
		let M = (kd.ma + kd.n * (jd - kd.ep)) * D2R;
		M = Math.atan2(Math.sin(M), Math.cos(M));
		const e = kd.e;
		let E = M + e * Math.sin(M) * (1 + e * Math.cos(M));
		for (let i = 0; i < 18; i++) {
			const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
			E -= dE;
			if (Math.abs(dE) < 1e-8) break;
		}
		return {
			a: kd.a,
			e: kd.e,
			I: kd.i * D2R,
			om: kd.w * D2R,
			O: kd.om * D2R,
			E
		};
	}
	function eclToWorld(xe, ye, ze) {
		const r = Math.hypot(xe, ye, ze) || 1e-12, R = scale(r * AU_PC) / r;
		return [
			xe * R,
			ze * R,
			ye * R
		];
	}
	function updateSolarPositions(jd) {
		const T = (jd - 2451545) / 36525;
		for (const b of SOLAR_BODIES) {
			b._el = b.k ? keplerEcl(b.k, T) : b.kd ? keplerSB(b.kd, jd) : null;
			b._e = b._el ? orbPoint(b._el, b._el.E) : null;
			if (b._e) b._r = Math.hypot(b._e[0], b._e[1], b._e[2]);
		}
		for (const p of PROBES) {
			const dt = jd - p.ep;
			p._e = [
				p.p[0] + p.v[0] * dt,
				p.p[1] + p.v[1] * dt,
				p.p[2] + p.v[2] * dt
			];
			p._r = Math.hypot(p._e[0], p._e[1], p._e[2]);
		}
	}
	const FAC = {
		kepler: {
			c: [
				122,
				162,
				255
			],
			l: "Kepler"
		},
		tess: {
			c: [
				79,
				214,
				200
			],
			l: "TESS"
		},
		k2: {
			c: [
				168,
				150,
				255
			],
			l: "K2"
		},
		rv: {
			c: [
				255,
				207,
				107
			],
			l: "Radial velocity"
		},
		micro: {
			c: [
				255,
				143,
				176
			],
			l: "Microlensing"
		},
		imaging: {
			c: [
				127,
				224,
				138
			],
			l: "Direct imaging"
		},
		ground: {
			c: [
				214,
				217,
				226
			],
			l: "Transit (ground)"
		},
		other: {
			c: [
				150,
				161,
				190
			],
			l: "Other"
		}
	};
	const HYG = DATA.hyg || [];
	const BND = R0;
	const AU_PC = 484814e-11, LOG0 = -6, KDEC = 1;
	let focusSys = null, focusSysW = null, sysA = 0;
	let navTarget = null;
	let dirty = true;
	let flySpeed = 1;
	function rlog(pc) {
		return Math.max(0, (Math.log10(pc) - LOG0) * KDEC);
	}
	const REALK = 1;
	function scale(pc) {
		return S.realScale ? pc * REALK : rlog(pc);
	}
	function invScale(u) {
		return S.realScale ? u / REALK : Math.pow(10, u / KDEC + LOG0);
	}
	function lodA(camd, fullPc, hidePc) {
		const f = scale(fullPc), h = scale(hidePc);
		return Math.max(0, Math.min(1, (h - camd) / (h - f || 1e-12)));
	}
	function camSolar() {
		return scale(.0015);
	}
	function camCosmos() {
		return scale(3e7);
	}
	const GAL = DATA.galaxies || [];
	GAL.forEach((g) => {
		g._gs = .5 + Math.sqrt(g.kpc || .5) / 6;
	});
	let solarA = 0;
	let NEAR = .05;
	function dirOf(raDeg, decDeg) {
		const r = raDeg * Math.PI / 180, d = decDeg * Math.PI / 180;
		return [
			Math.cos(d) * Math.cos(r),
			Math.cos(d) * Math.sin(r),
			Math.sin(d)
		];
	}
	const SGRA = {
		n: "Sagittarius A*",
		sgra: true,
		kind: "galactic centre",
		d: 8178,
		desc: "supermassive black hole · 4.3 million solar masses"
	};
	SGRA._dir = dirOf(266.41684, -29.00781);
	const NGP = dirOf(192.85948, 27.12825), GC = SGRA._dir;
	const GPv = (function() {
		const c = [
			NGP[1] * GC[2] - NGP[2] * GC[1],
			NGP[2] * GC[0] - NGP[0] * GC[2],
			NGP[0] * GC[1] - NGP[1] * GC[0]
		];
		const n = Math.hypot(c[0], c[1], c[2]);
		return [
			c[0] / n,
			c[1] / n,
			c[2] / n
		];
	})();
	const GPu = GC;
	const DSO_T = {
		OC: {
			c: [
				150,
				190,
				255
			],
			l: "Open cluster"
		},
		GC: {
			c: [
				255,
				226,
				160
			],
			l: "Globular cluster"
		},
		EN: {
			c: [
				255,
				118,
				118
			],
			l: "Emission nebula"
		},
		PN: {
			c: [
				110,
				230,
				198
			],
			l: "Planetary nebula"
		},
		SNR: {
			c: [
				232,
				140,
				222
			],
			l: "Supernova remnant"
		},
		BH: {
			c: [
				176,
				140,
				255
			],
			l: "Stellar black hole"
		},
		NS: {
			c: [
				150,
				220,
				255
			],
			l: "Neutron star / magnetar"
		},
		XRB: {
			c: [
				255,
				168,
				120
			],
			l: "X-ray binary"
		},
		CL: {
			c: [
				255,
				182,
				140
			],
			l: "Galaxy cluster"
		},
		SC: {
			c: [
				255,
				150,
				110
			],
			l: "Supercluster"
		},
		GW: {
			c: [
				130,
				255,
				220
			],
			l: "Gravitational-wave event"
		},
		QSOn: {
			c: [
				214,
				150,
				255
			],
			l: "Quasar"
		},
		WD: {
			c: [
				235,
				240,
				250
			],
			l: "White dwarf"
		},
		BD: {
			c: [
				205,
				140,
				95
			],
			l: "Brown dwarf"
		},
		GRB: {
			c: [
				255,
				215,
				120
			],
			l: "Gamma-ray burst"
		},
		FRB: {
			c: [
				170,
				255,
				190
			],
			l: "Fast radio burst"
		},
		MC: {
			c: [
				172,
				128,
				98
			],
			l: "Molecular cloud (Gaia 3D dust)"
		}
	};
	const DSO = [
		{
			n: "Pleiades · M45",
			t: "OC",
			ra: 56.75,
			dec: 24.12,
			d: 136
		},
		{
			n: "Hyades",
			t: "OC",
			ra: 66.75,
			dec: 15.87,
			d: 47
		},
		{
			n: "Praesepe · M44",
			t: "OC",
			ra: 130.05,
			dec: 19.67,
			d: 187
		},
		{
			n: "Double Cluster",
			t: "OC",
			ra: 34.74,
			dec: 57.13,
			d: 2300
		},
		{
			n: "Wild Duck · M11",
			t: "OC",
			ra: 282.77,
			dec: -6.27,
			d: 1900
		},
		{
			n: "Ptolemy · M7",
			t: "OC",
			ra: 268.46,
			dec: -34.79,
			d: 300
		},
		{
			n: "Butterfly · M6",
			t: "OC",
			ra: 265.08,
			dec: -32.21,
			d: 490
		},
		{
			n: "M35",
			t: "OC",
			ra: 92.27,
			dec: 24.33,
			d: 860
		},
		{
			n: "M67",
			t: "OC",
			ra: 132.83,
			dec: 11.81,
			d: 800
		},
		{
			n: "M13 · Hercules",
			t: "GC",
			ra: 250.42,
			dec: 36.46,
			d: 7700
		},
		{
			n: "M22",
			t: "GC",
			ra: 279.1,
			dec: -23.9,
			d: 3200
		},
		{
			n: "Omega Centauri",
			t: "GC",
			ra: 201.7,
			dec: -47.48,
			d: 5200
		},
		{
			n: "47 Tucanae",
			t: "GC",
			ra: 6.02,
			dec: -72.08,
			d: 4e3
		},
		{
			n: "M5",
			t: "GC",
			ra: 229.64,
			dec: 2.08,
			d: 7500
		},
		{
			n: "M15",
			t: "GC",
			ra: 322.49,
			dec: 12.17,
			d: 10400
		},
		{
			n: "M3",
			t: "GC",
			ra: 205.55,
			dec: 28.38,
			d: 10200
		},
		{
			n: "M4",
			t: "GC",
			ra: 245.9,
			dec: -26.53,
			d: 1850
		},
		{
			n: "M92",
			t: "GC",
			ra: 259.28,
			dec: 43.14,
			d: 8200
		},
		{
			n: "Orion Nebula · M42",
			t: "EN",
			ra: 83.82,
			dec: -5.39,
			d: 412
		},
		{
			n: "Lagoon Nebula · M8",
			t: "EN",
			ra: 270.92,
			dec: -24.38,
			d: 1250
		},
		{
			n: "Eagle Nebula · M16",
			t: "EN",
			ra: 274.7,
			dec: -13.81,
			d: 1740
		},
		{
			n: "Trifid Nebula · M20",
			t: "EN",
			ra: 270.6,
			dec: -23.03,
			d: 1550
		},
		{
			n: "Omega Nebula · M17",
			t: "EN",
			ra: 275.2,
			dec: -16.17,
			d: 1700
		},
		{
			n: "Carina Nebula",
			t: "EN",
			ra: 161.27,
			dec: -59.87,
			d: 2300
		},
		{
			n: "Rosette Nebula",
			t: "EN",
			ra: 97.98,
			dec: 4.95,
			d: 1600
		},
		{
			n: "North America Nebula",
			t: "EN",
			ra: 314.75,
			dec: 44.31,
			d: 800
		},
		{
			n: "Tarantula Nebula",
			t: "EN",
			ra: 84.68,
			dec: -69.1,
			d: 49e3
		},
		{
			n: "Ring Nebula · M57",
			t: "PN",
			ra: 283.4,
			dec: 33.03,
			d: 700
		},
		{
			n: "Dumbbell Nebula · M27",
			t: "PN",
			ra: 299.9,
			dec: 22.72,
			d: 380
		},
		{
			n: "Helix Nebula",
			t: "PN",
			ra: 337.41,
			dec: -20.84,
			d: 200
		},
		{
			n: "Cat's Eye Nebula",
			t: "PN",
			ra: 269.64,
			dec: 66.63,
			d: 1e3
		},
		{
			n: "Crab Nebula · M1",
			t: "SNR",
			ra: 83.63,
			dec: 22.01,
			d: 2e3
		},
		{
			n: "Veil Nebula",
			t: "SNR",
			ra: 311.6,
			dec: 30.72,
			d: 740
		},
		{
			n: "Cygnus X-1",
			t: "BH",
			ra: 299.59,
			dec: 35.202,
			d: 2220
		},
		{
			n: "V404 Cygni",
			t: "BH",
			ra: 306.016,
			dec: 33.867,
			d: 2390
		},
		{
			n: "GRS 1915+105",
			t: "BH",
			ra: 288.798,
			dec: 10.946,
			d: 8600
		},
		{
			n: "A0620-00",
			t: "BH",
			ra: 95.676,
			dec: -.35,
			d: 1060
		},
		{
			n: "GRO J1655-40",
			t: "BH",
			ra: 253.5,
			dec: -39.846,
			d: 3200
		},
		{
			n: "LMC X-1",
			t: "BH",
			ra: 84.912,
			dec: -69.743,
			d: 49700
		},
		{
			n: "V4641 Sgr",
			t: "BH",
			ra: 274.839,
			dec: -25.407,
			d: 6200
		},
		{
			n: "Cygnus X-3",
			t: "XRB",
			ra: 308.107,
			dec: 40.958,
			d: 7400
		},
		{
			n: "Scorpius X-1",
			t: "XRB",
			ra: 244.979,
			dec: -15.64,
			d: 2800
		},
		{
			n: "Hercules X-1",
			t: "XRB",
			ra: 254.457,
			dec: 35.342,
			d: 6100
		},
		{
			n: "SS 433",
			t: "XRB",
			ra: 287.957,
			dec: 4.983,
			d: 5500
		},
		{
			n: "Vela X-1",
			t: "XRB",
			ra: 135.529,
			dec: -40.555,
			d: 1900
		},
		{
			n: "Centaurus X-3",
			t: "XRB",
			ra: 170.313,
			dec: -60.624,
			d: 5700
		},
		{
			n: "Geminga",
			t: "NS",
			ra: 98.476,
			dec: 17.77,
			d: 250
		},
		{
			n: "SGR 1806-20",
			t: "NS",
			ra: 272.163,
			dec: -20.412,
			d: 8700
		},
		{
			n: "RX J1856-3754",
			t: "NS",
			ra: 284.146,
			dec: -37.908,
			d: 120
		},
		{
			n: "SGR 1935+2154",
			t: "NS",
			ra: 293.732,
			dec: 21.897,
			d: 6600
		},
		{
			n: "SN 1006",
			t: "SNR",
			ra: 225.592,
			dec: -41.935,
			d: 2200
		},
		{
			n: "Tycho · SN 1572",
			t: "SNR",
			ra: 6.34,
			dec: 64.14,
			d: 2500
		},
		{
			n: "Kepler · SN 1604",
			t: "SNR",
			ra: 262.675,
			dec: -21.49,
			d: 5e3
		},
		{
			n: "Cassiopeia A",
			t: "SNR",
			ra: 350.85,
			dec: 58.815,
			d: 3400
		},
		{
			n: "SN 1987A · LMC",
			t: "SNR",
			ra: 83.867,
			dec: -69.27,
			d: 51400
		},
		{
			n: "Vela SNR",
			t: "SNR",
			ra: 128.5,
			dec: -45.833,
			d: 290
		},
		{
			n: "Puppis A",
			t: "SNR",
			ra: 125.5,
			dec: -42.9,
			d: 2e3
		},
		{
			n: "RCW 86 · SN 185",
			t: "SNR",
			ra: 220.7,
			dec: -62.5,
			d: 2500
		},
		{
			n: "M2",
			t: "GC",
			ra: 323.363,
			dec: -.823,
			d: 11500
		},
		{
			n: "M10",
			t: "GC",
			ra: 254.288,
			dec: -4.1,
			d: 4400
		},
		{
			n: "M12",
			t: "GC",
			ra: 251.809,
			dec: -1.948,
			d: 4800
		},
		{
			n: "M14",
			t: "GC",
			ra: 264.4,
			dec: -3.246,
			d: 9300
		},
		{
			n: "M19",
			t: "GC",
			ra: 255.657,
			dec: -26.268,
			d: 8800
		},
		{
			n: "M28",
			t: "GC",
			ra: 276.137,
			dec: -24.87,
			d: 5500
		},
		{
			n: "M30",
			t: "GC",
			ra: 325.092,
			dec: -23.18,
			d: 8100
		},
		{
			n: "M54",
			t: "GC",
			ra: 283.764,
			dec: -30.48,
			d: 26e3
		},
		{
			n: "M55",
			t: "GC",
			ra: 294.999,
			dec: -30.965,
			d: 5400
		},
		{
			n: "M62",
			t: "GC",
			ra: 255.303,
			dec: -30.112,
			d: 6800
		},
		{
			n: "M79",
			t: "GC",
			ra: 81.044,
			dec: -24.524,
			d: 12900
		},
		{
			n: "NGC 6752",
			t: "GC",
			ra: 287.717,
			dec: -59.985,
			d: 4e3
		},
		{
			n: "M36",
			t: "OC",
			ra: 84.05,
			dec: 34.13,
			d: 1330
		},
		{
			n: "M37",
			t: "OC",
			ra: 88.07,
			dec: 32.55,
			d: 1400
		},
		{
			n: "M38",
			t: "OC",
			ra: 82.17,
			dec: 35.85,
			d: 1070
		},
		{
			n: "M34",
			t: "OC",
			ra: 40.52,
			dec: 42.72,
			d: 500
		},
		{
			n: "M41",
			t: "OC",
			ra: 101.5,
			dec: -20.72,
			d: 710
		},
		{
			n: "M46",
			t: "OC",
			ra: 115.44,
			dec: -14.81,
			d: 1660
		},
		{
			n: "M93",
			t: "OC",
			ra: 116.14,
			dec: -23.86,
			d: 1140
		},
		{
			n: "M23",
			t: "OC",
			ra: 269.15,
			dec: -19.02,
			d: 660
		},
		{
			n: "M25",
			t: "OC",
			ra: 277.94,
			dec: -19.25,
			d: 610
		},
		{
			n: "Jewel Box",
			t: "OC",
			ra: 193.68,
			dec: -60.35,
			d: 1980
		},
		{
			n: "Owl Nebula · M97",
			t: "PN",
			ra: 168.7,
			dec: 55.02,
			d: 640
		},
		{
			n: "Little Dumbbell · M76",
			t: "PN",
			ra: 25.58,
			dec: 51.58,
			d: 780
		},
		{
			n: "Saturn Nebula",
			t: "PN",
			ra: 316.05,
			dec: -11.36,
			d: 1500
		},
		{
			n: "Eskimo Nebula",
			t: "PN",
			ra: 112.3,
			dec: 20.91,
			d: 1800
		},
		{
			n: "California Nebula",
			t: "EN",
			ra: 60,
			dec: 36.42,
			d: 300
		},
		{
			n: "Flame Nebula",
			t: "EN",
			ra: 85.43,
			dec: -1.85,
			d: 400
		},
		{
			n: "Cocoon Nebula",
			t: "EN",
			ra: 328.38,
			dec: 47.27,
			d: 1200
		},
		{
			n: "Virgo Cluster",
			t: "CL",
			ra: 187.7,
			dec: 12.4,
			d: 165e5
		},
		{
			n: "Fornax Cluster",
			t: "CL",
			ra: 54.6,
			dec: -35.5,
			d: 19e6
		},
		{
			n: "Coma Cluster",
			t: "CL",
			ra: 194.9,
			dec: 27.9,
			d: 99e6
		},
		{
			n: "Perseus Cluster",
			t: "CL",
			ra: 49.9,
			dec: 41.5,
			d: 73e6
		},
		{
			n: "Centaurus Cluster",
			t: "CL",
			ra: 192.2,
			dec: -41.3,
			d: 52e6
		},
		{
			n: "Hydra Cluster",
			t: "CL",
			ra: 159.2,
			dec: -27.5,
			d: 58e6
		},
		{
			n: "Norma Cluster",
			t: "CL",
			ra: 243.6,
			dec: -60.9,
			d: 65e6
		},
		{
			n: "Hercules Cluster",
			t: "CL",
			ra: 241.3,
			dec: 17.7,
			d: 16e7
		},
		{
			n: "Shapley · A3558",
			t: "CL",
			ra: 202,
			dec: -31.5,
			d: 2e8
		},
		{
			n: "Virgo Supercluster",
			t: "SC",
			ra: 187,
			dec: 12,
			d: 18e6
		},
		{
			n: "Laniakea · Great Attractor",
			t: "SC",
			ra: 243,
			dec: -61,
			d: 79e6
		},
		{
			n: "Perseus-Pisces SC",
			t: "SC",
			ra: 30,
			dec: 35,
			d: 7e7
		},
		{
			n: "Shapley Supercluster",
			t: "SC",
			ra: 202,
			dec: -31,
			d: 2e8
		},
		{
			n: "3C 273",
			t: "QSOn",
			ra: 187.278,
			dec: 2.052,
			d: 652e6
		},
		{
			n: "3C 48",
			t: "QSOn",
			ra: 24.422,
			dec: 33.16,
			d: 1436e6
		},
		{
			n: "ULAS J1342+0928",
			t: "QSOn",
			ra: 205.617,
			dec: 9.477,
			d: 8805e6
		},
		{
			n: "J0313-1806 · z 7.64",
			t: "QSOn",
			ra: 48.353,
			dec: -18.107,
			d: 8836e6
		},
		{
			n: "GW170817 · NGC 4993",
			t: "GW",
			ra: 197.448,
			dec: -23.384,
			d: 4e7
		},
		{
			n: "GW150914",
			t: "GW",
			ra: 112,
			dec: -70,
			d: 44e7
		},
		{
			n: "Sirius B",
			t: "WD",
			ra: 101.287,
			dec: -16.716,
			d: 2.64
		},
		{
			n: "Procyon B",
			t: "WD",
			ra: 114.826,
			dec: 5.225,
			d: 3.51
		},
		{
			n: "40 Eridani B",
			t: "WD",
			ra: 63.818,
			dec: -7.653,
			d: 5.04
		},
		{
			n: "Van Maanen 2",
			t: "WD",
			ra: 11.332,
			dec: 5.388,
			d: 4.31
		},
		{
			n: "Luhman 16",
			t: "BD",
			ra: 162.328,
			dec: -53.319,
			d: 2
		},
		{
			n: "WISE 0855-0714",
			t: "BD",
			ra: 133.787,
			dec: -7.245,
			d: 2.28
		},
		{
			n: "Gliese 229 B",
			t: "BD",
			ra: 86.864,
			dec: -21.864,
			d: 5.76
		},
		{
			n: "Epsilon Indi Ba",
			t: "BD",
			ra: 330.84,
			dec: -56.786,
			d: 3.64
		},
		{
			n: "GRB 221009A · BOAT",
			t: "GRB",
			ra: 288.265,
			dec: 19.773,
			d: 624e6
		},
		{
			n: "GRB 080319B · naked-eye",
			t: "GRB",
			ra: 217.92,
			dec: 36.303,
			d: 3148e6
		},
		{
			n: "GRB 090423 · z 8.2",
			t: "GRB",
			ra: 148.888,
			dec: 18.149,
			d: 9e9
		},
		{
			n: "GRB 130427A",
			t: "GRB",
			ra: 173.136,
			dec: 27.699,
			d: 134e7
		},
		{
			n: "FRB 121102 · repeater",
			t: "FRB",
			ra: 82.995,
			dec: 33.148,
			d: 79e7
		},
		{
			n: "FRB 180924",
			t: "FRB",
			ra: 326.105,
			dec: -40.9,
			d: 1273e6
		},
		{
			n: "FRB 20200120E · M81",
			t: "FRB",
			ra: 149.5,
			dec: 68.8,
			d: 36e5
		},
		{
			n: "Orion A cloud",
			t: "MC",
			ra: 84.1,
			dec: -7.2,
			d: 432
		},
		{
			n: "Orion B cloud",
			t: "MC",
			ra: 86.7,
			dec: -.5,
			d: 423
		},
		{
			n: "λ Orionis ring",
			t: "MC",
			ra: 83.8,
			dec: 9.9,
			d: 402
		},
		{
			n: "Taurus cloud",
			t: "MC",
			ra: 68.5,
			dec: 25.9,
			d: 141
		},
		{
			n: "Perseus cloud",
			t: "MC",
			ra: 54.1,
			dec: 31.3,
			d: 294
		},
		{
			n: "Ophiuchus cloud",
			t: "MC",
			ra: 246.8,
			dec: -24.5,
			d: 139
		},
		{
			n: "Lupus cloud",
			t: "MC",
			ra: 240.6,
			dec: -38.1,
			d: 189
		},
		{
			n: "Chamaeleon cloud",
			t: "MC",
			ra: 165.4,
			dec: -77.4,
			d: 192
		},
		{
			n: "Musca cloud",
			t: "MC",
			ra: 186.8,
			dec: -71.5,
			d: 170
		},
		{
			n: "Corona Australis cloud",
			t: "MC",
			ra: 285.5,
			dec: -36.9,
			d: 151
		},
		{
			n: "Serpens cloud",
			t: "MC",
			ra: 277.5,
			dec: .5,
			d: 438
		},
		{
			n: "Aquila Rift",
			t: "MC",
			ra: 277.8,
			dec: -3.7,
			d: 271
		},
		{
			n: "California cloud",
			t: "MC",
			ra: 60.1,
			dec: 37.2,
			d: 452
		},
		{
			n: "Cepheus cloud",
			t: "MC",
			ra: 337.4,
			dec: 75.2,
			d: 346
		},
		{
			n: "Mon R2 cloud",
			t: "MC",
			ra: 91.9,
			dec: -6.4,
			d: 788
		},
		{
			n: "Pipe Nebula",
			t: "MC",
			ra: 259.5,
			dec: -26.7,
			d: 163
		},
		{
			n: "Polaris Flare",
			t: "MC",
			ra: 344,
			dec: 87.5,
			d: 341
		},
		{
			n: "Rosette cloud",
			t: "MC",
			ra: 98.2,
			dec: 4.5,
			d: 1330
		},
		{
			n: "Cygnus X",
			t: "MC",
			ra: 307.7,
			dec: 40.8,
			d: 1400
		},
		{
			n: "W3 cloud",
			t: "MC",
			ra: 36.5,
			dec: 62.1,
			d: 1950
		},
		{
			n: "NGC 2808",
			t: "GC",
			ra: 138.013,
			dec: -64.863,
			d: 9600
		},
		{
			n: "NGC 6397",
			t: "GC",
			ra: 265.175,
			dec: -53.674,
			d: 2300
		},
		{
			n: "NGC 6541",
			t: "GC",
			ra: 272.01,
			dec: -43.715,
			d: 7500
		},
		{
			n: "NGC 3201",
			t: "GC",
			ra: 154.403,
			dec: -46.412,
			d: 4900
		},
		{
			n: "NGC 288",
			t: "GC",
			ra: 13.188,
			dec: -26.583,
			d: 8900
		},
		{
			n: "NGC 362",
			t: "GC",
			ra: 15.809,
			dec: -70.849,
			d: 8600
		},
		{
			n: "NGC 1851",
			t: "GC",
			ra: 78.528,
			dec: -40.047,
			d: 12100
		},
		{
			n: "M68",
			t: "GC",
			ra: 189.867,
			dec: -26.744,
			d: 10300
		},
		{
			n: "M53",
			t: "GC",
			ra: 198.23,
			dec: 18.169,
			d: 17900
		},
		{
			n: "M69",
			t: "GC",
			ra: 277.846,
			dec: -32.348,
			d: 8800
		},
		{
			n: "M70",
			t: "GC",
			ra: 280.803,
			dec: -32.292,
			d: 9700
		},
		{
			n: "M71",
			t: "GC",
			ra: 298.444,
			dec: 18.779,
			d: 4e3
		},
		{
			n: "M72",
			t: "GC",
			ra: 313.365,
			dec: -12.537,
			d: 16900
		},
		{
			n: "M75",
			t: "GC",
			ra: 301.52,
			dec: -21.921,
			d: 20500
		},
		{
			n: "M80",
			t: "GC",
			ra: 244.26,
			dec: -22.976,
			d: 1e4
		},
		{
			n: "M107",
			t: "GC",
			ra: 248.133,
			dec: -13.054,
			d: 6400
		},
		{
			n: "M9",
			t: "GC",
			ra: 259.799,
			dec: -18.516,
			d: 7900
		},
		{
			n: "M56",
			t: "GC",
			ra: 289.148,
			dec: 30.184,
			d: 10200
		},
		{
			n: "NGC 4833",
			t: "GC",
			ra: 194.891,
			dec: -70.876,
			d: 6600
		}
	];
	DSO.forEach((o) => {
		o.dso = true;
		o._dir = dirOf(o.ra, o.dec);
	});
	const PULSARS = [
		[
			41.212,
			14.45,
			2730,
			"PSR J0244+14"
		],
		[
			54.433,
			17.254,
			1300,
			"PSR J0337+1715"
		],
		[
			61.979,
			16.121,
			4070,
			"PSR J0407+1607"
		],
		[
			52.286,
			16.901,
			3350,
			"PSR J0329+1654"
		],
		[
			46.138,
			19.548,
			950,
			"PSR J0304+1932"
		],
		[
			40.442,
			16.067,
			1010,
			"PSR J0241+16"
		],
		[
			37.262,
			20.967,
			2970,
			"PSR J0229+20"
		],
		[
			29.621,
			21.133,
			1450,
			"PSR J0158+21"
		],
		[
			68.892,
			27.733,
			3430,
			"PSR J0435+27"
		],
		[
			64.429,
			35.75,
			2680,
			"PSR J0417+35"
		],
		[
			77.496,
			38.2,
			2740,
			"PSR J0510+38"
		],
		[
			75.278,
			45.276,
			2200,
			"PSR J0501+4516"
		],
		[
			75.519,
			46.902,
			1780,
			"PSR J0502+4654"
		],
		[
			79.75,
			44,
			2030,
			"PSR J0519+44"
		],
		[
			64.75,
			44,
			3120,
			"PSR J0419+44"
		],
		[
			59.5,
			42.1,
			2070,
			"PSR J0358+42"
		],
		[
			50.861,
			39.748,
			2610,
			"PSR J0323+3944"
		],
		[
			55.097,
			41.513,
			2670,
			"PSR J0340+4130"
		],
		[
			53.819,
			45.932,
			2080,
			"PSR J0335+4555"
		],
		[
			59.437,
			52.616,
			4730,
			"PSR J0357+5236"
		],
		[
			66.528,
			49.561,
			3600,
			"PSR J0426+4933"
		],
		[
			80,
			54.417,
			2030,
			"PSR J0519+54"
		],
		[
			73.532,
			55.728,
			1180,
			"PSR J0454+5543"
		],
		[
			62,
			55,
			2040,
			"PSR J0408+551"
		],
		[
			62,
			55,
			2360,
			"PSR J0408+552"
		],
		[
			34.526,
			42.538,
			3150,
			"PSR J0218+4232"
		],
		[
			29.23,
			39.825,
			4850,
			"PSR J0156+3949"
		],
		[
			12.142,
			34.202,
			3680,
			"PSR J0048+3412"
		],
		[
			3.574,
			47.776,
			1820,
			"PSR J0014+4746"
		],
		[
			16.604,
			48.931,
			7330,
			"PSR J0106+4855"
		],
		[
			15.75,
			48,
			4030,
			"PSR J0102+4839"
		],
		[
			14.106,
			47.936,
			1e3,
			"PSR J0056+4756"
		],
		[
			14.75,
			50.033,
			5790,
			"PSR J0059+50"
		],
		[
			13.939,
			51.29,
			2400,
			"PSR J0055+5117"
		],
		[
			24.911,
			56.36,
			5540,
			"PSR J0139+5621"
		],
		[
			15.904,
			54.033,
			2690,
			"PSR J0103+54"
		],
		[
			19.411,
			59.244,
			2140,
			"PSR J0117+5914"
		],
		[
			8.25,
			57,
			3340,
			"PSR J0033+57"
		],
		[
			10.135,
			57.274,
			4480,
			"PSR J0040+5716"
		],
		[
			14.5,
			61.417,
			5810,
			"PSR J0058+6125"
		],
		[
			8.25,
			61,
			1920,
			"PSR J0033+61"
		],
		[
			6.711,
			63.334,
			13600,
			"PSR J0026+6320"
		],
		[
			51.231,
			52.659,
			6280,
			"PSR J0324+5239"
		],
		[
			55.804,
			53.215,
			2480,
			"PSR J0343+5312"
		],
		[
			59.724,
			54.22,
			1e3,
			"PSR J0358+5413"
		],
		[
			53.247,
			54.579,
			1e3,
			"PSR J0332+5434"
		],
		[
			55.25,
			57.183,
			4470,
			"PSR J0341+5711"
		],
		[
			33.73,
			52.378,
			1210,
			"PSR J0214+5222"
		],
		[
			33.217,
			52.379,
			1910,
			"PSR J0212+5222"
		],
		[
			42.078,
			60.36,
			2e3,
			"PSR J0248+6021"
		],
		[
			40.75,
			60.45,
			6990,
			"PSR J0243+6027"
		],
		[
			40.646,
			62.947,
			210,
			"PSR J0242+62"
		],
		[
			63.25,
			58,
			2240,
			"PSR J0413+58"
		],
		[
			61.625,
			61.645,
			3050,
			"PSR J0406+6138"
		],
		[
			64.25,
			61.133,
			3600,
			"PSR J0417+61"
		],
		[
			83.25,
			67,
			5800,
			"PSR J0533+67"
		],
		[
			59.5,
			66.667,
			3520,
			"PSR J0358+66"
		],
		[
			54.75,
			66.733,
			3630,
			"PSR J0338+66"
		],
		[
			51.5,
			67.817,
			3490,
			"PSR J0325+67"
		],
		[
			63.982,
			69.903,
			1570,
			"PSR J0415+6954"
		],
		[
			26.936,
			59.368,
			1910,
			"PSR J0147+5922"
		],
		[
			29.458,
			62.207,
			1610,
			"PSR J0157+6212"
		],
		[
			24.832,
			58.242,
			2600,
			"PSR J0139+5814"
		],
		[
			25.416,
			60.159,
			2300,
			"PSR J0141+6009"
		],
		[
			21.5,
			62.583,
			5100,
			"PSR J0125+62"
		],
		[
			26.593,
			61.751,
			3600,
			"PSR J0146+6145"
		],
		[
			25.25,
			63.133,
			21680,
			"PSR J0141+63"
		],
		[
			24,
			63.7,
			24030,
			"PSR J0136+63"
		],
		[
			33.986,
			62.309,
			3190,
			"PSR J0215+6218"
		],
		[
			31.408,
			64.828,
			3200,
			"PSR J0205+6449"
		],
		[
			30.422,
			70.088,
			1150,
			"PSR J0201+7005"
		],
		[
			17.094,
			66.143,
			1650,
			"PSR J0108+6608"
		],
		[
			18,
			66.367,
			5250,
			"PSR J0112+66"
		],
		[
			15.637,
			65.62,
			2450,
			"PSR J0102+6537"
		],
		[
			13.5,
			66,
			810,
			"PSR J0054+66"
		],
		[
			8.5,
			69.717,
			3990,
			"PSR J0034+69"
		],
		[
			17.123,
			69.098,
			2590,
			"PSR J0108+6905"
		],
		[
			13.617,
			69.433,
			4730,
			"PSR J0054+69"
		],
		[
			13.25,
			69.65,
			8400,
			"PSR J0053+69"
		],
		[
			1.757,
			73.052,
			1400,
			"PSR J0007+7303"
		],
		[
			37.808,
			70.443,
			2250,
			"PSR J0231+7026"
		],
		[
			47,
			74,
			340,
			"PSR J0308+74"
		],
		[
			53.187,
			79.167,
			930,
			"PSR J0332+79"
		],
		[
			140.558,
			6.64,
			1100,
			"PSR J0922+0638"
		],
		[
			142.183,
			6.233,
			2880,
			"PSR J0928+06"
		],
		[
			129.274,
			6.171,
			760,
			"PSR J0837+0610"
		],
		[
			130.891,
			7.313,
			3720,
			"PSR J0843+0719"
		],
		[
			132.221,
			16.717,
			3210,
			"PSR J0848+16"
		],
		[
			146.532,
			9.865,
			960,
			"PSR J0946+0951"
		],
		[
			145.875,
			16.527,
			1760,
			"PSR J0943+1631"
		],
		[
			152.5,
			15.85,
			2270,
			"PSR J1010+15"
		],
		[
			145.854,
			22.933,
			2390,
			"PSR J0943+22"
		],
		[
			141.904,
			23.783,
			2520,
			"PSR J0927+23"
		],
		[
			146.842,
			27.7,
			2330,
			"PSR J0947+27"
		],
		[
			123.787,
			9.664,
			4520,
			"PSR J0815+0939"
		],
		[
			117.788,
			18.127,
			400,
			"PSR J0751+1807"
		],
		[
			126.714,
			26.623,
			320,
			"PSR J0826+2637"
		],
		[
			145.75,
			41.15,
			2330,
			"PSR J0943+41"
		],
		[
			168.91,
			50.503,
			510,
			"PSR J1115+5030"
		],
		[
			153.139,
			53.117,
			700,
			"PSR J1012+5307"
		],
		[
			167.75,
			58.867,
			2170,
			"PSR J1110+58"
		],
		[
			118.67,
			32.532,
			3920,
			"PSR J0754+3231"
		],
		[
			115.25,
			41.067,
			1290,
			"PSR J0740+41"
		],
		[
			101.496,
			51.971,
			770,
			"PSR J0645+5158"
		],
		[
			99.02,
			51.483,
			200,
			"PSR J0636+5129"
		],
		[
			140.309,
			62.904,
			790,
			"PSR J0921+6254"
		],
		[
			165.5,
			65.117,
			1570,
			"PSR J1101+65"
		],
		[
			117.5,
			57,
			2190,
			"PSR J0750+57"
		],
		[
			115.5,
			66.333,
			870,
			"PSR J0742+66"
		],
		[
			116.5,
			66.6,
			2380,
			"PSR J0746+66"
		],
		[
			105.158,
			64.303,
			490,
			"PSR J0700+6418"
		],
		[
			114.25,
			69.233,
			940,
			"PSR J0737+69"
		],
		[
			171.492,
			78.383,
			640,
			"PSR J1122+78"
		],
		[
			123.748,
			74.485,
			430,
			"PSR J0814+7429"
		],
		[
			101.5,
			80.15,
			3950,
			"PSR J0645+80"
		],
		[
			103.313,
			80.867,
			3370,
			"PSR J0653+8051"
		],
		[
			93.5,
			83.233,
			4040,
			"PSR J0614+83"
		],
		[
			132.256,
			80.483,
			3380,
			"PSR J0849+8028"
		],
		[
			235.912,
			9.488,
			5900,
			"PSR J1543+0929"
		],
		[
			234.292,
			11.932,
			1050,
			"PSR J1537+1155"
		],
		[
			243.098,
			20.138,
			1430,
			"PSR J1612+2008"
		],
		[
			237.421,
			21.224,
			2330,
			"PSR J1549+2113"
		],
		[
			234.525,
			23.751,
			980,
			"PSR J1538+2345"
		],
		[
			211.167,
			12.05,
			1900,
			"PSR J1404+12"
		],
		[
			223.44,
			19.037,
			950,
			"PSR J1453+1902"
		],
		[
			225.977,
			21.186,
			720,
			"PSR J1503+2111"
		],
		[
			233.043,
			27.764,
			980,
			"PSR J1532+2745"
		],
		[
			250.07,
			22.402,
			1450,
			"PSR J1640+2224"
		],
		[
			248.857,
			24.313,
			2270,
			"PSR J1635+2418"
		],
		[
			252.434,
			25.552,
			2910,
			"PSR J1649+2533"
		],
		[
			253.013,
			26.861,
			2930,
			"PSR J1652+2651"
		],
		[
			250.42,
			36.454,
			6500,
			"PSR J1641+3627A"
		],
		[
			250.421,
			36.46,
			6500,
			"PSR J1641+3627B"
		],
		[
			250.421,
			36.46,
			6500,
			"PSR J1641+3627C"
		],
		[
			250.421,
			36.46,
			6500,
			"PSR J1641+3627D"
		],
		[
			250.421,
			36.46,
			6500,
			"PSR J1641+3627E"
		],
		[
			247.5,
			37,
			850,
			"PSR J1630+37"
		],
		[
			268.595,
			52.02,
			3560,
			"PSR J1754+5201"
		],
		[
			236.019,
			49.632,
			2300,
			"PSR J1544+4937"
		],
		[
			247.25,
			43.983,
			400,
			"PSR J1629+43"
		],
		[
			257.621,
			49.333,
			390,
			"PSR J1710+49"
		],
		[
			256.75,
			59.167,
			2970,
			"PSR J1706+59"
		],
		[
			205.546,
			28.376,
			9900,
			"PSR J1342+2822A"
		],
		[
			205.546,
			28.376,
			9900,
			"PSR J1342+2822C"
		],
		[
			205.546,
			28.378,
			9900,
			"PSR J1342+2822B"
		],
		[
			205.542,
			28.377,
			9900,
			"PSR J1342+2822D"
		],
		[
			229.57,
			49.076,
			700,
			"PSR J1518+4904"
		],
		[
			227.357,
			55.526,
			2100,
			"PSR J1509+5531"
		],
		[
			252,
			66.067,
			1800,
			"PSR J1647+66"
		],
		[
			200,
			67.5,
			2330,
			"PSR J1320+67"
		],
		[
			218.499,
			72.957,
			750,
			"PSR J1434+7257"
		],
		[
			252.5,
			80.75,
			3380,
			"PSR J1649+80"
		],
		[
			219.75,
			76.917,
			1780,
			"PSR J1439+76"
		],
		[
			200.442,
			83.394,
			770,
			"PSR J1321+8323"
		],
		[
			246.75,
			86.9,
			3650,
			"PSR J1627+86"
		],
		[
			322.491,
			12.166,
			12900,
			"PSR J2129+1210G"
		],
		[
			322.493,
			12.167,
			12900,
			"PSR J2129+1210A"
		],
		[
			322.493,
			12.167,
			12900,
			"PSR J2129+1210D"
		],
		[
			322.492,
			12.167,
			12900,
			"PSR J2129+1210H"
		],
		[
			322.494,
			12.167,
			12900,
			"PSR J2129+1210B"
		],
		[
			322.488,
			12.167,
			12900,
			"PSR J2129+1210F"
		],
		[
			322.492,
			12.169,
			12900,
			"PSR J2129+1210E"
		],
		[
			322.505,
			12.177,
			12900,
			"PSR J2129+1210C"
		],
		[
			311.447,
			9.208,
			1990,
			"PSR J2045+0912"
		],
		[
			311.75,
			10.883,
			2230,
			"PSR J2047+1053"
		],
		[
			319.057,
			14.239,
			4430,
			"PSR J2116+1414"
		],
		[
			312.5,
			13.017,
			5400,
			"PSR J2050+13"
		],
		[
			311.664,
			15.676,
			2560,
			"PSR J2046+1540"
		],
		[
			331.322,
			14.742,
			3330,
			"PSR J2205+1444"
		],
		[
			321.194,
			14.122,
			2090,
			"PSR J2124+1407"
		],
		[
			317.888,
			21.102,
			5640,
			"PSR J2111+2106"
		],
		[
			324.862,
			22.712,
			4710,
			"PSR J2139+2242"
		],
		[
			327.87,
			23.254,
			1420,
			"PSR J2151+2315"
		],
		[
			329.099,
			26.308,
			4710,
			"PSR J2156+2618"
		],
		[
			300.699,
			16.621,
			6100,
			"PSR J2002+1637"
		],
		[
			310.074,
			16.958,
			3510,
			"PSR J2040+1657"
		],
		[
			310.837,
			17.191,
			1250,
			"PSR J2043+1711"
		],
		[
			308.365,
			17.583,
			1370,
			"PSR J2033+1734"
		],
		[
			304.239,
			19.798,
			1830,
			"PSR J2016+1948"
		],
		[
			306.82,
			21.768,
			10090,
			"PSR J2027+2146"
		],
		[
			309.311,
			19.715,
			2050,
			"PSR J2037+1942"
		],
		[
			307.669,
			22.473,
			4750,
			"PSR J2030+2228"
		],
		[
			296.721,
			18.095,
			300,
			"PSR J1946+1805"
		],
		[
			298.442,
			18.778,
			6680,
			"PSR J1953+1846A"
		],
		[
			301.75,
			20.35,
			3720,
			"PSR J2007+20"
		],
		[
			299.903,
			20.804,
			1530,
			"PSR J1959+2048"
		],
		[
			295.504,
			17.725,
			9830,
			"PSR J1942+1743"
		],
		[
			296.132,
			17.928,
			9500,
			"PSR J1944+1755"
		],
		[
			296.4,
			18.572,
			12770,
			"PSR J1945+1834"
		],
		[
			296.831,
			19.952,
			9510,
			"PSR J1947+1957"
		],
		[
			293.5,
			19,
			4740,
			"PSR J1934+19"
		],
		[
			292.983,
			19.87,
			22620,
			"PSR J1931+1952"
		],
		[
			294,
			20,
			9030,
			"PSR J1936+20"
		],
		[
			294.5,
			20.2,
			9420,
			"PSR J1938+2012"
		],
		[
			293.925,
			20.428,
			8640,
			"PSR J1935+2025"
		],
		[
			294.535,
			20.181,
			14360,
			"PSR J1938+2010"
		],
		[
			294.911,
			21.583,
			1500,
			"PSR J1939+2134"
		],
		[
			295.819,
			22.173,
			8350,
			"PSR J1943+2210"
		],
		[
			296.004,
			22.606,
			8460,
			"PSR J1944+2236"
		],
		[
			296.604,
			22.75,
			7090,
			"PSR J1946+2244"
		],
		[
			297.28,
			23.115,
			8650,
			"PSR J1949+2306"
		],
		[
			304.371,
			20.726,
			3550,
			"PSR J2017+2043"
		],
		[
			304.883,
			24.421,
			910,
			"PSR J2019+2425"
		],
		[
			302.148,
			25.225,
			3220,
			"PSR J2008+2513"
		],
		[
			299.25,
			25.267,
			2290,
			"PSR J1957+2516"
		],
		[
			303.803,
			25.409,
			690,
			"PSR J2015+2524"
		],
		[
			301.816,
			27.38,
			6850,
			"PSR J2007+2722"
		],
		[
			304.516,
			28.665,
			980,
			"PSR J2018+2839"
		],
		[
			302.521,
			28.758,
			6030,
			"PSR J2010+2845"
		],
		[
			313.913,
			22.158,
			2150,
			"PSR J2055+2209"
		],
		[
			312.191,
			22.918,
			6180,
			"PSR J2048+2255"
		],
		[
			316.5,
			28.483,
			4580,
			"PSR J2105+28"
		],
		[
			318.268,
			27.901,
			2610,
			"PSR J2113+2754"
		],
		[
			310.931,
			27.682,
			1130,
			"PSR J2043+2740"
		],
		[
			309.193,
			28.586,
			6780,
			"PSR J2036+2835"
		],
		[
			305.654,
			28.906,
			2100,
			"PSR J2022+2854"
		],
		[
			309.5,
			35,
			3120,
			"PSR J2038+35"
		],
		[
			313.881,
			36.506,
			5e3,
			"PSR J2055+3630"
		],
		[
			315.5,
			38,
			4860,
			"PSR J2102+38"
		],
		[
			338.736,
			21.239,
			3380,
			"PSR J2234+2114"
		],
		[
			337.462,
			26.733,
			1430,
			"PSR J2229+2643"
		],
		[
			346.493,
			31,
			2610,
			"PSR J2305+3100"
		],
		[
			331.167,
			27.033,
			2610,
			"PSR J2204+27"
		],
		[
			335.763,
			29.4,
			4460,
			"PSR J2222+2923"
		],
		[
			336.875,
			30.6,
			2360,
			"PSR J2227+30"
		],
		[
			333.097,
			29.552,
			4760,
			"PSR J2212+2933"
		],
		[
			333.662,
			30.011,
			1e3,
			"PSR J2214+3000"
		],
		[
			328.816,
			28.22,
			5060,
			"PSR J2155+2813"
		],
		[
			336.2,
			35.5,
			5560,
			"PSR J2225+35"
		],
		[
			348.286,
			42.887,
			1060,
			"PSR J2313+4253"
		],
		[
			345.696,
			44.706,
			750,
			"PSR J2302+4442"
		],
		[
			346.483,
			47.129,
			4350,
			"PSR J2305+4707"
		],
		[
			331.75,
			40.95,
			640,
			"PSR J2207+40"
		],
		[
			329.258,
			40.296,
			2900,
			"PSR J2157+4017"
		],
		[
			317.75,
			40,
			7210,
			"PSR J2111+40"
		],
		[
			330.75,
			50,
			3600,
			"PSR J2203+50"
		],
		[
			324.5,
			49.183,
			7490,
			"PSR J2138+4911"
		],
		[
			327.657,
			52.797,
			5670,
			"PSR J2150+5247"
		],
		[
			334.951,
			47.915,
			2610,
			"PSR J2219+4754"
		],
		[
			333.886,
			51.593,
			3260,
			"PSR J2215+5135"
		],
		[
			333.25,
			53,
			7580,
			"PSR J2213+53"
		],
		[
			332.099,
			55.002,
			3550,
			"PSR J2208+5500"
		],
		[
			335.5,
			56,
			7220,
			"PSR J2222+5602"
		],
		[
			340.179,
			58.544,
			14850,
			"PSR J2240+5832"
		],
		[
			347.058,
			55.793,
			2420,
			"PSR J2308+5547"
		],
		[
			348.75,
			58,
			2860,
			"PSR J2315+58"
		],
		[
			358.52,
			61.93,
			3310,
			"PSR J2354+6155"
		],
		[
			345.285,
			58.879,
			3300,
			"PSR J2301+5852"
		],
		[
			344.491,
			59.154,
			3e3,
			"PSR J2257+5909"
		],
		[
			350.48,
			60.409,
			2700,
			"PSR J2321+6024"
		],
		[
			345.547,
			60.467,
			6800,
			"PSR J2302+6028"
		],
		[
			351.5,
			61,
			1780,
			"PSR J2326+6141"
		],
		[
			351.745,
			61.227,
			4820,
			"PSR J2326+6113"
		],
		[
			354.274,
			61.85,
			700,
			"PSR J2337+6151"
		],
		[
			353.331,
			61.758,
			5010,
			"PSR J2333+6145"
		],
		[
			355.75,
			62.35,
			4590,
			"PSR J2343+6221"
		],
		[
			351.305,
			63.281,
			10860,
			"PSR J2325+6316"
		],
		[
			358,
			65,
			7720,
			"PSR J2352+65"
		],
		[
			292.323,
			19.919,
			12080,
			"PSR J1929+1955"
		],
		[
			293.033,
			20.346,
			5e3,
			"PSR J1932+2020"
		],
		[
			292.268,
			21.356,
			3360,
			"PSR J1929+2121"
		],
		[
			294.121,
			21.2,
			10110,
			"PSR J1936+21"
		],
		[
			294.559,
			22.22,
			4540,
			"PSR J1938+2213"
		],
		[
			293.095,
			22.348,
			10900,
			"PSR J1932+2220"
		],
		[
			290.723,
			21.178,
			4e3,
			"PSR J1922+2110"
		],
		[
			291.784,
			22.583,
			9300,
			"PSR J1927+2234"
		],
		[
			290.437,
			21.884,
			300,
			"PSR J1921+2153"
		],
		[
			295,
			22.767,
			8820,
			"PSR J1940+2246"
		],
		[
			295.148,
			23.63,
			9870,
			"PSR J1940+2337"
		],
		[
			296.5,
			23.967,
			4840,
			"PSR J1946+24"
		],
		[
			297.688,
			24.249,
			7290,
			"PSR J1950+2414"
		],
		[
			296.705,
			25.598,
			9580,
			"PSR J1946+2535"
		],
		[
			293.692,
			23.882,
			23980,
			"PSR J1934+2352"
		],
		[
			294.773,
			24.715,
			7340,
			"PSR J1939+2449"
		],
		[
			293.408,
			24.611,
			5520,
			"PSR J1933+2421"
		],
		[
			295.337,
			25.418,
			15350,
			"PSR J1941+2525"
		],
		[
			294.255,
			25.737,
			2760,
			"PSR J1937+2544"
		],
		[
			289.434,
			22.38,
			8040,
			"PSR J1917+2224"
		],
		[
			290.844,
			25.261,
			990,
			"PSR J1923+2515"
		],
		[
			288.078,
			25.417,
			2020,
			"PSR J1912+2525"
		],
		[
			290.16,
			26.844,
			1460,
			"PSR J1920+2650"
		],
		[
			298.997,
			25.451,
			9060,
			"PSR J1955+2527"
		],
		[
			297.073,
			25.864,
			11850,
			"PSR J1948+2551"
		],
		[
			298.154,
			26.508,
			13670,
			"PSR J1952+2630"
		],
		[
			296.691,
			26.197,
			7780,
			"PSR J1946+2611"
		],
		[
			298.282,
			27.547,
			7860,
			"PSR J1953+2732"
		],
		[
			299.331,
			28.529,
			6980,
			"PSR J1957+2831"
		],
		[
			298.866,
			29.145,
			5390,
			"PSR J1955+2908"
		],
		[
			298.594,
			29.388,
			420,
			"PSR J1954+2923"
		],
		[
			300.742,
			30.583,
			7430,
			"PSR J2002+30"
		],
		[
			301.546,
			31.034,
			5580,
			"PSR J2006+3102"
		],
		[
			301.788,
			31.348,
			7280,
			"PSR J2007+3120"
		],
		[
			301.218,
			31.619,
			8e3,
			"PSR J2004+3137"
		],
		[
			300.518,
			32.288,
			6680,
			"PSR J2002+3217"
		],
		[
			294.448,
			29.834,
			6440,
			"PSR J1937+2950"
		],
		[
			297.373,
			31.101,
			7780,
			"PSR J1949+3106"
		],
		[
			298.243,
			32.878,
			3e3,
			"PSR J1952+3252"
		],
		[
			285.075,
			30.883,
			4560,
			"PSR J1900+30"
		],
		[
			292.867,
			30.583,
			3030,
			"PSR J1931+30"
		],
		[
			296.605,
			34.287,
			6410,
			"PSR J1946+3417"
		],
		[
			297.104,
			35.67,
			7870,
			"PSR J1948+3540"
		],
		[
			303.393,
			30.981,
			6880,
			"PSR J2013+3058"
		],
		[
			302.61,
			32.502,
			18890,
			"PSR J2010+3230"
		],
		[
			302.771,
			33.524,
			12950,
			"PSR J2011+3331"
		],
		[
			302.455,
			33.436,
			10730,
			"PSR J2009+3326"
		],
		[
			304.722,
			34.517,
			8790,
			"PSR J2018+3431"
		],
		[
			305.273,
			36.851,
			1800,
			"PSR J2021+3651"
		],
		[
			307.501,
			36.691,
			11170,
			"PSR J2030+3641"
		],
		[
			307.349,
			37.736,
			7e3,
			"PSR J2029+3744"
		],
		[
			301.196,
			34.488,
			22180,
			"PSR J2004+3429"
		],
		[
			301.323,
			35.79,
			3e4,
			"PSR J2005+3547"
		],
		[
			301.448,
			35.873,
			3e4,
			"PSR J2005+3552"
		],
		[
			299.908,
			36.341,
			29320,
			"PSR J1959+3620"
		],
		[
			305.59,
			38.704,
			1e4,
			"PSR J2022+3842"
		],
		[
			303.293,
			38.762,
			13070,
			"PSR J2013+3845"
		],
		[
			309.364,
			36.357,
			5050,
			"PSR J2037+3621"
		],
		[
			305.375,
			40.446,
			2150,
			"PSR J2021+4026"
		],
		[
			308.055,
			41.457,
			1700,
			"PSR J2032+4127"
		],
		[
			306.818,
			45.966,
			22990,
			"PSR J2027+4557"
		],
		[
			300.683,
			40.848,
			8300,
			"PSR J2002+4050"
		],
		[
			300.5,
			42.717,
			3060,
			"PSR J2001+42"
		],
		[
			295.5,
			43.383,
			5910,
			"PSR J1941+43"
		],
		[
			298.75,
			43.833,
			12570,
			"PSR J1954+43"
		],
		[
			306,
			48,
			5620,
			"PSR J2024+48"
		],
		[
			298.828,
			50.999,
			1800,
			"PSR J1955+5059"
		],
		[
			288.366,
			37.537,
			5500,
			"PSR J1913+3732"
		],
		[
			286.894,
			40.035,
			1760,
			"PSR J1907+4002"
		],
		[
			290.483,
			42.417,
			3470,
			"PSR J1921+42"
		],
		[
			273.305,
			40.228,
			4320,
			"PSR J1813+4013"
		],
		[
			275.5,
			41.75,
			3760,
			"PSR J1821+41"
		],
		[
			274.15,
			45.176,
			4200,
			"PSR J1816+4510"
		],
		[
			270.25,
			50.467,
			1470,
			"PSR J1800+50"
		],
		[
			293.75,
			52.2,
			6840,
			"PSR J1935+52"
		],
		[
			290.5,
			58.467,
			5380,
			"PSR J1922+58"
		],
		[
			273.75,
			55.483,
			3870,
			"PSR J1815+55"
		],
		[
			280.186,
			56.682,
			2610,
			"PSR J1840+5640"
		],
		[
			317.085,
			44.697,
			5280,
			"PSR J2108+4441"
		],
		[
			318.351,
			46.736,
			4e3,
			"PSR J2113+4644"
		],
		[
			311.245,
			46.248,
			26780,
			"PSR J2044+4614"
		],
		[
			311.978,
			50.494,
			5030,
			"PSR J2047+5029"
		],
		[
			320.75,
			54.55,
			1700,
			"PSR J2122+54"
		],
		[
			305.925,
			50.626,
			1800,
			"PSR J2023+5037"
		],
		[
			305.708,
			51.914,
			1800,
			"PSR J2022+5154"
		],
		[
			309.513,
			53.32,
			13830,
			"PSR J2038+5319"
		],
		[
			307.5,
			55,
			3670,
			"PSR J2030+55"
		],
		[
			311.694,
			57.144,
			9670,
			"PSR J2046+5708"
		],
		[
			316.304,
			62.385,
			3030,
			"PSR J2105+6223"
		],
		[
			334.479,
			57.551,
			6820,
			"PSR J2217+5733"
		],
		[
			332.75,
			57.483,
			8670,
			"PSR J2210+57"
		],
		[
			334.022,
			57.998,
			7820,
			"PSR J2216+5759"
		],
		[
			339.5,
			60.35,
			8740,
			"PSR J2238+6021"
		],
		[
			337.272,
			61.236,
			3e3,
			"PSR J2229+6114"
		],
		[
			337.424,
			62.093,
			5700,
			"PSR J2229+6205"
		],
		[
			331.575,
			61.866,
			13810,
			"PSR J2206+6151"
		],
		[
			337.25,
			64.967,
			16460,
			"PSR J2229+64"
		],
		[
			336.47,
			65.593,
			2e3,
			"PSR J2225+6535"
		],
		[
			341,
			63,
			3580,
			"PSR J2244+63"
		],
		[
			349.897,
			64.19,
			25660,
			"PSR J2319+6411"
		],
		[
			347.75,
			67.083,
			5020,
			"PSR J2311+67"
		],
		[
			349.25,
			69.2,
			3620,
			"PSR J2316+69"
		],
		[
			327.494,
			63.495,
			13650,
			"PSR J2149+6329"
		],
		[
			324.25,
			64.317,
			11300,
			"PSR J2137+64"
		],
		[
			318.5,
			67.033,
			3650,
			"PSR J2113+67"
		],
		[
			341,
			69.667,
			3940,
			"PSR J2243+69"
		],
		[
			340.735,
			69.848,
			2300,
			"PSR J2242+6950"
		],
		[
			304.5,
			59.217,
			4710,
			"PSR J2017+59"
		],
		[
			292.25,
			62.267,
			5240,
			"PSR J1929+62"
		],
		[
			295,
			66.2,
			3360,
			"PSR J1939+66"
		],
		[
			298.25,
			67.033,
			5370,
			"PSR J1953+67"
		],
		[
			310.75,
			70.75,
			6e3,
			"PSR J2043+7045"
		],
		[
			307,
			74.783,
			600,
			"PSR J2027+74"
		],
		[
			284.75,
			76.9,
			4020,
			"PSR J1859+76"
		],
		[
			295.5,
			81.1,
			4190,
			"PSR J1942+81"
		],
		[
			358.5,
			85.567,
			3550,
			"PSR J2353+85"
		],
		[
			352.612,
			-20.092,
			470,
			"PSR J2330-2005"
		],
		[
			8.537,
			-7.365,
			1030,
			"PSR J0034-0721"
		],
		[
			354.911,
			-5.551,
			1100,
			"PSR J2339-0533"
		],
		[
			356.71,
			-6.167,
			1960,
			"PSR J2346-0609"
		],
		[
			17.035,
			-14.531,
			210,
			"PSR J0108-1431"
		],
		[
			27.845,
			-6.584,
			1930,
			"PSR J0151-0635"
		],
		[
			8.591,
			-5.577,
			980,
			"PSR J0034-0534"
		],
		[
			12.875,
			4.38,
			940,
			"PSR J0051+0423"
		],
		[
			7.614,
			4.861,
			300,
			"PSR J0030+0451"
		],
		[
			28.099,
			9.803,
			2300,
			"PSR J0152+0948"
		],
		[
			24.349,
			16.912,
			2510,
			"PSR J0137+1654"
		],
		[
			344.235,
			-10.41,
			910,
			"PSR J2256-1024"
		],
		[
			351.314,
			-5.511,
			1070,
			"PSR J2325-0530"
		],
		[
			342.112,
			-1.03,
			2280,
			"PSR J2248-0101"
		],
		[
			326.46,
			-7.838,
			530,
			"PSR J2145-0750"
		],
		[
			322.25,
			-4,
			1030,
			"PSR J2129-04"
		],
		[
			335.525,
			-1.621,
			270,
			"PSR J2222-0137"
		],
		[
			324.925,
			.6,
			2970,
			"PSR J2139+00"
		],
		[
			338.592,
			6.183,
			630,
			"PSR J2234+06"
		],
		[
			338.932,
			15.114,
			1150,
			"PSR J2235+1506"
		],
		[
			340.791,
			15.307,
			2900,
			"PSR J2243+1518"
		],
		[
			333.915,
			15.643,
			3120,
			"PSR J2215+1538"
		],
		[
			5.82,
			9.39,
			1e3,
			"PSR J0023+0923"
		],
		[
			355.187,
			8.55,
			2280,
			"PSR J2340+08"
		],
		[
			1.52,
			18.583,
			700,
			"PSR J0006+1834"
		],
		[
			349.288,
			14.659,
			1890,
			"PSR J2317+1439"
		],
		[
			352.458,
			16.95,
			2640,
			"PSR J2329+16"
		],
		[
			350.593,
			20.951,
			780,
			"PSR J2322+2057"
		],
		[
			343.311,
			15.277,
			2810,
			"PSR J2253+1516"
		],
		[
			349.491,
			21.83,
			1450,
			"PSR J2317+2149"
		],
		[
			346.922,
			22.431,
			380,
			"PSR J2307+2225"
		],
		[
			93.543,
			-33.498,
			1020,
			"PSR J0614-3329"
		],
		[
			97.706,
			-28.579,
			320,
			"PSR J0630-2834"
		],
		[
			104.126,
			-22.474,
			1790,
			"PSR J0656-2228"
		],
		[
			110.429,
			-20.635,
			3870,
			"PSR J0721-2038"
		],
		[
			98.287,
			-20.252,
			7840,
			"PSR J0633-2015"
		],
		[
			92.557,
			-21.008,
			5640,
			"PSR J0610-2100"
		],
		[
			80.151,
			-25.887,
			3470,
			"PSR J0520-2553"
		],
		[
			73.142,
			-17.99,
			400,
			"PSR J0452-1759"
		],
		[
			90.496,
			-5.464,
			7540,
			"PSR J0601-0527"
		],
		[
			112.385,
			-18.612,
			3250,
			"PSR J0729-1836"
		],
		[
			111.252,
			-16.596,
			4680,
			"PSR J0725-1635"
		],
		[
			112.319,
			-14.81,
			4370,
			"PSR J0729-1448"
		],
		[
			126.067,
			.45,
			2570,
			"PSR J0824+00"
		],
		[
			125.791,
			1.987,
			1440,
			"PSR J0823+0159"
		],
		[
			96.083,
			-4.414,
			4280,
			"PSR J0624-0424"
		],
		[
			103.046,
			-1.708,
			5830,
			"PSR J0652-0142"
		],
		[
			104.563,
			.376,
			6460,
			"PSR J0658+0022"
		],
		[
			93.433,
			-2.013,
			1090,
			"PSR J0613-0200"
		],
		[
			97.612,
			-.768,
			5570,
			"PSR J0630-0046"
		],
		[
			92.204,
			.65,
			2580,
			"PSR J0608+00"
		],
		[
			95.945,
			3.669,
			2530,
			"PSR J0623+0340"
		],
		[
			95.297,
			3.613,
			3580,
			"PSR J0621+0336"
		],
		[
			101.629,
			9.097,
			9500,
			"PSR J0646+0905"
		],
		[
			121.521,
			8.283,
			5070,
			"PSR J0806+08"
		],
		[
			107.901,
			9.524,
			2390,
			"PSR J0711+0931"
		],
		[
			101.815,
			9.233,
			10840,
			"PSR J0647+0913"
		],
		[
			72.537,
			-12.802,
			3270,
			"PSR J0450-1248"
		],
		[
			71.75,
			-4.583,
			2900,
			"PSR J0447-04"
		],
		[
			65.39,
			-3.752,
			3090,
			"PSR J0421-0345"
		],
		[
			74.655,
			-5.085,
			3830,
			"PSR J0458-0505"
		],
		[
			86.25,
			-3.167,
			6300,
			"PSR J0545-03"
		],
		[
			74.966,
			-2.168,
			1300,
			"PSR J0459-0210"
		],
		[
			83.358,
			4.033,
			6660,
			"PSR J0533+0402"
		],
		[
			57.182,
			4.537,
			2100,
			"PSR J0348+0432"
		],
		[
			77.35,
			8.95,
			2580,
			"PSR J0509+08"
		],
		[
			96.973,
			6.832,
			4e3,
			"PSR J0627+0649"
		],
		[
			96.934,
			7.109,
			7880,
			"PSR J0627+0706"
		],
		[
			97.151,
			9.154,
			4e3,
			"PSR J0628+0909"
		],
		[
			96.437,
			10.267,
			3360,
			"PSR J0625+10"
		],
		[
			97.865,
			10.617,
			6540,
			"PSR J0631+1036"
		],
		[
			95.342,
			10.044,
			1880,
			"PSR J0621+1002"
		],
		[
			81.485,
			11.255,
			7680,
			"PSR J0525+1115"
		],
		[
			89.381,
			15.835,
			5650,
			"PSR J0557+1550"
		],
		[
			104.951,
			14.239,
			280,
			"PSR J0659+1414"
		],
		[
			96.804,
			16.2,
			5870,
			"PSR J0627+16"
		],
		[
			98.476,
			17.77,
			250,
			"PSR J0633+1746"
		],
		[
			92.495,
			21.501,
			1820,
			"PSR J0609+2130"
		],
		[
			93.571,
			22.51,
			4740,
			"PSR J0614+2229"
		],
		[
			97.274,
			24.262,
			4670,
			"PSR J0629+2415"
		],
		[
			83.633,
			22.014,
			2e3,
			"PSR J0534+2200"
		],
		[
			82.218,
			22.001,
			2280,
			"PSR J0528+2200"
		],
		[
			73.439,
			15.989,
			1830,
			"PSR J0453+1559"
		],
		[
			79.292,
			22.267,
			1100,
			"PSR J0517+22"
		],
		[
			74.275,
			23.567,
			3890,
			"PSR J0457+23"
		],
		[
			85.79,
			23.485,
			3540,
			"PSR J0543+2329"
		],
		[
			86.62,
			24.689,
			3160,
			"PSR J0546+2441"
		],
		[
			95.25,
			25,
			4250,
			"PSR J0621+25"
		],
		[
			92.817,
			30.267,
			1950,
			"PSR J0611+30"
		],
		[
			84.604,
			28.286,
			1300,
			"PSR J0538+2817"
		],
		[
			85.155,
			32.127,
			2370,
			"PSR J0540+3207"
		],
		[
			91.25,
			37,
			1160,
			"PSR J0605+37"
		],
		[
			93.203,
			37.36,
			1490,
			"PSR J0612+3721"
		],
		[
			93.301,
			37.527,
			1050,
			"PSR J0613+3731"
		],
		[
			92.75,
			37.3,
			1880,
			"PSR J0610+37"
		],
		[
			88.75,
			39.8,
			1760,
			"PSR J0555+3948"
		],
		[
			186.708,
			-32.45,
			3510,
			"PSR J1226-32"
		],
		[
			175.428,
			-33.377,
			3840,
			"PSR J1141-3322"
		],
		[
			175.357,
			-31.131,
			2720,
			"PSR J1141-3107"
		],
		[
			171.5,
			-27.617,
			2100,
			"PSR J1126-27"
		],
		[
			178.25,
			-21.3,
			2760,
			"PSR J1153-21"
		],
		[
			187.797,
			-14.195,
			450,
			"PSR J1231-1411"
		],
		[
			160.401,
			-19.704,
			3180,
			"PSR J1041-1942"
		],
		[
			197.969,
			-12.467,
			2300,
			"PSR J1311-1228"
		],
		[
			194.27,
			-10.452,
			2220,
			"PSR J1257-1027"
		],
		[
			201.99,
			-7.925,
			2170,
			"PSR J1327-0755"
		],
		[
			203,
			-3.433,
			2070,
			"PSR J1332-03"
		],
		[
			198,
			.85,
			1150,
			"PSR J1312+0051"
		],
		[
			198.346,
			9.532,
			780,
			"PSR J1313+0931"
		],
		[
			195.409,
			8.566,
			910,
			"PSR J1301+0833"
		],
		[
			195.015,
			12.682,
			600,
			"PSR J1300+1240"
		],
		[
			154.668,
			-16.703,
			3270,
			"PSR J1018-1642"
		],
		[
			156.161,
			-7.322,
			1100,
			"PSR J1024-0719"
		],
		[
			175.5,
			1.317,
			2040,
			"PSR J1142+0119"
		],
		[
			159.612,
			.545,
			2360,
			"PSR J1038+0032"
		],
		[
			161.68,
			3.069,
			2250,
			"PSR J1046+0304"
		],
		[
			149.25,
			-6.283,
			2990,
			"PSR J0957-06"
		],
		[
			155.949,
			.645,
			1370,
			"PSR J1023+0038"
		],
		[
			155.742,
			10.031,
			740,
			"PSR J1022+1001"
		],
		[
			148.289,
			7.927,
			260,
			"PSR J0953+0755"
		],
		[
			198.229,
			18.167,
			17200,
			"PSR J1312+1810"
		],
		[
			189.597,
			21.87,
			1770,
			"PSR J1238+21"
		],
		[
			191.658,
			22.883,
			1770,
			"PSR J1246+22"
		],
		[
			189.919,
			24.897,
			840,
			"PSR J1239+2453"
		],
		[
			174.014,
			15.851,
			350,
			"PSR J1136+1551"
		],
		[
			268.25,
			-38.817,
			6990,
			"PSR J1753-38"
		],
		[
			268.898,
			-37.27,
			6380,
			"PSR J1755-3716"
		],
		[
			274.274,
			-36.301,
			3780,
			"PSR J1817-3618"
		],
		[
			272.362,
			-35.788,
			13020,
			"PSR J1809-3547"
		],
		[
			267.551,
			-37.056,
			13800,
			"PSR J1750-3703B"
		],
		[
			267.558,
			-37.053,
			13800,
			"PSR J1750-3703A"
		],
		[
			267.556,
			-37.052,
			13800,
			"PSR J1750-3703C"
		],
		[
			267.555,
			-37.052,
			13800,
			"PSR J1750-3703D"
		],
		[
			268.728,
			-35.179,
			2240,
			"PSR J1754-3510"
		],
		[
			268.656,
			-34.732,
			5600,
			"PSR J1754-3443"
		],
		[
			265.775,
			-35.533,
			4010,
			"PSR J1743-35"
		],
		[
			267.685,
			-35.052,
			5070,
			"PSR J1750-3503"
		],
		[
			270.469,
			-34.977,
			4960,
			"PSR J1801-3458"
		],
		[
			270.73,
			-33.779,
			10240,
			"PSR J1802-3346"
		],
		[
			270.935,
			-33.486,
			6010,
			"PSR J1803-3329"
		],
		[
			272.019,
			-32.826,
			5060,
			"PSR J1808-3249"
		],
		[
			268.8,
			-33.517,
			9660,
			"PSR J1755-33"
		],
		[
			267.886,
			-33.394,
			9270,
			"PSR J1751-3323"
		],
		[
			270.358,
			-32.182,
			5080,
			"PSR J1801-3210"
		],
		[
			269.842,
			-31.123,
			3360,
			"PSR J1759-3107"
		],
		[
			276.508,
			-33.35,
			1580,
			"PSR J1825-33"
		],
		[
			275.945,
			-31.114,
			1660,
			"PSR J1823-3106"
		],
		[
			276.492,
			-31.039,
			5380,
			"PSR J1825-31"
		],
		[
			275.923,
			-30.361,
			12100,
			"PSR J1823-3021B"
		],
		[
			275.919,
			-30.362,
			12100,
			"PSR J1823-3021D"
		],
		[
			275.919,
			-30.361,
			12100,
			"PSR J1823-3021A"
		],
		[
			275.919,
			-30.361,
			12100,
			"PSR J1823-3021E"
		],
		[
			275.919,
			-30.361,
			12100,
			"PSR J1823-3021F"
		],
		[
			275.921,
			-30.361,
			12100,
			"PSR J1823-3021C"
		],
		[
			278.125,
			-28.717,
			6500,
			"PSR J1832-28"
		],
		[
			273.187,
			-30.656,
			4610,
			"PSR J1812-3039"
		],
		[
			270.892,
			-30.034,
			7800,
			"PSR J1803-30"
		],
		[
			270.892,
			-30.034,
			7800,
			"PSR J1803-3002B"
		],
		[
			270.892,
			-30.034,
			7800,
			"PSR J1803-3002C"
		],
		[
			271.427,
			-29.8,
			4610,
			"PSR J1805-2948"
		],
		[
			273.169,
			-27.801,
			3030,
			"PSR J1812-2748"
		],
		[
			274.148,
			-26.831,
			3610,
			"PSR J1816-2650"
		],
		[
			276.127,
			-25.622,
			5480,
			"PSR J1824-2537"
		],
		[
			264.011,
			-35.199,
			2720,
			"PSR J1736-3511"
		],
		[
			265.475,
			-34.317,
			4750,
			"PSR J1741-34"
		],
		[
			264.644,
			-33.267,
			4550,
			"PSR J1738-3316"
		],
		[
			264.294,
			-33.339,
			14080,
			"PSR J1737-3320"
		],
		[
			265.107,
			-33.465,
			4720,
			"PSR J1740-3327"
		],
		[
			265.815,
			-31.885,
			8030,
			"PSR J1743-3153"
		],
		[
			265.903,
			-31.839,
			3650,
			"PSR J1743-3150"
		],
		[
			262.732,
			-33.894,
			4230,
			"PSR J1730-3353"
		],
		[
			263.612,
			-33.556,
			7400,
			"PSR J1734-3333"
		],
		[
			263.48,
			-33.367,
			6300,
			"PSR J1733-3322"
		],
		[
			262.636,
			-33.844,
			4260,
			"PSR J1730-3350"
		],
		[
			262.81,
			-33.379,
			11980,
			"PSR J1731-3322"
		],
		[
			263.987,
			-32.972,
			11140,
			"PSR J1735-3258"
		],
		[
			264.726,
			-32.198,
			1480,
			"PSR J1738-3211"
		],
		[
			264.953,
			-31.997,
			4850,
			"PSR J1739-3159"
		],
		[
			264.268,
			-31.622,
			5880,
			"PSR J1737-3137"
		],
		[
			264.851,
			-31.521,
			7680,
			"PSR J1739-3131"
		],
		[
			264.697,
			-31.129,
			10760,
			"PSR J1738-3107"
		],
		[
			265.208,
			-30.868,
			10840,
			"PSR J1740-3052"
		],
		[
			263.14,
			-31.523,
			800,
			"PSR J1732-3131"
		],
		[
			263.712,
			-30.978,
			4370,
			"PSR J1734-3058"
		],
		[
			264.391,
			-31.033,
			4440,
			"PSR J1737-3102"
		],
		[
			264.847,
			-30.828,
			6970,
			"PSR J1739-3049"
		],
		[
			267.697,
			-31.962,
			4430,
			"PSR J1750-3157"
		],
		[
			266.024,
			-31.501,
			3640,
			"PSR J1744-3130"
		],
		[
			267,
			-30.283,
			11090,
			"PSR J1748-30"
		],
		[
			267.099,
			-30.153,
			5960,
			"PSR J1748-3009"
		],
		[
			268.567,
			-30.183,
			5470,
			"PSR J1754-30"
		],
		[
			267.306,
			-30.043,
			9050,
			"PSR J1749-3002"
		],
		[
			266.485,
			-30.673,
			200,
			"PSR J1745-3040"
		],
		[
			266.816,
			-29.967,
			2490,
			"PSR J1747-2958"
		],
		[
			265.279,
			-30.275,
			5020,
			"PSR J1741-3016"
		],
		[
			264.916,
			-30.387,
			3410,
			"PSR J1739-3023"
		],
		[
			265.141,
			-30.262,
			400,
			"PSR J1740-3015"
		],
		[
			264.718,
			-29.931,
			3910,
			"PSR J1738-2955"
		],
		[
			265.31,
			-29.76,
			4660,
			"PSR J1741-2945"
		],
		[
			266.317,
			-29.167,
			15230,
			"PSR J1745-2910"
		],
		[
			267.886,
			-28.963,
			1440,
			"PSR J1751-2857"
		],
		[
			267.517,
			-28.75,
			5190,
			"PSR J1750-28"
		],
		[
			268.102,
			-28.353,
			7620,
			"PSR J1752-2821"
		],
		[
			266.458,
			-29.2,
			18530,
			"PSR J1745-2912"
		],
		[
			266.706,
			-28.942,
			21770,
			"PSR J1746-2856"
		],
		[
			266.417,
			-29.008,
			8300,
			"PSR J1745-2900"
		],
		[
			266.527,
			-28.845,
			12860,
			"PSR J1746-2850"
		],
		[
			266.515,
			-28.822,
			3e4,
			"PSR J1746-2849"
		],
		[
			266.845,
			-28.154,
			17550,
			"PSR J1747-2809"
		],
		[
			266.861,
			-28.044,
			11780,
			"PSR J1747-2802"
		],
		[
			261.187,
			-31.818,
			10500,
			"PSR J1724-3149"
		],
		[
			261.65,
			-31.95,
			4820,
			"PSR J1726-31"
		],
		[
			262.752,
			-31.395,
			5320,
			"PSR J1731-3123"
		],
		[
			263.495,
			-30.514,
			14180,
			"PSR J1733-3030"
		],
		[
			261.829,
			-29.983,
			2390,
			"PSR J1727-29"
		],
		[
			261.813,
			-29.777,
			1620,
			"PSR J1727-2946"
		],
		[
			260.142,
			-29.554,
			1430,
			"PSR J1720-2933"
		],
		[
			262.534,
			-29.013,
			6850,
			"PSR J1730-2900"
		],
		[
			260.992,
			-28.881,
			4630,
			"PSR J1723-2852"
		],
		[
			261.291,
			-28.873,
			4090,
			"PSR J1725-2852"
		],
		[
			260.847,
			-28.633,
			1e3,
			"PSR J1723-2837"
		],
		[
			261.879,
			-27.65,
			3750,
			"PSR J1727-2739"
		],
		[
			264.893,
			-29.051,
			3190,
			"PSR J1739-2903"
		],
		[
			264.177,
			-28.731,
			5470,
			"PSR J1736-2843"
		],
		[
			263.391,
			-28.626,
			4660,
			"PSR J1733-2837"
		],
		[
			264.103,
			-28.328,
			4860,
			"PSR J1736-2819"
		],
		[
			264.561,
			-27.607,
			5910,
			"PSR J1738-2736"
		],
		[
			266.5,
			-27.85,
			5350,
			"PSR J1746-27"
		],
		[
			265.256,
			-27.564,
			3330,
			"PSR J1741-2733"
		],
		[
			265.396,
			-27.323,
			5740,
			"PSR J1741-2719"
		],
		[
			264.521,
			-26.796,
			3880,
			"PSR J1738-2647"
		],
		[
			265.189,
			-25.672,
			8260,
			"PSR J1740-2540"
		],
		[
			264.189,
			-24.964,
			4340,
			"PSR J1736-2457"
		],
		[
			269.951,
			-29.369,
			1920,
			"PSR J1759-2922"
		],
		[
			270.445,
			-29.344,
			3270,
			"PSR J1801-2920"
		],
		[
			269.564,
			-28.767,
			1710,
			"PSR J1758-2846"
		],
		[
			271.2,
			-28.117,
			4800,
			"PSR J1804-28"
		],
		[
			271.785,
			-27.251,
			9630,
			"PSR J1807-2715"
		],
		[
			272.055,
			-27.022,
			2450,
			"PSR J1808-2701"
		],
		[
			271.088,
			-27.292,
			1170,
			"PSR J1804-2717"
		],
		[
			270.882,
			-27.202,
			3620,
			"PSR J1803-2712"
		],
		[
			268.245,
			-28.11,
			200,
			"PSR J1752-2806"
		],
		[
			269.478,
			-27.75,
			5420,
			"PSR J1757-27"
		],
		[
			268.924,
			-27.429,
			2830,
			"PSR J1755-2725"
		],
		[
			269.643,
			-26.503,
			4990,
			"PSR J1758-2630"
		],
		[
			269.331,
			-26.319,
			7740,
			"PSR J1756-2619"
		],
		[
			269.633,
			-25.68,
			3850,
			"PSR J1758-2540"
		],
		[
			268.818,
			-26,
			5170,
			"PSR J1755-26"
		],
		[
			268.9,
			-25.883,
			11040,
			"PSR J1755-25"
		],
		[
			269.175,
			-25.467,
			10390,
			"PSR J1756-25"
		],
		[
			269.896,
			-25.819,
			5940,
			"PSR J1759-2549"
		],
		[
			273.419,
			-26.366,
			3370,
			"PSR J1813-2621"
		],
		[
			271.807,
			-25.956,
			11210,
			"PSR J1807-2557"
		],
		[
			273.135,
			-25.444,
			14710,
			"PSR J1812-2526"
		],
		[
			272.981,
			-24.665,
			3850,
			"PSR J1811-2439"
		],
		[
			271.358,
			-24.792,
			4790,
			"PSR J1805-2447"
		],
		[
			271.837,
			-25.001,
			2790,
			"PSR J1807-2459B"
		],
		[
			271.835,
			-24.998,
			2790,
			"PSR J1807-2459A"
		],
		[
			270.25,
			-24.858,
			4610,
			"PSR J1801-2451"
		],
		[
			270.513,
			-24.445,
			12130,
			"PSR J1802-2426"
		],
		[
			272.833,
			-24.088,
			1700,
			"PSR J1811-2405"
		],
		[
			273.371,
			-22.702,
			6780,
			"PSR J1813-2242"
		],
		[
			266.879,
			-26.787,
			8440,
			"PSR J1747-2647"
		],
		[
			267.297,
			-26.486,
			5280,
			"PSR J1749-2629"
		],
		[
			267.639,
			-25.612,
			3510,
			"PSR J1750-2536"
		],
		[
			267.202,
			-24.744,
			3890,
			"PSR J1748-2444"
		],
		[
			268.958,
			-25.577,
			7220,
			"PSR J1755-2534"
		],
		[
			268.999,
			-25.357,
			4120,
			"PSR J1755-2521"
		],
		[
			268.83,
			-25.352,
			11520,
			"PSR J1755-25211"
		],
		[
			267.969,
			-25.279,
			7460,
			"PSR J1751-2516"
		],
		[
			268.378,
			-25.007,
			10180,
			"PSR J1753-2501"
		],
		[
			269.241,
			-24.593,
			4960,
			"PSR J1756-2435"
		],
		[
			269.372,
			-24.369,
			3510,
			"PSR J1757-2421"
		],
		[
			267.596,
			-24.746,
			5030,
			"PSR J1750-2444"
		],
		[
			267.749,
			-24.649,
			7150,
			"PSR J1750-2438"
		],
		[
			268.652,
			-24.373,
			11430,
			"PSR J1754-2422"
		],
		[
			268.245,
			-24.174,
			7420,
			"PSR J1752-2410"
		],
		[
			265.834,
			-24.715,
			4960,
			"PSR J1743-2442"
		],
		[
			267.02,
			-24.779,
			5500,
			"PSR J1748-2446J"
		],
		[
			267.02,
			-24.779,
			5500,
			"PSR J1748-2446K"
		],
		[
			267.02,
			-24.779,
			5500,
			"PSR J1748-2446L"
		],
		[
			267.02,
			-24.779,
			5500,
			"PSR J1748-2446I"
		],
		[
			267.02,
			-24.779,
			5500,
			"PSR J1748-2446aa"
		],
		[
			267.02,
			-24.779,
			5500,
			"PSR J1748-2446ab"
		],
		[
			267.02,
			-24.779,
			5500,
			"PSR J1748-2446ac"
		],
		[
			267.02,
			-24.779,
			5500,
			"PSR J1748-2446ad"
		],
		[
			267.02,
			-24.779,
			4410,
			"PSR J1748-2446ae"
		],
		[
			267.02,
			-24.779,
			5500,
			"PSR J1748-2446af"
		],
		[
			267.02,
			-24.779,
			5500,
			"PSR J1748-2446ag"
		],
		[
			267.02,
			-24.779,
			5500,
			"PSR J1748-2446ah"
		],
		[
			267.02,
			-24.779,
			5500,
			"PSR J1748-2446ai"
		],
		[
			267.02,
			-24.779,
			8700,
			"PSR J1748-2446D"
		],
		[
			267.02,
			-24.779,
			5500,
			"PSR J1748-2446E"
		],
		[
			267.02,
			-24.779,
			5500,
			"PSR J1748-2446F"
		],
		[
			267.02,
			-24.779,
			5500,
			"PSR J1748-2446G"
		],
		[
			267.02,
			-24.779,
			5500,
			"PSR J1748-2446H"
		],
		[
			267.02,
			-24.779,
			5500,
			"PSR J1748-2446M"
		],
		[
			267.02,
			-24.779,
			5500,
			"PSR J1748-2446N"
		],
		[
			267.02,
			-24.779,
			5500,
			"PSR J1748-2446O"
		],
		[
			267.02,
			-24.779,
			4410,
			"PSR J1748-2446P"
		],
		[
			267.02,
			-24.779,
			5500,
			"PSR J1748-2446Q"
		],
		[
			267.02,
			-24.779,
			5500,
			"PSR J1748-2446R"
		],
		[
			267.02,
			-24.779,
			5500,
			"PSR J1748-2446S"
		],
		[
			267.02,
			-24.779,
			5500,
			"PSR J1748-2446T"
		],
		[
			267.02,
			-24.779,
			5500,
			"PSR J1748-2446U"
		],
		[
			267.02,
			-24.779,
			5500,
			"PSR J1748-2446V"
		],
		[
			267.02,
			-24.779,
			5500,
			"PSR J1748-2446W"
		],
		[
			267.02,
			-24.779,
			5500,
			"PSR J1748-2446X"
		],
		[
			267.02,
			-24.779,
			5500,
			"PSR J1748-2446Y"
		],
		[
			267.02,
			-24.779,
			5500,
			"PSR J1748-2446Z"
		],
		[
			267.019,
			-24.777,
			5500,
			"PSR J1748-2446C"
		],
		[
			267.009,
			-24.777,
			5500,
			"PSR J1748-2446A"
		],
		[
			267.315,
			-23.788,
			6100,
			"PSR J1749-2347"
		],
		[
			266.202,
			-23.599,
			2450,
			"PSR J1744-2335"
		],
		[
			269.85,
			-24.033,
			10780,
			"PSR J1759-24"
		],
		[
			270,
			-23.717,
			4380,
			"PSR J1800-2343"
		],
		[
			270.333,
			-23.079,
			4e3,
			"PSR J1801-2304"
		],
		[
			269.194,
			-22.866,
			730,
			"PSR J1756-2251"
		],
		[
			269.879,
			-23.121,
			11200,
			"PSR J1759-2307"
		],
		[
			269.955,
			-23.036,
			11880,
			"PSR J1759-2302"
		],
		[
			271.117,
			-22.472,
			5330,
			"PSR J1804-2228"
		],
		[
			270.285,
			-21.909,
			5160,
			"PSR J1801-2154"
		],
		[
			271.582,
			-21.428,
			10020,
			"PSR J1806-2125"
		],
		[
			270.964,
			-21.619,
			4400,
			"PSR J1803-2137"
		],
		[
			268.416,
			-22.678,
			3460,
			"PSR J1753-2240"
		],
		[
			269.462,
			-22.397,
			4110,
			"PSR J1757-2223"
		],
		[
			269.106,
			-22.43,
			5020,
			"PSR J1756-2225"
		],
		[
			269.685,
			-22.112,
			11380,
			"PSR J1758-2206"
		],
		[
			269.851,
			-22.092,
			3540,
			"PSR J1759-2205"
		],
		[
			270.522,
			-21.401,
			3330,
			"PSR J1802-2124"
		],
		[
			270.385,
			-21.255,
			12260,
			"PSR J1801-2115"
		],
		[
			270.051,
			-21.239,
			11180,
			"PSR J1800-2114"
		],
		[
			269.898,
			-19.936,
			4440,
			"PSR J1759-1956"
		],
		[
			269.988,
			-19.675,
			5240,
			"PSR J1759-1940"
		],
		[
			285.198,
			-26.012,
			700,
			"PSR J1900-2600"
		],
		[
			283.248,
			-26.17,
			2260,
			"PSR J1852-2610"
		],
		[
			276.133,
			-24.87,
			5500,
			"PSR J1824-2452A"
		],
		[
			276.137,
			-24.87,
			5500,
			"PSR J1824-2452B"
		],
		[
			276.137,
			-24.87,
			5500,
			"PSR J1824-2452C"
		],
		[
			276.137,
			-24.87,
			5500,
			"PSR J1824-2452D"
		],
		[
			276.137,
			-24.87,
			5500,
			"PSR J1824-2452E"
		],
		[
			276.137,
			-24.87,
			5500,
			"PSR J1824-2452F"
		],
		[
			276.137,
			-24.87,
			5500,
			"PSR J1824-2452G"
		],
		[
			276.137,
			-24.87,
			5500,
			"PSR J1824-2452H"
		],
		[
			276.136,
			-24.869,
			5500,
			"PSR J1824-2452I"
		],
		[
			276.137,
			-24.87,
			5500,
			"PSR J1824-2452J"
		],
		[
			276.137,
			-24.87,
			5500,
			"PSR J1824-2452K"
		],
		[
			276.137,
			-24.87,
			5500,
			"PSR J1824-2452L"
		],
		[
			279.106,
			-23.915,
			3200,
			"PSR J1836-2354A"
		],
		[
			279.101,
			-23.908,
			3200,
			"PSR J1836-2354B"
		],
		[
			284.5,
			-22.267,
			1350,
			"PSR J1858-2216"
		],
		[
			282.075,
			-19.875,
			950,
			"PSR J1848-1952"
		],
		[
			285.325,
			-17.667,
			1270,
			"PSR J1901-1740"
		],
		[
			286.187,
			-16.413,
			9860,
			"PSR J1904-16"
		],
		[
			286.778,
			-15.537,
			3090,
			"PSR J1907-1532"
		],
		[
			276.119,
			-23.471,
			5760,
			"PSR J1824-2328"
		],
		[
			275.746,
			-22.942,
			3430,
			"PSR J1822-2256"
		],
		[
			276.043,
			-22.553,
			4260,
			"PSR J1824-2233"
		],
		[
			277.09,
			-21.332,
			12560,
			"PSR J1828-2119"
		],
		[
			274.25,
			-23.183,
			5610,
			"PSR J1817-2311"
		],
		[
			279.641,
			-18.833,
			6300,
			"PSR J1838-1849"
		],
		[
			279.476,
			-18.619,
			3040,
			"PSR J1837-1837"
		],
		[
			276.002,
			-19.764,
			3700,
			"PSR J1824-1945"
		],
		[
			278.691,
			-18.933,
			6210,
			"PSR J1834-1855"
		],
		[
			273.087,
			-21.043,
			9620,
			"PSR J1812-2102"
		],
		[
			273.416,
			-21.217,
			8750,
			"PSR J1813-2113"
		],
		[
			272.31,
			-21.151,
			5200,
			"PSR J1809-2109"
		],
		[
			272.027,
			-20.969,
			7350,
			"PSR J1808-2057"
		],
		[
			272.164,
			-20.411,
			13e3,
			"PSR J1808-2024"
		],
		[
			272.746,
			-20.086,
			4050,
			"PSR J1810-2005"
		],
		[
			272.316,
			-20.07,
			10910,
			"PSR J1809-2004"
		],
		[
			274.278,
			-19.643,
			10740,
			"PSR J1817-1938"
		],
		[
			272.872,
			-19.424,
			5e3,
			"PSR J1811-1925"
		],
		[
			273.145,
			-19.177,
			11540,
			"PSR J1812-1910"
		],
		[
			273.763,
			-19.167,
			7690,
			"PSR J1815-1910"
		],
		[
			271.367,
			-20.621,
			9260,
			"PSR J1805-2037"
		],
		[
			271.405,
			-20.547,
			11870,
			"PSR J1805-2032"
		],
		[
			272.463,
			-19.731,
			3600,
			"PSR J1809-1943"
		],
		[
			272.43,
			-19.294,
			3710,
			"PSR J1809-1917"
		],
		[
			270.873,
			-19.345,
			6460,
			"PSR J1803-1920"
		],
		[
			270.445,
			-19.16,
			4810,
			"PSR J1801-1909"
		],
		[
			271.527,
			-19.34,
			10160,
			"PSR J1806-1920"
		],
		[
			270.996,
			-18.955,
			5880,
			"PSR J1803-1857"
		],
		[
			272.405,
			-18.849,
			7060,
			"PSR J1809-1850"
		],
		[
			272.874,
			-18.596,
			9360,
			"PSR J1811-1835"
		],
		[
			272.731,
			-18.344,
			5590,
			"PSR J1810-1820"
		],
		[
			273.397,
			-17.833,
			4700,
			"PSR J1813-1749"
		],
		[
			273.68,
			-17.747,
			9770,
			"PSR J1814-1744"
		],
		[
			272.979,
			-17.61,
			5930,
			"PSR J1811-1736"
		],
		[
			273.066,
			-17.56,
			6320,
			"PSR J1812-1733"
		],
		[
			273.03,
			-17.308,
			4200,
			"PSR J1812-1718"
		],
		[
			272.861,
			-17.296,
			7030,
			"PSR J1811-1717"
		],
		[
			275.79,
			-18.126,
			6640,
			"PSR J1823-1807"
		],
		[
			275.163,
			-18.301,
			8430,
			"PSR J1820-1818"
		],
		[
			277.43,
			-17.851,
			5490,
			"PSR J1829-1751"
		],
		[
			273.811,
			-17.634,
			9010,
			"PSR J1815-1738"
		],
		[
			274.078,
			-17.484,
			6480,
			"PSR J1816-1729"
		],
		[
			274.931,
			-17.288,
			5870,
			"PSR J1819-1717"
		],
		[
			274.875,
			-17.083,
			1850,
			"PSR J1819-17"
		],
		[
			273.656,
			-16.824,
			9620,
			"PSR J1814-1649"
		],
		[
			275.652,
			-16.293,
			11640,
			"PSR J1822-1617"
		],
		[
			276.552,
			-15.434,
			10870,
			"PSR J1826-1526"
		],
		[
			274.716,
			-15.934,
			4010,
			"PSR J1818-1556"
		],
		[
			275.17,
			-15.497,
			9600,
			"PSR J1820-1529"
		],
		[
			274.656,
			-15.696,
			8240,
			"PSR J1818-1541"
		],
		[
			274.974,
			-15.172,
			5610,
			"PSR J1819-1510"
		],
		[
			275.839,
			-15.439,
			9170,
			"PSR J1823-1526"
		],
		[
			276.059,
			-15.009,
			8300,
			"PSR J1824-1500"
		],
		[
			278.723,
			-17.181,
			3530,
			"PSR J1834-1710"
		],
		[
			280.89,
			-15.117,
			9050,
			"PSR J1843-1507"
		],
		[
			283.723,
			-15.956,
			11750,
			"PSR J1854-1557"
		],
		[
			283.685,
			-14.357,
			5230,
			"PSR J1854-1421"
		],
		[
			282.163,
			-14.238,
			4390,
			"PSR J1848-1414"
		],
		[
			278.96,
			-15.811,
			15040,
			"PSR J1835-1548"
		],
		[
			280.756,
			-14.804,
			3420,
			"PSR J1843-1448"
		],
		[
			280.137,
			-14.318,
			1010,
			"PSR J1840-1419"
		],
		[
			280.393,
			-14.072,
			10850,
			"PSR J1841-1404"
		],
		[
			277.871,
			-14.396,
			8020,
			"PSR J1831-1423"
		],
		[
			277.501,
			-14.244,
			7810,
			"PSR J1830-1414"
		],
		[
			276.262,
			-14.781,
			5450,
			"PSR J1825-1446"
		],
		[
			276.677,
			-14.323,
			3590,
			"PSR J1826-1419"
		],
		[
			276.239,
			-14.385,
			6050,
			"PSR J1824-1423"
		],
		[
			277.179,
			-13.612,
			7990,
			"PSR J1828-1336"
		],
		[
			279.218,
			-13.409,
			3910,
			"PSR J1836-1324"
		],
		[
			277.983,
			-13.499,
			6480,
			"PSR J1831-1329"
		],
		[
			277.675,
			-13.221,
			10420,
			"PSR J1830-1313"
		],
		[
			281.298,
			-13.865,
			7100,
			"PSR J1845-1351"
		],
		[
			282.008,
			-12.783,
			2430,
			"PSR J1848-12"
		],
		[
			282.049,
			-11.836,
			4770,
			"PSR J1848-1150"
		],
		[
			279.932,
			-12.645,
			4180,
			"PSR J1839-1238"
		],
		[
			279.289,
			-12.732,
			7510,
			"PSR J1837-1243"
		],
		[
			280.224,
			-12.126,
			9590,
			"PSR J1840-1207"
		],
		[
			278.596,
			-12.041,
			6280,
			"PSR J1834-1202"
		],
		[
			280.1,
			-11.37,
			8300,
			"PSR J1840-1122"
		],
		[
			280.922,
			-11.225,
			1970,
			"PSR J1843-1113"
		],
		[
			281.441,
			-11.236,
			5820,
			"PSR J1845-1114"
		],
		[
			258.049,
			-27.265,
			3130,
			"PSR J1712-2715"
		],
		[
			257.52,
			-26.276,
			4260,
			"PSR J1710-2616"
		],
		[
			263.358,
			-25.553,
			7780,
			"PSR J1733-2533"
		],
		[
			263.673,
			-24.256,
			3480,
			"PSR J1734-2415"
		],
		[
			260.273,
			-24.952,
			1560,
			"PSR J1721-2457"
		],
		[
			260.094,
			-24.774,
			3440,
			"PSR J1720-2446"
		],
		[
			262.59,
			-23.075,
			620,
			"PSR J1730-2304"
		],
		[
			259.904,
			-23.485,
			4080,
			"PSR J1719-23"
		],
		[
			264.537,
			-23.513,
			2790,
			"PSR J1738-2330"
		],
		[
			266.32,
			-22.487,
			9300,
			"PSR J1745-2229"
		],
		[
			263.36,
			-22.477,
			1490,
			"PSR J1733-2228"
		],
		[
			265.488,
			-20.899,
			300,
			"PSR J1741-2054"
		],
		[
			265.279,
			-20.323,
			2e3,
			"PSR J1741-2019"
		],
		[
			267.577,
			-20.719,
			5690,
			"PSR J1750-2043"
		],
		[
			267.213,
			-20.365,
			8240,
			"PSR J1748-2021C"
		],
		[
			267.22,
			-20.361,
			8240,
			"PSR J1748-2021A"
		],
		[
			267.221,
			-20.361,
			8240,
			"PSR J1748-2021B"
		],
		[
			267.218,
			-20.361,
			8240,
			"PSR J1748-2021F"
		],
		[
			267.22,
			-20.358,
			8240,
			"PSR J1748-2021E"
		],
		[
			267.215,
			-20.352,
			8240,
			"PSR J1748-2021D"
		],
		[
			268.899,
			-20.417,
			8640,
			"PSR J1755-2025"
		],
		[
			269.523,
			-19.528,
			4230,
			"PSR J1758-1931"
		],
		[
			268.397,
			-19.249,
			2770,
			"PSR J1753-1914"
		],
		[
			262.295,
			-21.291,
			1420,
			"PSR J1729-2117"
		],
		[
			263.083,
			-19.502,
			2210,
			"PSR J1732-1930"
		],
		[
			262.823,
			-18.792,
			4030,
			"PSR J1731-1847"
		],
		[
			260.256,
			-19.614,
			8600,
			"PSR J1721-1936"
		],
		[
			260.444,
			-19.664,
			4640,
			"PSR J1721-1939"
		],
		[
			266.069,
			-16.177,
			1990,
			"PSR J1744-1610"
		],
		[
			253.244,
			-24.064,
			3100,
			"PSR J1652-2404"
		],
		[
			253.512,
			-23.583,
			3600,
			"PSR J1654-23"
		],
		[
			251.576,
			-21.702,
			1410,
			"PSR J1646-2142"
		],
		[
			253.379,
			-20.915,
			2640,
			"PSR J1653-2054"
		],
		[
			256.4,
			-19.111,
			1180,
			"PSR J1705-1906"
		],
		[
			255.963,
			-18.771,
			2050,
			"PSR J1703-1846"
		],
		[
			248.48,
			-20.169,
			2760,
			"PSR J1633-2009"
		],
		[
			252.882,
			-17.156,
			1620,
			"PSR J1651-1709"
		],
		[
			252.613,
			-16.911,
			2150,
			"PSR J1650-1654"
		],
		[
			260.105,
			-16.559,
			1760,
			"PSR J1720-1633"
		],
		[
			257.36,
			-16.683,
			2610,
			"PSR J1709-1640"
		],
		[
			257.979,
			-15.161,
			2940,
			"PSR J1711-1509"
		],
		[
			259.792,
			-14.634,
			1640,
			"PSR J1719-1438"
		],
		[
			254.971,
			-13.086,
			4850,
			"PSR J1659-1305"
		],
		[
			258.667,
			-10.903,
			2650,
			"PSR J1714-1054"
		],
		[
			269.924,
			-19.055,
			13300,
			"PSR J1759-1903"
		],
		[
			270.343,
			-18.93,
			11910,
			"PSR J1801-1855"
		],
		[
			270.562,
			-17.755,
			5220,
			"PSR J1802-1745"
		],
		[
			269.867,
			-17.603,
			4750,
			"PSR J1759-1736"
		],
		[
			272.176,
			-17.441,
			8570,
			"PSR J1808-1726"
		],
		[
			271.607,
			-16.311,
			6360,
			"PSR J1806-1618"
		],
		[
			270.894,
			-16.275,
			12900,
			"PSR J1803-1616"
		],
		[
			268.799,
			-16.845,
			4270,
			"PSR J1755-1650"
		],
		[
			269.35,
			-15.055,
			4190,
			"PSR J1757-15"
		],
		[
			272.163,
			-15.294,
			4160,
			"PSR J1808-1517"
		],
		[
			272.747,
			-14.693,
			5880,
			"PSR J1810-1441"
		],
		[
			274.561,
			-15.329,
			9980,
			"PSR J1818-1519"
		],
		[
			274.401,
			-15.194,
			11580,
			"PSR J1817-1511"
		],
		[
			274.122,
			-14.775,
			8980,
			"PSR J1816-1446"
		],
		[
			274.892,
			-14.968,
			3810,
			"PSR J1819-1458"
		],
		[
			274.616,
			-14.811,
			7960,
			"PSR J1818-1448"
		],
		[
			275.416,
			-14.548,
			6950,
			"PSR J1821-1432"
		],
		[
			275.393,
			-14.324,
			11930,
			"PSR J1821-1419"
		],
		[
			274.599,
			-14.377,
			8100,
			"PSR J1818-1422"
		],
		[
			274.987,
			-14.134,
			12450,
			"PSR J1819-1408"
		],
		[
			271.275,
			-15.077,
			5300,
			"PSR J1805-1504"
		],
		[
			272.44,
			-14.49,
			12010,
			"PSR J1809-1429"
		],
		[
			270.463,
			-14.293,
			1800,
			"PSR J1801-1417"
		],
		[
			265.907,
			-13.861,
			4850,
			"PSR J1743-1351"
		],
		[
			268.221,
			-12.983,
			2170,
			"PSR J1753-12"
		],
		[
			267.073,
			-13.014,
			3640,
			"PSR J1748-1300"
		],
		[
			271.528,
			-11.908,
			3560,
			"PSR J1806-1154"
		],
		[
			269.893,
			-10.499,
			3770,
			"PSR J1759-1029"
		],
		[
			275.725,
			-14.001,
			7770,
			"PSR J1822-1400"
		],
		[
			276.209,
			-13.839,
			7060,
			"PSR J1824-1350"
		],
		[
			275.851,
			-13.798,
			11140,
			"PSR J1823-1347"
		],
		[
			275.082,
			-13.771,
			9630,
			"PSR J1820-1346"
		],
		[
			276.555,
			-13.58,
			4120,
			"PSR J1826-1334"
		],
		[
			274.932,
			-13.312,
			1520,
			"PSR J1819-1318"
		],
		[
			275.674,
			-12.88,
			10610,
			"PSR J1822-1252"
		],
		[
			277.803,
			-12.392,
			5510,
			"PSR J1831-1223"
		],
		[
			276.234,
			-11.998,
			6090,
			"PSR J1824-1159"
		],
		[
			277.507,
			-11.592,
			4360,
			"PSR J1830-1135"
		],
		[
			276.523,
			-11.529,
			4830,
			"PSR J1826-1131"
		],
		[
			277.079,
			-11.031,
			7260,
			"PSR J1828-1101"
		],
		[
			277.138,
			-10.957,
			4270,
			"PSR J1828-1057"
		],
		[
			274.992,
			-11.525,
			12250,
			"PSR J1819-1131"
		],
		[
			274.61,
			-11.275,
			10290,
			"PSR J1818-1116"
		],
		[
			276.123,
			-11.312,
			8030,
			"PSR J1824-1118"
		],
		[
			275.833,
			-11.434,
			8720,
			"PSR J1823-1126"
		],
		[
			275.918,
			-11.253,
			6280,
			"PSR J1823-1115"
		],
		[
			276.326,
			-11.148,
			2710,
			"PSR J1825-1108"
		],
		[
			274.87,
			-11.245,
			5820,
			"PSR J1819-1114"
		],
		[
			278.493,
			-10.925,
			8440,
			"PSR J1833-1055"
		],
		[
			279.025,
			-11.283,
			6010,
			"PSR J1836-11"
		],
		[
			278.826,
			-11.104,
			3080,
			"PSR J1835-1106"
		],
		[
			279.61,
			-10.782,
			4350,
			"PSR J1838-1046"
		],
		[
			278.99,
			-10.335,
			2570,
			"PSR J1835-1020"
		],
		[
			277.698,
			-10.991,
			3580,
			"PSR J1830-1059"
		],
		[
			277.525,
			-10.65,
			4010,
			"PSR J1830-10"
		],
		[
			278.39,
			-10.569,
			4100,
			"PSR J1833-1034"
		],
		[
			278.17,
			-10.359,
			6430,
			"PSR J1832-1021"
		],
		[
			279.225,
			-10.136,
			5390,
			"PSR J1836-1008"
		],
		[
			280.592,
			-9.09,
			7410,
			"PSR J1842-0905"
		],
		[
			278.937,
			-9.777,
			4040,
			"PSR J1835-0946"
		],
		[
			278.944,
			-9.741,
			4670,
			"PSR J1835-0944"
		],
		[
			278.843,
			-9.467,
			6360,
			"PSR J1835-0928"
		],
		[
			278.908,
			-9.407,
			6620,
			"PSR J1835-0924"
		],
		[
			278.841,
			-9.404,
			6850,
			"PSR J1835-09242"
		],
		[
			279.973,
			-9.087,
			6140,
			"PSR J1839-0905"
		],
		[
			277.275,
			-10.19,
			7370,
			"PSR J1829-1011"
		],
		[
			277.126,
			-10.119,
			4720,
			"PSR J1828-1007"
		],
		[
			276.773,
			-9.979,
			6150,
			"PSR J1827-0958"
		],
		[
			277.893,
			-9.867,
			4330,
			"PSR J1831-0952"
		],
		[
			276.941,
			-9.571,
			4470,
			"PSR J1827-0934"
		],
		[
			276.378,
			-9.59,
			300,
			"PSR J1825-0935"
		],
		[
			278.65,
			-9.25,
			6880,
			"PSR J1834-09"
		],
		[
			278.418,
			-8.459,
			4500,
			"PSR J1833-0827"
		],
		[
			279.429,
			-8.334,
			7040,
			"PSR J1837-08"
		],
		[
			278.115,
			-8.615,
			1400,
			"PSR J1832-0836"
		],
		[
			278.154,
			-8.451,
			5200,
			"PSR J1832-0827"
		],
		[
			277.901,
			-8.39,
			4410,
			"PSR J1831-0823"
		],
		[
			278.624,
			-8.2,
			10340,
			"PSR J1834-0812"
		],
		[
			278.63,
			-7.706,
			6910,
			"PSR J1834-0742"
		],
		[
			278.567,
			-7.519,
			4760,
			"PSR J1834-0731"
		],
		[
			272.821,
			-10.817,
			8500,
			"PSR J1811-1049"
		],
		[
			272.19,
			-10.347,
			8500,
			"PSR J1808-1020"
		],
		[
			274.917,
			-10.141,
			10750,
			"PSR J1819-1008"
		],
		[
			274.961,
			-9.431,
			11100,
			"PSR J1819-0925"
		],
		[
			271.908,
			-8.795,
			1500,
			"PSR J1807-0847"
		],
		[
			272.039,
			-8.217,
			5180,
			"PSR J1808-0813"
		],
		[
			272.4,
			-7.717,
			17820,
			"PSR J1809-0743"
		],
		[
			275.666,
			-9.127,
			12310,
			"PSR J1822-0907"
		],
		[
			275.716,
			-8.816,
			4190,
			"PSR J1822-0848"
		],
		[
			276.761,
			-7.839,
			7390,
			"PSR J1827-0750"
		],
		[
			277.272,
			-7.573,
			5450,
			"PSR J1829-0734"
		],
		[
			277.086,
			-6.198,
			8760,
			"PSR J1828-0611"
		],
		[
			274.102,
			-7.923,
			3210,
			"PSR J1816-0755"
		],
		[
			274.457,
			-7.722,
			770,
			"PSR J1817-0743"
		],
		[
			264.991,
			-13.222,
			2020,
			"PSR J1739-1313"
		],
		[
			266.123,
			-11.582,
			400,
			"PSR J1744-1134"
		],
		[
			266.993,
			-10.501,
			7270,
			"PSR J1747-1030"
		],
		[
			268.793,
			-9.064,
			2160,
			"PSR J1755-0903"
		],
		[
			266.288,
			-9.878,
			2380,
			"PSR J1745-0952"
		],
		[
			261.301,
			-7.55,
			3430,
			"PSR J1725-0732"
		],
		[
			265.344,
			-8.675,
			3500,
			"PSR J1741-0840"
		],
		[
			264.446,
			-8.186,
			2380,
			"PSR J1737-0811"
		],
		[
			263.771,
			-7.415,
			4320,
			"PSR J1735-0724"
		],
		[
			270.481,
			-8.957,
			7200,
			"PSR J1801-0857D"
		],
		[
			270.461,
			-8.959,
			7200,
			"PSR J1801-0857C"
		],
		[
			270.461,
			-8.959,
			7200,
			"PSR J1801-0857A"
		],
		[
			270.461,
			-8.959,
			7200,
			"PSR J1801-0857B"
		],
		[
			271.208,
			-7.59,
			7800,
			"PSR J1804-0735"
		],
		[
			271.381,
			-6.329,
			6690,
			"PSR J1805-0619"
		],
		[
			270.55,
			-5.398,
			6820,
			"PSR J1802-05"
		],
		[
			273.672,
			-6.3,
			5630,
			"PSR J1814-0618"
		],
		[
			273.609,
			-5.36,
			4370,
			"PSR J1814-0521"
		],
		[
			275.095,
			-5.161,
			2810,
			"PSR J1820-0509"
		],
		[
			275.219,
			-4.461,
			300,
			"PSR J1820-0427"
		],
		[
			265.784,
			-3.653,
			1590,
			"PSR J1743-0339"
		],
		[
			270.344,
			-3.965,
			7130,
			"PSR J1801-0357"
		],
		[
			270.092,
			-1.425,
			2240,
			"PSR J1800-0125"
		],
		[
			292.624,
			-18.863,
			2340,
			"PSR J1930-1852"
		],
		[
			291.275,
			-16.017,
			7e3,
			"PSR J1925-16"
		],
		[
			295.856,
			-12.628,
			1640,
			"PSR J1943-1237"
		],
		[
			291.724,
			-13.234,
			2090,
			"PSR J1926-1314"
		],
		[
			296.741,
			-13.21,
			5640,
			"PSR J1946-1312"
		],
		[
			301.568,
			-8.117,
			2010,
			"PSR J2006-0807"
		],
		[
			296,
			-10.283,
			1760,
			"PSR J1944-10"
		],
		[
			288.75,
			-11.5,
			4760,
			"PSR J1915-11"
		],
		[
			287.955,
			-11.24,
			1590,
			"PSR J1911-1114"
		],
		[
			286.139,
			-12.4,
			5630,
			"PSR J1904-1224"
		],
		[
			289.701,
			-10.88,
			2780,
			"PSR J1918-1052"
		],
		[
			290.204,
			-9.774,
			5750,
			"PSR J1920-09"
		],
		[
			284.36,
			-10.45,
			3640,
			"PSR J1857-1027"
		],
		[
			285.575,
			-10.659,
			3150,
			"PSR J1902-10"
		],
		[
			285.058,
			-9.469,
			5760,
			"PSR J1900-09"
		],
		[
			285.471,
			-9.103,
			2420,
			"PSR J1901-0906"
		],
		[
			285.797,
			-8.816,
			2320,
			"PSR J1903-0848"
		],
		[
			283.815,
			-9.684,
			4870,
			"PSR J1855-0941"
		],
		[
			284.685,
			-7.617,
			7200,
			"PSR J1858-0736"
		],
		[
			285.908,
			-6.539,
			8770,
			"PSR J1903-0632"
		],
		[
			289.7,
			-6.71,
			910,
			"PSR J1918-0642"
		],
		[
			288.476,
			-4.68,
			3220,
			"PSR J1913-0440"
		],
		[
			303.324,
			-6.818,
			4850,
			"PSR J2013-0649"
		],
		[
			308.38,
			.706,
			2870,
			"PSR J2033+0042"
		],
		[
			301.432,
			-.339,
			2160,
			"PSR J2005-0020"
		],
		[
			296.368,
			-.683,
			3530,
			"PSR J1945-0040"
		],
		[
			294.287,
			-.283,
			3600,
			"PSR J1937-00"
		],
		[
			295.317,
			1.361,
			2890,
			"PSR J1941+0121"
		],
		[
			304.345,
			6.052,
			1320,
			"PSR J2017+0603"
		],
		[
			281.274,
			-8.444,
			4870,
			"PSR J1845-0826"
		],
		[
			280.216,
			-8.675,
			4940,
			"PSR J1840-0840"
		],
		[
			280.87,
			-8.112,
			4550,
			"PSR J1843-0806"
		],
		[
			280.057,
			-8.253,
			4500,
			"PSR J1840-0815"
		],
		[
			280.139,
			-8.151,
			5770,
			"PSR J1840-0809"
		],
		[
			280.729,
			-8.015,
			4230,
			"PSR J1842-0800"
		],
		[
			281.582,
			-7.823,
			10100,
			"PSR J1846-0749"
		],
		[
			281.533,
			-7.82,
			4470,
			"PSR J1846-07492"
		],
		[
			281.488,
			-7.727,
			5850,
			"PSR J1845-0743"
		],
		[
			280.773,
			-7.742,
			5770,
			"PSR J1843-0744"
		],
		[
			283.356,
			-6.824,
			1890,
			"PSR J1853-0649"
		],
		[
			283.239,
			-6.599,
			4600,
			"PSR J1852-0635"
		],
		[
			282.277,
			-6.619,
			3680,
			"PSR J1849-0636"
		],
		[
			282.438,
			-6.242,
			2840,
			"PSR J1849-0614"
		],
		[
			280.198,
			-7.892,
			11710,
			"PSR J1840-0753"
		],
		[
			280.844,
			-7.048,
			4570,
			"PSR J1843-0702"
		],
		[
			279.513,
			-6.926,
			6600,
			"PSR J1838-0655"
		],
		[
			279.311,
			-6.884,
			4930,
			"PSR J1837-0653"
		],
		[
			279.791,
			-6.729,
			6550,
			"PSR J1839-0643"
		],
		[
			280.039,
			-6.73,
			6730,
			"PSR J1840-0643"
		],
		[
			280.068,
			-6.438,
			8990,
			"PSR J1840-0626"
		],
		[
			279.835,
			-6.459,
			2330,
			"PSR J1839-0627"
		],
		[
			279.716,
			-6.415,
			5820,
			"PSR J1838-0624"
		],
		[
			281.281,
			-6.59,
			7560,
			"PSR J1845-0635"
		],
		[
			281.838,
			-6.087,
			4590,
			"PSR J1847-0605"
		],
		[
			282.085,
			-6.019,
			12130,
			"PSR J1848-0601"
		],
		[
			280.679,
			-6.21,
			7010,
			"PSR J1842-0612"
		],
		[
			280.097,
			-5.988,
			5040,
			"PSR J1840-0559"
		],
		[
			281.41,
			-5.755,
			5390,
			"PSR J1845-0545"
		],
		[
			281.021,
			-5.643,
			6180,
			"PSR J1844-0538"
		],
		[
			281.141,
			-5.033,
			5200,
			"PSR J1844-0502"
		],
		[
			284.092,
			-5.449,
			3450,
			"PSR J1856-0526"
		],
		[
			282.063,
			-5.194,
			7780,
			"PSR J1848-0511"
		],
		[
			281.966,
			-4.727,
			7570,
			"PSR J1847-0443"
		],
		[
			281.908,
			-4.638,
			4720,
			"PSR J1847-0438"
		],
		[
			281.829,
			-4.466,
			4170,
			"PSR J1847-0427"
		],
		[
			278.773,
			-6.718,
			6440,
			"PSR J1835-0643"
		],
		[
			278.622,
			-6.55,
			9360,
			"PSR J1834-0633"
		],
		[
			278.178,
			-6.734,
			8810,
			"PSR J1832-0644"
		],
		[
			279.431,
			-6.08,
			6190,
			"PSR J1837-0604"
		],
		[
			279.349,
			-5.991,
			5010,
			"PSR J1837-0559"
		],
		[
			278.658,
			-6.043,
			6600,
			"PSR J1834-0602"
		],
		[
			278.282,
			-5.99,
			5830,
			"PSR J1833-0559"
		],
		[
			278.412,
			-5.935,
			7370,
			"PSR J1833-0556"
		],
		[
			278.784,
			-5.369,
			7130,
			"PSR J1835-0522"
		],
		[
			279.659,
			-5.82,
			4730,
			"PSR J1838-0549"
		],
		[
			280.455,
			-5.408,
			4890,
			"PSR J1841-0524"
		],
		[
			279.928,
			-5,
			4590,
			"PSR J1839-0459"
		],
		[
			280.791,
			-5.168,
			4720,
			"PSR J1843-0510"
		],
		[
			280.326,
			-5.005,
			6770,
			"PSR J1841-0500"
		],
		[
			280.865,
			-4.992,
			6150,
			"PSR J1843-0459"
		],
		[
			281.006,
			-4.872,
			8060,
			"PSR J1844-0452"
		],
		[
			280.331,
			-4.936,
			9600,
			"PSR J1841-0456"
		],
		[
			280.204,
			-4.641,
			5520,
			"PSR J1840-04"
		],
		[
			280.274,
			-4.422,
			5170,
			"PSR J1841-0425"
		],
		[
			280.547,
			-4.261,
			4020,
			"PSR J1842-0415"
		],
		[
			279.105,
			-5.293,
			8080,
			"PSR J1836-0517"
		],
		[
			279.547,
			-4.89,
			8280,
			"PSR J1838-0453"
		],
		[
			279.216,
			-4.61,
			4620,
			"PSR J1836-0436"
		],
		[
			279.75,
			-4.616,
			4980,
			"PSR J1839-0436"
		],
		[
			279.963,
			-4.04,
			4690,
			"PSR J1839-0402"
		],
		[
			278.607,
			-4.438,
			2300,
			"PSR J1834-0426"
		],
		[
			278.425,
			-3.651,
			5070,
			"PSR J1833-0338"
		],
		[
			278.804,
			-3.819,
			5250,
			"PSR J1835-0349"
		],
		[
			281.395,
			-4.575,
			4610,
			"PSR J1845-0434"
		],
		[
			281.139,
			-4.553,
			2780,
			"PSR J1844-0433"
		],
		[
			280.931,
			-4.134,
			4680,
			"PSR J1843-0408"
		],
		[
			281.845,
			-4.037,
			3120,
			"PSR J1847-0402"
		],
		[
			280.61,
			-4,
			4150,
			"PSR J1842-0359"
		],
		[
			280.778,
			-3.932,
			8810,
			"PSR J1843-0355"
		],
		[
			280.411,
			-3.812,
			4150,
			"PSR J1841-0345"
		],
		[
			279.986,
			-3.55,
			4240,
			"PSR J1839-0332"
		],
		[
			280.358,
			-3.172,
			4500,
			"PSR J1841-0310"
		],
		[
			280.579,
			-3.163,
			11410,
			"PSR J1842-0309"
		],
		[
			281.47,
			-3.268,
			6530,
			"PSR J1845-0316"
		],
		[
			281.189,
			-3.177,
			8880,
			"PSR J1844-0310"
		],
		[
			281.565,
			-2.96,
			4690,
			"PSR J1846-0257"
		],
		[
			281.604,
			-2.975,
			5800,
			"PSR J1846-0258"
		],
		[
			281.029,
			-3.036,
			6800,
			"PSR J1844-0302"
		],
		[
			281.221,
			-2.933,
			8770,
			"PSR J1844-02"
		],
		[
			281.187,
			-2.745,
			5990,
			"PSR J1844-0244"
		],
		[
			282.491,
			-3.292,
			1900,
			"PSR J1849-0317"
		],
		[
			282.814,
			-2.692,
			7620,
			"PSR J1851-0241"
		],
		[
			279.906,
			-3.353,
			6820,
			"PSR J1839-0321"
		],
		[
			280.876,
			-2.184,
			6340,
			"PSR J1843-0211"
		],
		[
			279.992,
			-2.386,
			5780,
			"PSR J1839-0223"
		],
		[
			280.484,
			-1.965,
			7270,
			"PSR J1841-0157"
		],
		[
			279.971,
			-1.6,
			5890,
			"PSR J1839-01"
		],
		[
			280.741,
			-1.891,
			6490,
			"PSR J1842-0153"
		],
		[
			280.803,
			-1.63,
			7130,
			"PSR J1843-0137"
		],
		[
			282.098,
			-1.4,
			4400,
			"PSR J1848-0123"
		],
		[
			281.897,
			-1.513,
			7640,
			"PSR J1847-0130"
		],
		[
			282.19,
			-.931,
			15150,
			"PSR J1848-0055"
		],
		[
			280.903,
			-.836,
			7730,
			"PSR J1843-0050"
		],
		[
			281.171,
			-.507,
			8660,
			"PSR J1844-0030"
		],
		[
			287.624,
			-3.165,
			10250,
			"PSR J1910-0309"
		],
		[
			285.711,
			-3.672,
			3130,
			"PSR J1902-0340"
		],
		[
			285.318,
			-3.254,
			6950,
			"PSR J1901-0315"
		],
		[
			285.315,
			-3.208,
			2890,
			"PSR J1901-0312"
		],
		[
			285.876,
			-2.971,
			3100,
			"PSR J1903-0258"
		],
		[
			286.231,
			-1.842,
			4930,
			"PSR J1904-0150"
		],
		[
			287.565,
			-1.202,
			6440,
			"PSR J1910-0112"
		],
		[
			286.366,
			-.945,
			6910,
			"PSR J1905-0056"
		],
		[
			287.397,
			.133,
			3260,
			"PSR J1909+0007"
		],
		[
			287.95,
			.617,
			3140,
			"PSR J1911+00"
		],
		[
			289.961,
			.361,
			3320,
			"PSR J1919+0021"
		],
		[
			289.932,
			1.582,
			10230,
			"PSR J1919+0134"
		],
		[
			283.015,
			-1.456,
			6430,
			"PSR J1852-0127"
		],
		[
			283.071,
			-1.304,
			5400,
			"PSR J1852-0118"
		],
		[
			282.818,
			-1.237,
			6280,
			"PSR J1851-0114"
		],
		[
			285.194,
			-.852,
			3300,
			"PSR J1900-0051"
		],
		[
			286.053,
			.068,
			6430,
			"PSR J1904+0004"
		],
		[
			285.383,
			.433,
			8150,
			"PSR J1901+00"
		],
		[
			284.942,
			.583,
			8910,
			"PSR J1859+00"
		],
		[
			282.763,
			-.885,
			1240,
			"PSR J1851-0053"
		],
		[
			282.98,
			-.499,
			6860,
			"PSR J1851-0029"
		],
		[
			282.293,
			-.672,
			20860,
			"PSR J1849-0040"
		],
		[
			282.639,
			-.519,
			9980,
			"PSR J1850-0031"
		],
		[
			282.561,
			-.437,
			10690,
			"PSR J1850-0026"
		],
		[
			282.7,
			-.107,
			7210,
			"PSR J1850-0006"
		],
		[
			283.346,
			-.076,
			6580,
			"PSR J1853-0004"
		],
		[
			283.5,
			0,
			7310,
			"PSR J1854+00"
		],
		[
			283.178,
			.136,
			5100,
			"PSR J1852+0008"
		],
		[
			283.375,
			.192,
			7480,
			"PSR J1853+0011"
		],
		[
			283.174,
			.233,
			7220,
			"PSR J1852+0013"
		],
		[
			282.158,
			-.388,
			1550,
			"PSR J1848-0023"
		],
		[
			282.688,
			.44,
			4270,
			"PSR J1850+0026"
		],
		[
			283.114,
			.534,
			8e3,
			"PSR J1852+0031"
		],
		[
			283.161,
			.672,
			1e4,
			"PSR J1852+0040"
		],
		[
			284.253,
			.955,
			2630,
			"PSR J1857+0057"
		],
		[
			284.119,
			1.036,
			8610,
			"PSR J1856+0102"
		],
		[
			283.386,
			.95,
			3820,
			"PSR J1853+0056"
		],
		[
			282.967,
			1.316,
			6750,
			"PSR J1851+0118"
		],
		[
			284.044,
			1.223,
			3300,
			"PSR J1856+0113"
		],
		[
			284.388,
			1.73,
			5180,
			"PSR J1857+0143"
		],
		[
			284.5,
			2,
			8510,
			"PSR J1858+02"
		],
		[
			283.925,
			2.093,
			16480,
			"PSR J1855+0205"
		],
		[
			287.802,
			1.031,
			9500,
			"PSR J1911+0101B"
		],
		[
			287.796,
			1.036,
			9500,
			"PSR J1911+0101A"
		],
		[
			286.5,
			.917,
			3300,
			"PSR J1906+0055"
		],
		[
			286.314,
			1.909,
			14450,
			"PSR J1905+0154A"
		],
		[
			288.599,
			2.33,
			9770,
			"PSR J1914+0219"
		],
		[
			288.759,
			2.463,
			7010,
			"PSR J1915+0227"
		],
		[
			287.543,
			2.423,
			6330,
			"PSR J1910+0225"
		],
		[
			285.469,
			1.414,
			7200,
			"PSR J1901+0124"
		],
		[
			285.875,
			1.594,
			3300,
			"PSR J1903+0135"
		],
		[
			285.393,
			1.944,
			2960,
			"PSR J1901+0156"
		],
		[
			285.5,
			2,
			6370,
			"PSR J1902+02"
		],
		[
			285.161,
			2.459,
			4320,
			"PSR J1900+0227"
		],
		[
			284.42,
			2.183,
			15010,
			"PSR J1857+0210"
		],
		[
			284.432,
			2.211,
			8e3,
			"PSR J1857+0212"
		],
		[
			284.573,
			2.261,
			12460,
			"PSR J1858+0215"
		],
		[
			284.724,
			2.694,
			6460,
			"PSR J1858+0241"
		],
		[
			285.25,
			2.583,
			8330,
			"PSR J1901+0235"
		],
		[
			285.709,
			2.816,
			6090,
			"PSR J1902+0248"
		],
		[
			285.498,
			3.006,
			5500,
			"PSR J1901+0300"
		],
		[
			285.315,
			2.911,
			3950,
			"PSR J1901+0254"
		],
		[
			285.211,
			3.14,
			5270,
			"PSR J1900+0308"
		],
		[
			285.263,
			3.338,
			7740,
			"PSR J1901+0320"
		],
		[
			286.925,
			2.828,
			7490,
			"PSR J1907+0249"
		],
		[
			287.41,
			2.914,
			4500,
			"PSR J1909+0254"
		],
		[
			286.75,
			2.933,
			6680,
			"PSR J1907+0256"
		],
		[
			287.538,
			3.974,
			2950,
			"PSR J1910+0358"
		],
		[
			285.774,
			3.455,
			6450,
			"PSR J1903+0327"
		],
		[
			286.368,
			4.003,
			1330,
			"PSR J1905+0400"
		],
		[
			286.811,
			3.753,
			8620,
			"PSR J1907+0345"
		],
		[
			286.741,
			4.242,
			9210,
			"PSR J1906+0414"
		],
		[
			276.483,
			-3.333,
			3260,
			"PSR J1825-0319"
		],
		[
			275.436,
			-3.52,
			5560,
			"PSR J1821-0331"
		],
		[
			275.293,
			-2.944,
			2550,
			"PSR J1821-0256"
		],
		[
			274.562,
			-1.817,
			15450,
			"PSR J1818-01"
		],
		[
			275.967,
			-1.901,
			4560,
			"PSR J1823-0154"
		],
		[
			276.223,
			-1.464,
			2210,
			"PSR J1824-0127"
		],
		[
			278.273,
			-2.155,
			9250,
			"PSR J1833-0209"
		],
		[
			279.664,
			-1.13,
			5830,
			"PSR J1838-0107"
		],
		[
			279.625,
			-1.017,
			6880,
			"PSR J1838-01"
		],
		[
			278.841,
			-1.243,
			2670,
			"PSR J1835-0114"
		],
		[
			277.582,
			-1.53,
			2680,
			"PSR J1830-0131"
		],
		[
			277.628,
			-.882,
			7100,
			"PSR J1830-0052"
		],
		[
			278.713,
			-.526,
			4350,
			"PSR J1834-0031"
		],
		[
			278.572,
			-.181,
			2640,
			"PSR J1834-0010"
		],
		[
			279.384,
			-.753,
			2550,
			"PSR J1837-0045"
		],
		[
			280.867,
			-.011,
			2730,
			"PSR J1843-0000"
		],
		[
			277.446,
			.002,
			3320,
			"PSR J1829+0000"
		],
		[
			276.314,
			.072,
			2260,
			"PSR J1825+0004"
		],
		[
			278.211,
			.491,
			1450,
			"PSR J1832+0029"
		],
		[
			279.369,
			.887,
			3240,
			"PSR J1837+0053"
		],
		[
			272.833,
			-1.909,
			9560,
			"PSR J1811-0154"
		],
		[
			272.464,
			-1.325,
			10590,
			"PSR J1809-0119"
		],
		[
			272.079,
			.567,
			10310,
			"PSR J1808+00"
		],
		[
			275.412,
			1.923,
			2290,
			"PSR J1821+0155"
		],
		[
			273.222,
			2.449,
			6160,
			"PSR J1812+0226"
		],
		[
			281.046,
			.583,
			6780,
			"PSR J1844+00"
		],
		[
			281.683,
			.861,
			3200,
			"PSR J1846+0051"
		],
		[
			281.169,
			1.26,
			3450,
			"PSR J1844+0115"
		],
		[
			280.324,
			1.505,
			3190,
			"PSR J1841+0130"
		],
		[
			282.504,
			1.41,
			2970,
			"PSR J1850+0124"
		],
		[
			282.434,
			1.456,
			4540,
			"PSR J1849+0127"
		],
		[
			282.75,
			2.533,
			14800,
			"PSR J1851+0232"
		],
		[
			282.674,
			2.716,
			13100,
			"PSR J1850+0242"
		],
		[
			283.25,
			3,
			6110,
			"PSR J1853+03"
		],
		[
			283.136,
			3.085,
			6730,
			"PSR J1852+0305"
		],
		[
			280.142,
			2.249,
			5420,
			"PSR J1840+0214"
		],
		[
			280.629,
			2.966,
			3930,
			"PSR J1842+0257"
		],
		[
			282.176,
			3.86,
			10530,
			"PSR J1848+0351"
		],
		[
			280.571,
			3.976,
			3210,
			"PSR J1842+0358"
		],
		[
			284.212,
			2.763,
			10290,
			"PSR J1856+0245"
		],
		[
			283.512,
			3.104,
			4110,
			"PSR J1854+0306"
		],
		[
			283.861,
			3.122,
			7450,
			"PSR J1855+0307"
		],
		[
			285.382,
			3.518,
			7e3,
			"PSR J1901+0331"
		],
		[
			284.593,
			3.777,
			7280,
			"PSR J1858+0346"
		],
		[
			283.621,
			3.292,
			7950,
			"PSR J1854+0317"
		],
		[
			284.111,
			4.074,
			6980,
			"PSR J1856+0404"
		],
		[
			283.922,
			4.38,
			9850,
			"PSR J1855+0422"
		],
		[
			285.378,
			3.933,
			10180,
			"PSR J1901+0355"
		],
		[
			286.131,
			4.202,
			4010,
			"PSR J1904+0412"
		],
		[
			285.75,
			4.25,
			9650,
			"PSR J1903+0415"
		],
		[
			285.293,
			4.231,
			6910,
			"PSR J1901+0413"
		],
		[
			285.384,
			4.59,
			3e4,
			"PSR J1901+0435"
		],
		[
			286.247,
			4.865,
			3960,
			"PSR J1904+0451"
		],
		[
			285.25,
			4.983,
			3e4,
			"PSR J1901+0459"
		],
		[
			285.491,
			5.176,
			8470,
			"PSR J1901+0510"
		],
		[
			282.264,
			4.162,
			2410,
			"PSR J1849+0409"
		],
		[
			282.764,
			4.303,
			3170,
			"PSR J1851+0418"
		],
		[
			282.598,
			4.386,
			7380,
			"PSR J1850+0423"
		],
		[
			283.268,
			5.091,
			7540,
			"PSR J1853+0505"
		],
		[
			284.316,
			5.441,
			11440,
			"PSR J1857+0526"
		],
		[
			283.813,
			5.461,
			9700,
			"PSR J1855+0527"
		],
		[
			284.941,
			6.029,
			5980,
			"PSR J1859+0601"
		],
		[
			283.493,
			5.765,
			4770,
			"PSR J1853+0545"
		],
		[
			282.228,
			6.08,
			8780,
			"PSR J1848+0604"
		],
		[
			281.286,
			6.399,
			3530,
			"PSR J1845+0623"
		],
		[
			282.233,
			6.792,
			1440,
			"PSR J1848+0647"
		],
		[
			283.824,
			7.01,
			6840,
			"PSR J1855+0700"
		],
		[
			280.542,
			6.637,
			11040,
			"PSR J1842+0638"
		],
		[
			282.182,
			8.443,
			3370,
			"PSR J1848+0826"
		],
		[
			292.367,
			.433,
			1740,
			"PSR J1929+00"
		],
		[
			295.871,
			6.166,
			3890,
			"PSR J1943+0609"
		],
		[
			291.602,
			4.525,
			3950,
			"PSR J1926+0431"
		],
		[
			288.462,
			4.768,
			3410,
			"PSR J1913+0446"
		],
		[
			294.473,
			6.835,
			3640,
			"PSR J1938+0650"
		],
		[
			291.641,
			7.619,
			5610,
			"PSR J1926+0737"
		],
		[
			293.331,
			7.969,
			8330,
			"PSR J1933+0758"
		],
		[
			297.742,
			5.583,
			4430,
			"PSR J1950+05"
		],
		[
			296.479,
			7.283,
			3470,
			"PSR J1945+07"
		],
		[
			299.218,
			8.638,
			4310,
			"PSR J1956+0838"
		],
		[
			301.806,
			8.159,
			3440,
			"PSR J2007+0809"
		],
		[
			301.992,
			9.17,
			2930,
			"PSR J2007+0910"
		],
		[
			296.943,
			9.252,
			5800,
			"PSR J1947+0915"
		],
		[
			296.039,
			9.123,
			1280,
			"PSR J1944+0907"
		],
		[
			295.385,
			10.44,
			8600,
			"PSR J1941+1026"
		],
		[
			294.796,
			10.75,
			4580,
			"PSR J1939+10"
		],
		[
			296.9,
			10.733,
			13830,
			"PSR J1947+10"
		],
		[
			297.784,
			11.39,
			1660,
			"PSR J1951+1123"
		],
		[
			298.448,
			11.828,
			12530,
			"PSR J1953+1149"
		],
		[
			298.026,
			14.125,
			1660,
			"PSR J1952+1410"
		],
		[
			287.067,
			4.961,
			9300,
			"PSR J1908+0457"
		],
		[
			287.022,
			5.015,
			4430,
			"PSR J1908+0500"
		],
		[
			286.75,
			5,
			11030,
			"PSR J1907+05"
		],
		[
			286.847,
			5.581,
			11940,
			"PSR J1907+0534"
		],
		[
			287.61,
			5.569,
			15390,
			"PSR J1910+0534"
		],
		[
			286.978,
			6.038,
			3010,
			"PSR J1907+0602"
		],
		[
			287.463,
			6.281,
			8590,
			"PSR J1909+0616"
		],
		[
			286.268,
			6.017,
			18060,
			"PSR J1905+0600"
		],
		[
			285.678,
			5.941,
			3600,
			"PSR J1902+0556"
		],
		[
			285.837,
			6.026,
			7840,
			"PSR J1903+0601"
		],
		[
			286.279,
			6.271,
			5240,
			"PSR J1905+0616"
		],
		[
			287.371,
			6.69,
			1860,
			"PSR J1909+0641"
		],
		[
			286.647,
			6.684,
			7e3,
			"PSR J1906+0641"
		],
		[
			286.55,
			6.83,
			5070,
			"PSR J1906+0649"
		],
		[
			288.25,
			6.283,
			3970,
			"PSR J1913+0617"
		],
		[
			288.572,
			6.532,
			2680,
			"PSR J1914+0631"
		],
		[
			288.5,
			6.983,
			5260,
			"PSR J1914+0659"
		],
		[
			288.853,
			7.642,
			1980,
			"PSR J1915+0738"
		],
		[
			287.577,
			7.237,
			3600,
			"PSR J1910+0714"
		],
		[
			287.592,
			7.477,
			6040,
			"PSR J1910+0728"
		],
		[
			288.758,
			7.869,
			3560,
			"PSR J1915+0752"
		],
		[
			285.709,
			6.276,
			7e3,
			"PSR J1902+0615"
		],
		[
			285.275,
			6.355,
			3110,
			"PSR J1901+0621"
		],
		[
			285.117,
			6.572,
			7310,
			"PSR J1900+0634"
		],
		[
			286.473,
			7.155,
			4980,
			"PSR J1905+0709"
		],
		[
			286.5,
			7.417,
			9170,
			"PSR J1906+0725"
		],
		[
			286.031,
			7.648,
			5860,
			"PSR J1904+0738"
		],
		[
			285.412,
			7.276,
			3400,
			"PSR J1901+0716"
		],
		[
			285.556,
			7.397,
			3330,
			"PSR J1902+0723"
		],
		[
			286.978,
			7.523,
			4890,
			"PSR J1907+0731"
		],
		[
			287.071,
			7.571,
			580,
			"PSR J1908+0734"
		],
		[
			286.934,
			7.673,
			6840,
			"PSR J1907+0740"
		],
		[
			287.284,
			7.826,
			10840,
			"PSR J1909+0749"
		],
		[
			286.704,
			7.774,
			7400,
			"PSR J1906+0746"
		],
		[
			286.015,
			8.015,
			9200,
			"PSR J1904+0800"
		],
		[
			287.077,
			8.666,
			9420,
			"PSR J1908+0839"
		],
		[
			287.245,
			9.271,
			5170,
			"PSR J1908+0916"
		],
		[
			286.331,
			9.042,
			9140,
			"PSR J1905+0902"
		],
		[
			287.031,
			9.153,
			8810,
			"PSR J1908+0909"
		],
		[
			286.619,
			9.216,
			5630,
			"PSR J1906+0912"
		],
		[
			286.844,
			9.309,
			7680,
			"PSR J1907+0918"
		],
		[
			289.215,
			7.8,
			8240,
			"PSR J1916+0748"
		],
		[
			290.449,
			8.214,
			3470,
			"PSR J1921+0812"
		],
		[
			289.454,
			8.582,
			1510,
			"PSR J1917+0834"
		],
		[
			289.08,
			8.735,
			7980,
			"PSR J1916+0844"
		],
		[
			288.808,
			8.65,
			8120,
			"PSR J1915+0838"
		],
		[
			289.102,
			8.877,
			6980,
			"PSR J1916+0852"
		],
		[
			291.857,
			9.185,
			7190,
			"PSR J1927+0911"
		],
		[
			288.252,
			8.535,
			7760,
			"PSR J1913+0832"
		],
		[
			287.75,
			9,
			6880,
			"PSR J1911+09"
		],
		[
			288.338,
			9.079,
			3490,
			"PSR J1913+0904"
		],
		[
			288.47,
			9.612,
			4220,
			"PSR J1913+0936"
		],
		[
			289.135,
			9.857,
			2880,
			"PSR J1916+0951"
		],
		[
			287.333,
			9.215,
			8200,
			"PSR J1909+0912"
		],
		[
			287.75,
			10,
			8190,
			"PSR J1911+10"
		],
		[
			288.265,
			10.001,
			7890,
			"PSR J1913+1000"
		],
		[
			288.875,
			10.162,
			7e3,
			"PSR J1915+1009"
		],
		[
			288.335,
			10.19,
			4480,
			"PSR J1913+1011"
		],
		[
			288.193,
			10.612,
			4230,
			"PSR J1912+1036"
		],
		[
			290.231,
			10.675,
			7190,
			"PSR J1920+1040"
		],
		[
			289.154,
			10.384,
			6930,
			"PSR J1916+1023"
		],
		[
			289.049,
			10.515,
			7550,
			"PSR J1916+1030"
		],
		[
			290.055,
			11.183,
			5010,
			"PSR J1920+1110"
		],
		[
			284.289,
			8.151,
			8720,
			"PSR J1857+0809"
		],
		[
			283.342,
			8.888,
			7540,
			"PSR J1853+0853"
		],
		[
			285.98,
			9.432,
			4170,
			"PSR J1903+0925"
		],
		[
			284.402,
			9.721,
			700,
			"PSR J1857+0943"
		],
		[
			286.01,
			10.193,
			4030,
			"PSR J1904+1011"
		],
		[
			283.622,
			10.778,
			8270,
			"PSR J1854+1050"
		],
		[
			287.5,
			10.45,
			19200,
			"PSR J1910+1027"
		],
		[
			287.453,
			11.034,
			4800,
			"PSR J1909+1102"
		],
		[
			286.907,
			11.827,
			5280,
			"PSR J1907+1149"
		],
		[
			288.25,
			11.05,
			12690,
			"PSR J1913+1103"
		],
		[
			288.542,
			11.368,
			3800,
			"PSR J1914+1122"
		],
		[
			288.433,
			11.759,
			15060,
			"PSR J1913+1145"
		],
		[
			288.75,
			11.733,
			6900,
			"PSR J1915+1144"
		],
		[
			288.75,
			11.817,
			18890,
			"PSR J1915+1149"
		],
		[
			289.084,
			12.432,
			6190,
			"PSR J1916+1225"
		],
		[
			287.25,
			11.8,
			5180,
			"PSR J1909+1148"
		],
		[
			287.556,
			12.528,
			6470,
			"PSR J1910+1231"
		],
		[
			285.453,
			13.113,
			3530,
			"PSR J1901+1306"
		],
		[
			286.795,
			12.793,
			7180,
			"PSR J1907+1247"
		],
		[
			287.54,
			12.94,
			1950,
			"PSR J1910+1256"
		],
		[
			293.058,
			10.992,
			310,
			"PSR J1932+1059"
		],
		[
			293.812,
			12.05,
			9810,
			"PSR J1935+12"
		],
		[
			293.344,
			13.081,
			8100,
			"PSR J1933+1304"
		],
		[
			292.504,
			13.27,
			8280,
			"PSR J1930+1316"
		],
		[
			292.5,
			14,
			8850,
			"PSR J1930+14"
		],
		[
			295.27,
			13.692,
			8550,
			"PSR J1941+1341"
		],
		[
			292.75,
			14.667,
			10310,
			"PSR J1931+1440"
		],
		[
			294.318,
			15.089,
			14070,
			"PSR J1937+1505"
		],
		[
			294.006,
			15.61,
			8410,
			"PSR J1936+1536"
		],
		[
			289.887,
			13.244,
			20840,
			"PSR J1919+1314"
		],
		[
			289.5,
			13.167,
			6310,
			"PSR J1918+1310"
		],
		[
			289.244,
			13.214,
			4500,
			"PSR J1916+1312"
		],
		[
			289.416,
			13.899,
			5e3,
			"PSR J1917+1353"
		],
		[
			291.738,
			14.582,
			8020,
			"PSR J1926+1434"
		],
		[
			290.351,
			14.321,
			4080,
			"PSR J1921+1419"
		],
		[
			288.325,
			13.509,
			5350,
			"PSR J1913+1330"
		],
		[
			287.98,
			13.793,
			1600,
			"PSR J1911+1347"
		],
		[
			288.351,
			14.015,
			5070,
			"PSR J1913+1400"
		],
		[
			288.898,
			14.181,
			7760,
			"PSR J1915+1410"
		],
		[
			287.362,
			14.849,
			4940,
			"PSR J1909+1450"
		],
		[
			289.598,
			14.752,
			1410,
			"PSR J1918+1444"
		],
		[
			290.444,
			15.738,
			15100,
			"PSR J1921+1544"
		],
		[
			290.25,
			16,
			8340,
			"PSR J1921+16"
		],
		[
			289.532,
			15.688,
			680,
			"PSR J1918+1541"
		],
		[
			288.867,
			16.108,
			7130,
			"PSR J1915+1606"
		],
		[
			289.789,
			16.756,
			9560,
			"PSR J1919+1645"
		],
		[
			292.083,
			15.217,
			9870,
			"PSR J1928+15"
		],
		[
			292.982,
			15.616,
			6410,
			"PSR J1931+1536"
		],
		[
			292.325,
			16.35,
			630,
			"PSR J1929+16"
		],
		[
			293.949,
			16.278,
			3700,
			"PSR J1935+1616"
		],
		[
			293,
			17,
			2700,
			"PSR J1932+17"
		],
		[
			293.25,
			17.433,
			7410,
			"PSR J1933+1726"
		],
		[
			293.766,
			17.441,
			3110,
			"PSR J1935+1726"
		],
		[
			293.875,
			17.753,
			9570,
			"PSR J1935+1745"
		],
		[
			291.5,
			16.217,
			1700,
			"PSR J1926+1613"
		],
		[
			291,
			16.467,
			3e4,
			"PSR J1924+1628"
		],
		[
			291.229,
			16.53,
			28350,
			"PSR J1924+1631"
		],
		[
			291.013,
			16.661,
			9130,
			"PSR J1924+1639"
		],
		[
			291.689,
			16.809,
			6e3,
			"PSR J1926+1648"
		],
		[
			291,
			17,
			3e4,
			"PSR J1924+17"
		],
		[
			290.783,
			17.103,
			6380,
			"PSR J1923+1706"
		],
		[
			291.25,
			17.35,
			9610,
			"PSR J1925+1721"
		],
		[
			290.722,
			17.557,
			1e4,
			"PSR J1922+1733"
		],
		[
			292.683,
			17.417,
			9200,
			"PSR J1930+17"
		],
		[
			292.177,
			17.775,
			8120,
			"PSR J1928+1746"
		],
		[
			292.626,
			18.871,
			7e3,
			"PSR J1930+1852"
		],
		[
			292.32,
			18.75,
			5340,
			"PSR J1929+1844"
		],
		[
			292.383,
			19.083,
			3e4,
			"PSR J1929+19"
		],
		[
			247.969,
			-16.214,
			1850,
			"PSR J1631-1612"
		],
		[
			248.947,
			-15.198,
			4890,
			"PSR J1635-1511"
		],
		[
			248.226,
			-10.222,
			4220,
			"PSR J1632-1013"
		],
		[
			253.069,
			-14.008,
			3100,
			"PSR J1652-1400"
		],
		[
			250.909,
			-12.416,
			740,
			"PSR J1643-1224"
		],
		[
			242.678,
			-13.373,
			3890,
			"PSR J1610-1322"
		],
		[
			245.824,
			-9.147,
			3860,
			"PSR J1623-0908"
		],
		[
			245.928,
			-8.693,
			3830,
			"PSR J1623-0841"
		],
		[
			236.942,
			-9.735,
			3180,
			"PSR J1547-0944"
		],
		[
			251.259,
			-3.3,
			2610,
			"PSR J1645-0317"
		],
		[
			256.25,
			-4.683,
			3040,
			"PSR J1705-04"
		],
		[
			260.239,
			-2.207,
			5410,
			"PSR J1720-0212"
		],
		[
			263.95,
			-2.73,
			3250,
			"PSR J1735-0243"
		],
		[
			263.69,
			-2.211,
			5360,
			"PSR J1734-0212"
		],
		[
			266.259,
			-1.488,
			7260,
			"PSR J1745-0129"
		],
		[
			261.596,
			-.25,
			5490,
			"PSR J1726-00"
		],
		[
			262.145,
			-.129,
			2440,
			"PSR J1728-0007"
		],
		[
			264.725,
			3.553,
			1470,
			"PSR J1738+0333"
		],
		[
			258.456,
			7.794,
			1180,
			"PSR J1713+0747"
		],
		[
			237.78,
			-6.968,
			1460,
			"PSR J1551-0658"
		],
		[
			235.876,
			-6.346,
			1270,
			"PSR J1543-0620"
		],
		[
			238.917,
			-5.266,
			1660,
			"PSR J1555-0515"
		],
		[
			242.75,
			-1.467,
			2300,
			"PSR J1611-01"
		],
		[
			241.8,
			-.545,
			610,
			"PSR J1607-0032"
		],
		[
			229.637,
			2.08,
			8e3,
			"PSR J1518+0204C"
		],
		[
			229.642,
			2.083,
			8e3,
			"PSR J1518+0204D"
		],
		[
			229.642,
			2.083,
			8e3,
			"PSR J1518+0204E"
		],
		[
			229.639,
			2.091,
			8e3,
			"PSR J1518+0204A"
		],
		[
			229.631,
			2.088,
			8e3,
			"PSR J1518+0204B"
		],
		[
			251.393,
			10.204,
			3270,
			"PSR J1645+1012"
		],
		[
			243.67,
			7.625,
			1770,
			"PSR J1614+0737"
		],
		[
			246.828,
			14.322,
			2840,
			"PSR J1627+1419"
		],
		[
			270.614,
			1.473,
			8790,
			"PSR J1802+0128"
		],
		[
			271.292,
			3.108,
			5e3,
			"PSR J1805+0306"
		],
		[
			270.683,
			3.633,
			5120,
			"PSR J1802+03"
		],
		[
			271.854,
			4.083,
			2660,
			"PSR J1807+04"
		],
		[
			272.835,
			7.042,
			3130,
			"PSR J1811+0702"
		],
		[
			275.879,
			5.84,
			2e3,
			"PSR J1823+0550"
		],
		[
			275.577,
			7.089,
			3020,
			"PSR J1822+0705"
		],
		[
			277.117,
			6.417,
			1180,
			"PSR J1828+0625"
		],
		[
			280.483,
			9.202,
			2490,
			"PSR J1841+0912"
		],
		[
			278.612,
			10.733,
			3180,
			"PSR J1834+10"
		],
		[
			271.963,
			7.945,
			7660,
			"PSR J1807+0756"
		],
		[
			271.717,
			10.388,
			3270,
			"PSR J1806+1023"
		],
		[
			275.561,
			11.349,
			8770,
			"PSR J1822+1120"
		],
		[
			273.678,
			11.512,
			4530,
			"PSR J1814+1130"
		],
		[
			274.984,
			13.088,
			4410,
			"PSR J1819+1305"
		],
		[
			264.225,
			5.8,
			2810,
			"PSR J1736+05"
		],
		[
			264.825,
			6.208,
			5440,
			"PSR J1739+0612"
		],
		[
			265.108,
			10.002,
			1360,
			"PSR J1740+1000"
		],
		[
			266.391,
			10.298,
			1360,
			"PSR J1745+1017"
		],
		[
			265.031,
			13.199,
			4770,
			"PSR J1740+1311"
		],
		[
			265.38,
			13.862,
			1080,
			"PSR J1741+1351"
		],
		[
			269,
			18.317,
			5090,
			"PSR J1756+18"
		],
		[
			282.805,
			12.993,
			3500,
			"PSR J1851+1259"
		],
		[
			279.28,
			12.365,
			6100,
			"PSR J1837+1221"
		],
		[
			282.125,
			12.833,
			7470,
			"PSR J1848+12"
		],
		[
			280.625,
			13.534,
			5900,
			"PSR J1842+1332"
		],
		[
			283.489,
			13.062,
			1600,
			"PSR J1853+1303"
		],
		[
			282.648,
			13.6,
			3140,
			"PSR J1850+1335"
		],
		[
			282.537,
			15.533,
			1300,
			"PSR J1850+15"
		],
		[
			284.935,
			15.436,
			4760,
			"PSR J1859+1526"
		],
		[
			279.75,
			15,
			3940,
			"PSR J1839+15"
		],
		[
			277.222,
			13.993,
			3290,
			"PSR J1828+1359"
		],
		[
			281.229,
			14.904,
			2610,
			"PSR J1844+1454"
		],
		[
			279.679,
			16.838,
			1840,
			"PSR J1838+1650"
		],
		[
			288.83,
			16.786,
			3160,
			"PSR J1915+1647"
		],
		[
			287.981,
			17.979,
			2540,
			"PSR J1911+1758"
		],
		[
			287.328,
			18.986,
			3400,
			"PSR J1909+1859"
		],
		[
			286.686,
			18.902,
			11060,
			"PSR J1906+1854"
		],
		[
			289.931,
			17.751,
			6860,
			"PSR J1919+1745"
		],
		[
			289.35,
			17.625,
			10210,
			"PSR J1917+1737"
		],
		[
			291.358,
			19.067,
			16420,
			"PSR J1925+19"
		],
		[
			291.793,
			18.869,
			10280,
			"PSR J1927+1852"
		],
		[
			291.854,
			18.944,
			4810,
			"PSR J1927+1856"
		],
		[
			292.022,
			19.392,
			3e4,
			"PSR J1928+1923"
		],
		[
			291.595,
			19.47,
			3e4,
			"PSR J1926+1928"
		],
		[
			290.266,
			19.812,
			8150,
			"PSR J1921+1948"
		],
		[
			291.575,
			20.267,
			11850,
			"PSR J1926+2016"
		],
		[
			290.465,
			20.056,
			5160,
			"PSR J1921+2003"
		],
		[
			291.167,
			20.667,
			10750,
			"PSR J1924+2040"
		],
		[
			290.533,
			20.299,
			10740,
			"PSR J1922+2018"
		],
		[
			288.181,
			21.076,
			4840,
			"PSR J1912+2104"
		],
		[
			285.971,
			22.42,
			7860,
			"PSR J1903+2225"
		],
		[
			287.133,
			23.862,
			6630,
			"PSR J1908+2351"
		],
		[
			275.306,
			17.263,
			4680,
			"PSR J1821+1715"
		],
		[
			272.655,
			17.744,
			2490,
			"PSR J1810+1744"
		],
		[
			273.411,
			18.371,
			6240,
			"PSR J1813+1822"
		],
		[
			280.859,
			20.415,
			7720,
			"PSR J1843+2024"
		],
		[
			282.394,
			24.396,
			4020,
			"PSR J1849+2423"
		],
		[
			277.394,
			24.938,
			740,
			"PSR J1829+2456"
		],
		[
			260.005,
			21.837,
			3590,
			"PSR J1720+2150"
		],
		[
			257.274,
			23.224,
			1830,
			"PSR J1709+2313"
		],
		[
			266.503,
			22.758,
			4320,
			"PSR J1746+2245"
		],
		[
			268.148,
			23.997,
			2700,
			"PSR J1752+2359"
		],
		[
			266.529,
			25.677,
			4160,
			"PSR J1746+2540"
		],
		[
			265.473,
			27.969,
			2060,
			"PSR J1741+2758"
		],
		[
			269.608,
			30.507,
			2670,
			"PSR J1758+3030"
		],
		[
			32.996,
			-81.993,
			1830,
			"PSR J0211-8159"
		],
		[
			60.465,
			-76.137,
			1500,
			"PSR J0401-7608"
		],
		[
			84.128,
			-75.732,
			1040,
			"PSR J0536-7543"
		],
		[
			85.128,
			-71.425,
			2690,
			"PSR J0540-7125"
		],
		[
			74.01,
			-70.518,
			49700,
			"PSR J0456-7031"
		],
		[
			72.274,
			-70.525,
			49700,
			"PSR J0449-7031"
		],
		[
			74.258,
			-69.767,
			49700,
			"PSR J0457-69"
		],
		[
			73.948,
			-69.86,
			49700,
			"PSR J0455-6951"
		],
		[
			74.125,
			-69.167,
			49700,
			"PSR J0456-69"
		],
		[
			88.758,
			-70.946,
			49700,
			"PSR J0555-7056"
		],
		[
			83.75,
			-69.583,
			49700,
			"PSR J0535-6935"
		],
		[
			84.429,
			-69.35,
			49700,
			"PSR J0537-69"
		],
		[
			85.047,
			-69.332,
			49700,
			"PSR J0540-6919"
		],
		[
			84.448,
			-69.172,
			49700,
			"PSR J0537-6910"
		],
		[
			85.97,
			-68.857,
			49700,
			"PSR J0543-6851"
		],
		[
			83.017,
			-69.767,
			49700,
			"PSR J0532-69"
		],
		[
			79.945,
			-69.54,
			49700,
			"PSR J0519-6932"
		],
		[
			80.596,
			-68.784,
			49700,
			"PSR J0522-6847"
		],
		[
			80.433,
			-68.583,
			49700,
			"PSR J0521-68"
		],
		[
			85.646,
			-68.267,
			49700,
			"PSR J0542-68"
		],
		[
			83.651,
			-67.064,
			49700,
			"PSR J0534-6703"
		],
		[
			82.462,
			-66.877,
			49700,
			"PSR J0529-6652"
		],
		[
			83.917,
			-66.867,
			49700,
			"PSR J0535-66"
		],
		[
			83.248,
			-66.66,
			49700,
			"PSR J0532-6639"
		],
		[
			74.746,
			-67.717,
			49700,
			"PSR J0458-67"
		],
		[
			72.958,
			-67.3,
			49700,
			"PSR J0451-67"
		],
		[
			75.711,
			-66.3,
			49700,
			"PSR J0502-6617"
		],
		[
			77.985,
			-65.143,
			2170,
			"PSR J0511-6508"
		],
		[
			74.282,
			-63.625,
			2940,
			"PSR J0457-6337"
		],
		[
			11.396,
			-73.317,
			59700,
			"PSR J0045-7319"
		],
		[
			22.869,
			-73.169,
			59700,
			"PSR J0131-7310"
		],
		[
			18.296,
			-72.342,
			59700,
			"PSR J0113-7220"
		],
		[
			14.433,
			-72.022,
			2490,
			"PSR J0057-7201"
		],
		[
			5.977,
			-72.092,
			4e3,
			"PSR J0024-7204M"
		],
		[
			5.96,
			-72.075,
			4e3,
			"PSR J0024-7204C"
		],
		[
			6.046,
			-72.089,
			4e3,
			"PSR J0024-7204E"
		],
		[
			6.016,
			-72.082,
			4e3,
			"PSR J0024-7204L"
		],
		[
			6.019,
			-72.082,
			4e3,
			"PSR J0024-7204O"
		],
		[
			6.024,
			-72.081,
			4e3,
			"PSR J0024-7204P"
		],
		[
			6.024,
			-72.081,
			4e3,
			"PSR J0024-7204R"
		],
		[
			6.024,
			-72.081,
			4e3,
			"PSR J0024-7204V"
		],
		[
			6.025,
			-72.08,
			4e3,
			"PSR J0024-7204W"
		],
		[
			6.024,
			-72.081,
			4e3,
			"PSR J0024-7204X"
		],
		[
			6.024,
			-72.081,
			4e3,
			"PSR J0024-7204Y"
		],
		[
			6.024,
			-72.081,
			4e3,
			"PSR J0024-7204Z"
		],
		[
			6.058,
			-72.079,
			4e3,
			"PSR J0024-7204D"
		],
		[
			6.069,
			-72.074,
			4e3,
			"PSR J0024-7204Q"
		],
		[
			6.016,
			-72.079,
			4e3,
			"PSR J0024-7204F"
		],
		[
			6.017,
			-72.078,
			4e3,
			"PSR J0024-7204S"
		],
		[
			6.033,
			-72.078,
			4e3,
			"PSR J0024-7204G"
		],
		[
			6.033,
			-72.078,
			4e3,
			"PSR J0024-7204I"
		],
		[
			6.036,
			-72.077,
			4e3,
			"PSR J0024-7204T"
		],
		[
			6.038,
			-72.075,
			4e3,
			"PSR J0024-7204N"
		],
		[
			6.028,
			-72.069,
			4e3,
			"PSR J0024-7204H"
		],
		[
			6.041,
			-72.067,
			4e3,
			"PSR J0024-7204U"
		],
		[
			5.998,
			-72.066,
			4e3,
			"PSR J0024-7204J"
		],
		[
			11.357,
			-70.702,
			59700,
			"PSR J0045-7042"
		],
		[
			15.179,
			-72.193,
			59700,
			"PSR J0100-7211"
		],
		[
			17.87,
			-71.53,
			59700,
			"PSR J0111-7131"
		],
		[
			23.385,
			-69.958,
			2420,
			"PSR J0133-6957"
		],
		[
			15.296,
			-64.375,
			730,
			"PSR J0101-6422"
		],
		[
			43.984,
			-53.073,
			1150,
			"PSR J0255-5304"
		],
		[
			69.316,
			-47.253,
			160,
			"PSR J0437-4715"
		],
		[
			78.716,
			-44.118,
			920,
			"PSR J0514-4407"
		],
		[
			78.528,
			-40.047,
			12100,
			"PSR J0514-4002A"
		],
		[
			64.517,
			-41.903,
			2460,
			"PSR J0418-4154"
		],
		[
			72.173,
			-27.83,
			2870,
			"PSR J0448-2749"
		],
		[
			62.662,
			-31.125,
			520,
			"PSR J0410-31"
		],
		[
			31.505,
			-40.468,
			880,
			"PSR J0206-4028"
		],
		[
			23.578,
			-29.621,
			1780,
			"PSR J0134-2937"
		],
		[
			55.866,
			-30.008,
			2220,
			"PSR J0343-3000"
		],
		[
			28.045,
			-16.631,
			690,
			"PSR J0152-1637"
		],
		[
			159,
			-83.283,
			1590,
			"PSR J1036-8317"
		],
		[
			169.92,
			-79.608,
			1520,
			"PSR J1119-7936"
		],
		[
			179.899,
			-79.168,
			4360,
			"PSR J1159-7910"
		],
		[
			164.364,
			-79.24,
			3460,
			"PSR J1057-7914"
		],
		[
			136.045,
			-74.995,
			4410,
			"PSR J0904-7459"
		],
		[
			137.4,
			-72.202,
			4e3,
			"PSR J0909-7212"
		],
		[
			154.464,
			-71.945,
			260,
			"PSR J1017-7156"
		],
		[
			164.192,
			-71.298,
			5270,
			"PSR J1056-7117"
		],
		[
			163.936,
			-69.086,
			11910,
			"PSR J1055-6905"
		],
		[
			171.59,
			-69.704,
			2070,
			"PSR J1126-6942"
		],
		[
			168.212,
			-69.442,
			12320,
			"PSR J1112-6926"
		],
		[
			172.633,
			-68.125,
			7140,
			"PSR J1130-6807"
		],
		[
			174.384,
			-67.009,
			19530,
			"PSR J1137-6700"
		],
		[
			176.75,
			-66,
			4260,
			"PSR J1147-66"
		],
		[
			175.279,
			-65.755,
			3e3,
			"PSR J1141-6545"
		],
		[
			170.968,
			-66.864,
			3480,
			"PSR J1123-6651"
		],
		[
			171.248,
			-64.355,
			14900,
			"PSR J1124-6421"
		],
		[
			161.868,
			-67.164,
			4670,
			"PSR J1047-6709"
		],
		[
			159.083,
			-65.986,
			7860,
			"PSR J1036-6559"
		],
		[
			163.537,
			-64.877,
			13530,
			"PSR J1054-6452"
		],
		[
			168.161,
			-66.218,
			19310,
			"PSR J1112-6613"
		],
		[
			166.618,
			-64.65,
			7880,
			"PSR J1106-6438"
		],
		[
			165.405,
			-64.411,
			7860,
			"PSR J1101-6424"
		],
		[
			169.437,
			-64.799,
			27120,
			"PSR J1117-6447"
		],
		[
			163.222,
			-63.805,
			5270,
			"PSR J1052-6348"
		],
		[
			164.106,
			-62.98,
			2400,
			"PSR J1056-6258"
		],
		[
			163.978,
			-62.613,
			3640,
			"PSR J1055-6236"
		],
		[
			147.336,
			-69.045,
			8680,
			"PSR J0949-6902"
		],
		[
			158.763,
			-63.755,
			6540,
			"PSR J1035-6345"
		],
		[
			151.652,
			-63.195,
			9300,
			"PSR J1006-6311"
		],
		[
			157.759,
			-61.297,
			3e4,
			"PSR J1031-6117"
		],
		[
			160.98,
			-61.281,
			18200,
			"PSR J1043-6116"
		],
		[
			155.047,
			-60.435,
			29580,
			"PSR J1020-6026"
		],
		[
			155.058,
			-59.359,
			2620,
			"PSR J1020-5921"
		],
		[
			158.029,
			-59.167,
			7260,
			"PSR J1032-5911"
		],
		[
			157.117,
			-58.318,
			2760,
			"PSR J1028-5819"
		],
		[
			155.617,
			-58.225,
			3e4,
			"PSR J1022-5813"
		],
		[
			148.75,
			-61.8,
			5380,
			"PSR J0955-61"
		],
		[
			150.384,
			-59.655,
			3300,
			"PSR J1001-5939"
		],
		[
			150.585,
			-59.327,
			15130,
			"PSR J1002-5919"
		],
		[
			153.383,
			-59.574,
			11320,
			"PSR J1013-5934"
		],
		[
			153.202,
			-58.961,
			10140,
			"PSR J1012-5857"
		],
		[
			154.088,
			-58.953,
			9310,
			"PSR J1016-5857"
		],
		[
			153.229,
			-58.507,
			5340,
			"PSR J1012-5830"
		],
		[
			154.05,
			-58.317,
			4620,
			"PSR J1016-5819"
		],
		[
			154.967,
			-57.818,
			3e4,
			"PSR J1019-5749"
		],
		[
			153.908,
			-57.32,
			4870,
			"PSR J1015-5719"
		],
		[
			150.741,
			-55.994,
			17420,
			"PSR J1002-5559"
		],
		[
			150.286,
			-55.983,
			3940,
			"PSR J1001-5559"
		],
		[
			150.408,
			-55.119,
			300,
			"PSR J1001-5507"
		],
		[
			107.976,
			-68.513,
			1040,
			"PSR J0711-6830"
		],
		[
			113.842,
			-62.967,
			830,
			"PSR J0735-62"
		],
		[
			135.635,
			-63.42,
			4440,
			"PSR J0902-6325"
		],
		[
			132.427,
			-63.376,
			8350,
			"PSR J0849-6322"
		],
		[
			134.247,
			-61.631,
			6530,
			"PSR J0856-6137"
		],
		[
			139.866,
			-60.681,
			3540,
			"PSR J0919-6040"
		],
		[
			136.314,
			-60.323,
			4400,
			"PSR J0905-6019"
		],
		[
			128.708,
			-60.583,
			490,
			"PSR J0834-60"
		],
		[
			145.727,
			-56.962,
			5020,
			"PSR J0942-5657"
		],
		[
			141.129,
			-58.235,
			1870,
			"PSR J0924-5814"
		],
		[
			145.566,
			-55.881,
			300,
			"PSR J0942-5552"
		],
		[
			149.483,
			-54.534,
			7e3,
			"PSR J0957-5432"
		],
		[
			148.525,
			-54.515,
			6200,
			"PSR J0954-5430"
		],
		[
			145.243,
			-54.478,
			4270,
			"PSR J0940-5428"
		],
		[
			145.421,
			-52.735,
			5640,
			"PSR J0941-5244"
		],
		[
			143.095,
			-53.453,
			3910,
			"PSR J0932-5327"
		],
		[
			143.618,
			-52.824,
			2930,
			"PSR J0934-5249"
		],
		[
			141.036,
			-53.046,
			5610,
			"PSR J0924-5302"
		],
		[
			140.5,
			-52,
			3760,
			"PSR J0922-52"
		],
		[
			140.562,
			-49.82,
			10370,
			"PSR J0922-4949"
		],
		[
			130.141,
			-53.543,
			7770,
			"PSR J0840-5332"
		],
		[
			121.947,
			-54.357,
			8760,
			"PSR J0807-5421"
		],
		[
			136.816,
			-51.966,
			2630,
			"PSR J0907-5157"
		],
		[
			136.466,
			-51.464,
			8380,
			"PSR J0905-5127"
		],
		[
			137.148,
			-49.218,
			1e3,
			"PSR J0908-4913"
		],
		[
			130.791,
			-50.379,
			7690,
			"PSR J0843-5022"
		],
		[
			133.832,
			-46.973,
			28350,
			"PSR J0855-4658"
		],
		[
			130.522,
			-48.856,
			8680,
			"PSR J0842-4851"
		],
		[
			135.417,
			-46.413,
			7460,
			"PSR J0901-4624"
		],
		[
			133.901,
			-46.737,
			9900,
			"PSR J0855-4644"
		],
		[
			136.35,
			-45.615,
			6350,
			"PSR J0905-4536"
		],
		[
			134.48,
			-44.403,
			6530,
			"PSR J0857-4424"
		],
		[
			177.157,
			-64.259,
			9070,
			"PSR J1148-6415"
		],
		[
			179.84,
			-64.166,
			6030,
			"PSR J1159-6409"
		],
		[
			175.719,
			-62.501,
			10810,
			"PSR J1142-6230"
		],
		[
			176.009,
			-62.292,
			8880,
			"PSR J1144-6217"
		],
		[
			170.981,
			-62.986,
			7540,
			"PSR J1123-6259"
		],
		[
			173.464,
			-62.847,
			3e4,
			"PSR J1133-6250"
		],
		[
			174.59,
			-62.133,
			24500,
			"PSR J1138-6207"
		],
		[
			172.195,
			-62.319,
			3e4,
			"PSR J1128-6219"
		],
		[
			170.924,
			-61.035,
			14750,
			"PSR J1123-6102"
		],
		[
			171.719,
			-60.911,
			8050,
			"PSR J1126-6054"
		],
		[
			178.584,
			-62.834,
			2060,
			"PSR J1154-6250"
		],
		[
			179.313,
			-62.414,
			4e3,
			"PSR J1157-6224"
		],
		[
			176.145,
			-61.78,
			2140,
			"PSR J1144-6146"
		],
		[
			177.987,
			-61.138,
			7650,
			"PSR J1151-6108"
		],
		[
			178.224,
			-60.206,
			2090,
			"PSR J1152-6012"
		],
		[
			176.532,
			-60.516,
			2590,
			"PSR J1146-6030"
		],
		[
			171.48,
			-60.235,
			1940,
			"PSR J1125-6014"
		],
		[
			172.543,
			-59.426,
			8280,
			"PSR J1130-5925"
		],
		[
			172.568,
			-58.434,
			9450,
			"PSR J1130-5826"
		],
		[
			169.349,
			-61.906,
			22380,
			"PSR J1117-6154"
		],
		[
			166.801,
			-61.733,
			13720,
			"PSR J1107-6143"
		],
		[
			168.062,
			-61.059,
			3e4,
			"PSR J1112-6103"
		],
		[
			166.359,
			-61.131,
			7070,
			"PSR J1105-6107"
		],
		[
			169.81,
			-61.464,
			8400,
			"PSR J1119-6127"
		],
		[
			168.594,
			-61.009,
			3e4,
			"PSR J1114-6100"
		],
		[
			168.974,
			-60.872,
			6760,
			"PSR J1115-6052"
		],
		[
			166.995,
			-59.784,
			3520,
			"PSR J1107-5947"
		],
		[
			165.437,
			-61.028,
			7e3,
			"PSR J1101-6101"
		],
		[
			166.072,
			-61.051,
			2310,
			"PSR J1104-6103"
		],
		[
			165.881,
			-60.427,
			6830,
			"PSR J1103-6025"
		],
		[
			164.643,
			-59.96,
			7110,
			"PSR J1058-5957"
		],
		[
			163.913,
			-60.477,
			3e4,
			"PSR J1055-6028"
		],
		[
			163.952,
			-60.381,
			25630,
			"PSR J1055-6022"
		],
		[
			162.53,
			-59.889,
			9e3,
			"PSR J1050-5953"
		],
		[
			163.627,
			-59.775,
			5810,
			"PSR J1054-5946"
		],
		[
			163.741,
			-59.721,
			6810,
			"PSR J1054-5943"
		],
		[
			163.159,
			-59.912,
			13550,
			"PSR J1052-5954"
		],
		[
			166.894,
			-59.122,
			1810,
			"PSR J1107-5907"
		],
		[
			171.162,
			-59.272,
			5e3,
			"PSR J1124-5916"
		],
		[
			171.435,
			-58.421,
			2980,
			"PSR J1125-5825"
		],
		[
			164.754,
			-57.704,
			2750,
			"PSR J1059-5742"
		],
		[
			164.182,
			-57.16,
			17610,
			"PSR J1056-5709"
		],
		[
			167.502,
			-56.626,
			9180,
			"PSR J1110-5637"
		],
		[
			179.09,
			-59.153,
			8760,
			"PSR J1156-5909"
		],
		[
			178.042,
			-58.009,
			7870,
			"PSR J1152-5800"
		],
		[
			179.031,
			-57.117,
			20400,
			"PSR J1156-5707"
		],
		[
			177.119,
			-57.42,
			6990,
			"PSR J1148-5725"
		],
		[
			173.066,
			-56.458,
			21300,
			"PSR J1132-5627"
		],
		[
			174.009,
			-55.419,
			2600,
			"PSR J1136-5525"
		],
		[
			175.791,
			-55.601,
			11440,
			"PSR J1143-5536"
		],
		[
			171.235,
			-56.644,
			23740,
			"PSR J1124-5638"
		],
		[
			170.33,
			-54.735,
			15430,
			"PSR J1121-5444"
		],
		[
			165.889,
			-54.062,
			3160,
			"PSR J1103-5403"
		],
		[
			172.337,
			-53.517,
			2680,
			"PSR J1129-53"
		],
		[
			161.983,
			-58.683,
			2330,
			"PSR J1047-58"
		],
		[
			159.582,
			-58.524,
			2430,
			"PSR J1038-5831"
		],
		[
			162.46,
			-58.562,
			9730,
			"PSR J1049-5833"
		],
		[
			162.051,
			-58.535,
			2900,
			"PSR J1048-5832"
		],
		[
			161.579,
			-58.231,
			4800,
			"PSR J1046-5813"
		],
		[
			160.503,
			-55.352,
			6980,
			"PSR J1042-5521"
		],
		[
			154.304,
			-56.359,
			11780,
			"PSR J1017-5621"
		],
		[
			155.353,
			-56.031,
			4180,
			"PSR J1021-5601"
		],
		[
			154.13,
			-53.754,
			2500,
			"PSR J1016-5345"
		],
		[
			158.115,
			-52.102,
			4330,
			"PSR J1032-5206"
		],
		[
			164.496,
			-52.449,
			1530,
			"PSR J1057-5226"
		],
		[
			164.471,
			-47.916,
			3030,
			"PSR J1057-4754"
		],
		[
			159.054,
			-49.439,
			8710,
			"PSR J1036-4926"
		],
		[
			161.459,
			-45.165,
			340,
			"PSR J1045-4509"
		],
		[
			179.284,
			-51.216,
			1880,
			"PSR J1157-5112"
		],
		[
			175.813,
			-51.978,
			10680,
			"PSR J1143-5158"
		],
		[
			173.983,
			-49.425,
			8740,
			"PSR J1135-49"
		],
		[
			170.815,
			-48.74,
			8740,
			"PSR J1123-4844"
		],
		[
			173.137,
			-46.918,
			7360,
			"PSR J1132-46"
		],
		[
			169.18,
			-41.379,
			2680,
			"PSR J1116-4122"
		],
		[
			166.35,
			-43.95,
			2200,
			"PSR J1105-43"
		],
		[
			170.093,
			-36.309,
			4500,
			"PSR J1120-3618"
		],
		[
			171,
			-36,
			4400,
			"PSR J1124-3653"
		],
		[
			148.873,
			-53.071,
			4870,
			"PSR J0955-5304"
		],
		[
			150.117,
			-51.833,
			2330,
			"PSR J1000-5149"
		],
		[
			153.575,
			-48.828,
			3300,
			"PSR J1014-48"
		],
		[
			149.859,
			-48.163,
			2960,
			"PSR J0959-4809"
		],
		[
			150.84,
			-47.784,
			3440,
			"PSR J1003-4747"
		],
		[
			146.409,
			-48.554,
			2710,
			"PSR J0945-4833"
		],
		[
			153.029,
			-42.583,
			2470,
			"PSR J1012-4235"
		],
		[
			143.742,
			-41.905,
			3200,
			"PSR J0934-4154"
		],
		[
			136.247,
			-42.771,
			4370,
			"PSR J0904-4246"
		],
		[
			138.178,
			-38.851,
			620,
			"PSR J0912-3851"
		],
		[
			145.408,
			-39.683,
			1290,
			"PSR J0941-39"
		],
		[
			148.072,
			-38.653,
			8440,
			"PSR J0952-3839"
		],
		[
			158.581,
			-32.407,
			4680,
			"PSR J1034-3224"
		],
		[
			161.753,
			-30.538,
			4140,
			"PSR J1047-3032"
		],
		[
			153.14,
			-23.64,
			1290,
			"PSR J1012-2337"
		],
		[
			107.386,
			-59.399,
			4940,
			"PSR J0709-5923"
		],
		[
			104.204,
			-54.821,
			4880,
			"PSR J0656-5449"
		],
		[
			116.26,
			-53.856,
			7140,
			"PSR J0745-5353"
		],
		[
			90.194,
			-57.948,
			2550,
			"PSR J0600-5756"
		],
		[
			105.664,
			-49.943,
			5490,
			"PSR J0702-4956"
		],
		[
			122.433,
			-47.899,
			12710,
			"PSR J0809-4753"
		],
		[
			128.836,
			-45.176,
			280,
			"PSR J0835-4510"
		],
		[
			127.885,
			-44.103,
			12730,
			"PSR J0831-4406"
		],
		[
			128.904,
			-42.544,
			6750,
			"PSR J0835-42"
		],
		[
			131.989,
			-43.282,
			13440,
			"PSR J0847-4316"
		],
		[
			125.489,
			-43.005,
			2200,
			"PSR J0821-4300"
		],
		[
			128.568,
			-41.997,
			9740,
			"PSR J0834-4159"
		],
		[
			125.436,
			-42.357,
			18160,
			"PSR J0821-4221"
		],
		[
			125.064,
			-41.243,
			2380,
			"PSR J0820-4114"
		],
		[
			129.338,
			-41.587,
			1500,
			"PSR J0837-4135"
		],
		[
			129.628,
			-39.789,
			8210,
			"PSR J0838-3947"
		],
		[
			128.763,
			-37.131,
			2340,
			"PSR J0835-3707"
		],
		[
			116.748,
			-45.491,
			5710,
			"PSR J0746-4529"
		],
		[
			117.457,
			-42.795,
			2360,
			"PSR J0749-4247"
		],
		[
			114.635,
			-40.711,
			1600,
			"PSR J0738-4042"
		],
		[
			125.205,
			-39.365,
			6190,
			"PSR J0820-3921"
		],
		[
			125.25,
			-38.445,
			6820,
			"PSR J0820-3826"
		],
		[
			122.048,
			-39.631,
			5620,
			"PSR J0808-3937"
		],
		[
			123.062,
			-39.097,
			26830,
			"PSR J0812-3905"
		],
		[
			127.069,
			-34.285,
			540,
			"PSR J0828-3417"
		],
		[
			121.092,
			-36.793,
			7790,
			"PSR J0804-3647"
		],
		[
			124.608,
			-32.542,
			3820,
			"PSR J0818-3232"
		],
		[
			99.141,
			-45.826,
			980,
			"PSR J0636-4549"
		],
		[
			114.464,
			-30.661,
			1100,
			"PSR J0737-3039A"
		],
		[
			114.464,
			-30.661,
			1100,
			"PSR J0737-3039B"
		],
		[
			115.704,
			-28.379,
			2e3,
			"PSR J0742-2822"
		],
		[
			110.104,
			-31.431,
			400,
			"PSR J0720-3125"
		],
		[
			111.534,
			-26.211,
			3010,
			"PSR J0726-2612"
		],
		[
			109.781,
			-25.75,
			17330,
			"PSR J0719-2545"
		],
		[
			113.352,
			-23.766,
			11950,
			"PSR J0733-2345"
		],
		[
			114.434,
			-22.035,
			4300,
			"PSR J0737-2202"
		],
		[
			131.525,
			-35.561,
			1430,
			"PSR J0846-3533"
		],
		[
			133.91,
			-33.528,
			1210,
			"PSR J0855-3331"
		],
		[
			135.183,
			-31.742,
			820,
			"PSR J0900-3144"
		],
		[
			140.992,
			-31.95,
			1020,
			"PSR J0923-31"
		],
		[
			143.163,
			-32.287,
			3840,
			"PSR J0932-3217"
		],
		[
			124.705,
			-30.825,
			4170,
			"PSR J0818-3049"
		],
		[
			129.578,
			-26.358,
			4560,
			"PSR J0838-2621"
		],
		[
			129.433,
			-24.797,
			10340,
			"PSR J0837-24"
		],
		[
			142.83,
			-19.049,
			3630,
			"PSR J0931-1902"
		],
		[
			137.159,
			-17.66,
			1010,
			"PSR J0908-1739"
		],
		[
			146.121,
			-13.912,
			690,
			"PSR J0944-1354"
		],
		[
			125.11,
			-13.849,
			1900,
			"PSR J0820-1350"
		],
		[
			119.621,
			-15.469,
			3720,
			"PSR J0758-1528"
		],
		[
			252.783,
			-76.711,
			5160,
			"PSR J1651-7642"
		],
		[
			210.767,
			-76.783,
			7030,
			"PSR J1403-7646"
		],
		[
			212.531,
			-74.081,
			2150,
			"PSR J1410-7404"
		],
		[
			224.001,
			-68.728,
			430,
			"PSR J1456-6843"
		],
		[
			225.578,
			-67.871,
			11570,
			"PSR J1502-6752"
		],
		[
			257.01,
			-75.656,
			2010,
			"PSR J1708-7539"
		],
		[
			241.122,
			-72.058,
			2560,
			"PSR J1604-7203"
		],
		[
			240.899,
			-72.042,
			530,
			"PSR J1603-7202"
		],
		[
			251.728,
			-68.531,
			1800,
			"PSR J1646-6831"
		],
		[
			247.287,
			-69.046,
			1360,
			"PSR J1629-6902"
		],
		[
			252.213,
			-60.74,
			5660,
			"PSR J1648-6044"
		],
		[
			246.529,
			-66.354,
			4420,
			"PSR J1626-6621"
		],
		[
			245.515,
			-66.288,
			4660,
			"PSR J1622-6617"
		],
		[
			241.953,
			-64.829,
			3820,
			"PSR J1607-6449"
		],
		[
			226.953,
			-66.683,
			5620,
			"PSR J1507-6640"
		],
		[
			232.717,
			-63.726,
			13600,
			"PSR J1530-63"
		],
		[
			234.853,
			-63.381,
			7750,
			"PSR J1539-6322"
		],
		[
			248.788,
			-59.911,
			7260,
			"PSR J1635-5954"
		],
		[
			246.969,
			-59.615,
			3670,
			"PSR J1627-5936"
		],
		[
			238.158,
			-62.242,
			4300,
			"PSR J1552-62"
		],
		[
			240.146,
			-59.283,
			6540,
			"PSR J1600-5916"
		],
		[
			236.5,
			-59,
			4670,
			"PSR J1546-59"
		],
		[
			236.896,
			-58.653,
			7190,
			"PSR J1547-5839"
		],
		[
			236.877,
			-57.841,
			3910,
			"PSR J1547-5750"
		],
		[
			242.964,
			-58.795,
			2330,
			"PSR J1611-5847"
		],
		[
			243.116,
			-58.091,
			6290,
			"PSR J1612-5805"
		],
		[
			240.083,
			-57.854,
			5320,
			"PSR J1600-5751"
		],
		[
			239.627,
			-57.941,
			3740,
			"PSR J1558-5756"
		],
		[
			237.45,
			-57.367,
			2930,
			"PSR J1549-5722"
		],
		[
			240.881,
			-56.962,
			8520,
			"PSR J1603-5657"
		],
		[
			239.839,
			-55.761,
			5090,
			"PSR J1559-5545"
		],
		[
			192.971,
			-74.121,
			5220,
			"PSR J1251-7407"
		],
		[
			201.513,
			-67.014,
			8500,
			"PSR J1326-6700"
		],
		[
			212.32,
			-69.893,
			12600,
			"PSR J1409-6953"
		],
		[
			215.862,
			-69.895,
			6380,
			"PSR J1423-6953"
		],
		[
			213.607,
			-68.049,
			6600,
			"PSR J1414-6802"
		],
		[
			217.67,
			-66.385,
			1800,
			"PSR J1430-6623"
		],
		[
			220.13,
			-63.747,
			4030,
			"PSR J1440-6344"
		],
		[
			208.144,
			-68.06,
			14240,
			"PSR J1352-6803"
		],
		[
			204.986,
			-66.302,
			7620,
			"PSR J1339-6618"
		],
		[
			209.26,
			-64.492,
			4090,
			"PSR J1357-6429"
		],
		[
			210.469,
			-63.963,
			1800,
			"PSR J1401-6357"
		],
		[
			213.88,
			-66.353,
			14400,
			"PSR J1415-6621"
		],
		[
			216.247,
			-64.636,
			8310,
			"PSR J1424-6438"
		],
		[
			213.38,
			-63.127,
			3680,
			"PSR J1413-6307"
		],
		[
			210.19,
			-63.428,
			7e3,
			"PSR J1400-6325"
		],
		[
			210.808,
			-63.174,
			6140,
			"PSR J1403-6310"
		],
		[
			213.273,
			-62.374,
			27740,
			"PSR J1413-6222"
		],
		[
			216.282,
			-62.168,
			9980,
			"PSR J1425-6210"
		],
		[
			189.996,
			-68.541,
			2890,
			"PSR J1239-6832"
		],
		[
			189.358,
			-67.426,
			7800,
			"PSR J1237-6725"
		],
		[
			194.845,
			-67.694,
			2720,
			"PSR J1259-6741"
		],
		[
			196.921,
			-67.057,
			1640,
			"PSR J1307-67"
		],
		[
			196.4,
			-66.65,
			26410,
			"PSR J1305-66"
		],
		[
			196.659,
			-66.289,
			29160,
			"PSR J1306-6617"
		],
		[
			197.251,
			-65.438,
			19940,
			"PSR J1309-6526"
		],
		[
			196.349,
			-64.924,
			3e4,
			"PSR J1305-6455"
		],
		[
			181.153,
			-68.721,
			5660,
			"PSR J1204-6843"
		],
		[
			182.675,
			-65.835,
			1580,
			"PSR J1210-6550"
		],
		[
			188.074,
			-65.018,
			1e4,
			"PSR J1232-6501"
		],
		[
			188.99,
			-63.908,
			27050,
			"PSR J1235-6354"
		],
		[
			191.16,
			-65.52,
			3e4,
			"PSR J1244-6531"
		],
		[
			192.476,
			-65.122,
			8510,
			"PSR J1249-6507"
		],
		[
			192.137,
			-64.733,
			9550,
			"PSR J1248-6444"
		],
		[
			197.319,
			-64.266,
			3e4,
			"PSR J1309-6415"
		],
		[
			198.03,
			-64.015,
			2210,
			"PSR J1312-6400"
		],
		[
			199.436,
			-63.048,
			3e4,
			"PSR J1317-6302"
		],
		[
			195.699,
			-63.836,
			2300,
			"PSR J1302-6350"
		],
		[
			195.517,
			-63.748,
			3e4,
			"PSR J1302-63"
		],
		[
			196.978,
			-63.31,
			14450,
			"PSR J1307-6318"
		],
		[
			199.193,
			-62.537,
			3e4,
			"PSR J1316-6232"
		],
		[
			190.821,
			-64.39,
			2e3,
			"PSR J1243-6423"
		],
		[
			191.199,
			-63.996,
			12050,
			"PSR J1244-6359"
		],
		[
			192.193,
			-63.736,
			23990,
			"PSR J1248-6344"
		],
		[
			193.178,
			-63.242,
			11e3,
			"PSR J1252-6314"
		],
		[
			193.825,
			-62.8,
			3e4,
			"PSR J1255-62"
		],
		[
			195.368,
			-63.178,
			2060,
			"PSR J1301-6310"
		],
		[
			195.58,
			-63.225,
			28060,
			"PSR J1302-6313"
		],
		[
			195.75,
			-63.084,
			13620,
			"PSR J1303-6305"
		],
		[
			195.441,
			-63.093,
			15840,
			"PSR J1301-6305"
		],
		[
			196.367,
			-62.944,
			3e4,
			"PSR J1305-6256"
		],
		[
			196.686,
			-62.701,
			22630,
			"PSR J1306-6242"
		],
		[
			196.337,
			-62.056,
			24070,
			"PSR J1305-6203"
		],
		[
			205.001,
			-64.945,
			1920,
			"PSR J1340-6456"
		],
		[
			204.383,
			-64.385,
			6300,
			"PSR J1337-6423"
		],
		[
			207.325,
			-63.933,
			8040,
			"PSR J1349-63"
		],
		[
			207.177,
			-63.118,
			8180,
			"PSR J1348-6307"
		],
		[
			208.646,
			-62.825,
			5620,
			"PSR J1354-6249"
		],
		[
			201.636,
			-64.146,
			15700,
			"PSR J1326-6408"
		],
		[
			201.793,
			-64.004,
			3e4,
			"PSR J1327-6400"
		],
		[
			204.335,
			-63.106,
			16010,
			"PSR J1337-6306"
		],
		[
			200.575,
			-63.494,
			3e4,
			"PSR J1322-6329"
		],
		[
			201.781,
			-63.021,
			6500,
			"PSR J1327-6301"
		],
		[
			201.057,
			-63.039,
			11030,
			"PSR J1324-6302"
		],
		[
			205.428,
			-62.339,
			8550,
			"PSR J1341-6220"
		],
		[
			207.403,
			-61.505,
			5820,
			"PSR J1349-6130"
		],
		[
			204.539,
			-62.072,
			8160,
			"PSR J1338-6204"
		],
		[
			206.435,
			-61.258,
			5870,
			"PSR J1345-6115"
		],
		[
			206.165,
			-60.992,
			7170,
			"PSR J1344-6059"
		],
		[
			211.985,
			-61.9,
			9750,
			"PSR J1407-6153"
		],
		[
			212.6,
			-61.533,
			3e4,
			"PSR J1410-6132"
		],
		[
			209.354,
			-62.467,
			6940,
			"PSR J1357-62"
		],
		[
			208.839,
			-62.106,
			7950,
			"PSR J1355-6206"
		],
		[
			211.708,
			-61.358,
			9110,
			"PSR J1406-6121"
		],
		[
			213.032,
			-61.758,
			9320,
			"PSR J1412-6145"
		],
		[
			213.291,
			-61.687,
			11e3,
			"PSR J1413-6141"
		],
		[
			213.248,
			-61.192,
			5950,
			"PSR J1412-6111"
		],
		[
			215.034,
			-60.805,
			7650,
			"PSR J1420-6048"
		],
		[
			214.127,
			-60.633,
			5720,
			"PSR J1416-6037"
		],
		[
			211.994,
			-60.816,
			9700,
			"PSR J1407-6048"
		],
		[
			214.635,
			-59.75,
			9310,
			"PSR J1418-5945"
		],
		[
			209.993,
			-60.636,
			5e3,
			"PSR J1359-6038"
		],
		[
			211.505,
			-58.109,
			6730,
			"PSR J1406-5806"
		],
		[
			200.725,
			-62.85,
			3e4,
			"PSR J1322-62"
		],
		[
			200.634,
			-62.698,
			19910,
			"PSR J1322-6241"
		],
		[
			201.822,
			-62.379,
			4e3,
			"PSR J1327-6222"
		],
		[
			202.264,
			-61.983,
			8110,
			"PSR J1329-6158"
		],
		[
			201.183,
			-61.767,
			3e4,
			"PSR J1324-6146"
		],
		[
			205.281,
			-60.393,
			7030,
			"PSR J1341-6023"
		],
		[
			199.86,
			-61.091,
			14880,
			"PSR J1319-6105"
		],
		[
			199.835,
			-60.946,
			12640,
			"PSR J1319-6056"
		],
		[
			198.597,
			-61.021,
			9600,
			"PSR J1314-6101"
		],
		[
			201.743,
			-58.991,
			3e3,
			"PSR J1326-5859"
		],
		[
			203.625,
			-58.655,
			3890,
			"PSR J1334-5839"
		],
		[
			206.831,
			-59.794,
			6540,
			"PSR J1347-5947"
		],
		[
			208.996,
			-59.417,
			8430,
			"PSR J1355-5925"
		],
		[
			208.904,
			-57.787,
			7580,
			"PSR J1355-5747"
		],
		[
			211.302,
			-56.69,
			21300,
			"PSR J1405-5641"
		],
		[
			209.211,
			-55.354,
			8750,
			"PSR J1356-5521"
		],
		[
			223.386,
			-64.221,
			2800,
			"PSR J1453-6413"
		],
		[
			225.624,
			-61.481,
			7880,
			"PSR J1502-6128"
		],
		[
			229.79,
			-63.139,
			17810,
			"PSR J1519-6308"
		],
		[
			229.899,
			-61.115,
			7230,
			"PSR J1519-6106"
		],
		[
			228.437,
			-59.776,
			4260,
			"PSR J1513-5946"
		],
		[
			227.281,
			-60.255,
			13630,
			"PSR J1509-6015"
		],
		[
			228.746,
			-59.429,
			4500,
			"PSR J1514-5925"
		],
		[
			230.676,
			-58.484,
			4470,
			"PSR J1522-5829"
		],
		[
			228.482,
			-59.136,
			4400,
			"PSR J1513-5908"
		],
		[
			227.363,
			-58.849,
			3850,
			"PSR J1509-5850"
		],
		[
			227.779,
			-58.591,
			7100,
			"PSR J1511-5835"
		],
		[
			219.314,
			-61.767,
			4770,
			"PSR J1437-6146"
		],
		[
			220.435,
			-61.623,
			4440,
			"PSR J1441-6137"
		],
		[
			223.216,
			-60.609,
			9440,
			"PSR J1452-6036"
		],
		[
			221.025,
			-60.436,
			8780,
			"PSR J1444-6026"
		],
		[
			218.834,
			-61.016,
			3250,
			"PSR J1435-6100"
		],
		[
			218.305,
			-60.643,
			9740,
			"PSR J1433-6038"
		],
		[
			218.663,
			-60.497,
			5780,
			"PSR J1434-6029"
		],
		[
			219.258,
			-59.984,
			11120,
			"PSR J1437-5959"
		],
		[
			218.522,
			-60.108,
			7250,
			"PSR J1434-6006"
		],
		[
			218.751,
			-59.914,
			1460,
			"PSR J1435-5954"
		],
		[
			221.194,
			-59.689,
			4380,
			"PSR J1444-5941"
		],
		[
			222.356,
			-58.778,
			4740,
			"PSR J1449-5846"
		],
		[
			225.682,
			-58.478,
			12210,
			"PSR J1502-5828"
		],
		[
			223.775,
			-59.383,
			11450,
			"PSR J1455-59"
		],
		[
			224.383,
			-59.034,
			11330,
			"PSR J1457-5902"
		],
		[
			224.412,
			-59.014,
			4250,
			"PSR J1457-5900"
		],
		[
			223.219,
			-58.854,
			5640,
			"PSR J1452-5851"
		],
		[
			223.545,
			-58.776,
			3320,
			"PSR J1454-5846"
		],
		[
			228.179,
			-58,
			12700,
			"PSR J1512-5759"
		],
		[
			228.496,
			-57.65,
			9840,
			"PSR J1513-5739"
		],
		[
			228.789,
			-57.347,
			10320,
			"PSR J1515-5720"
		],
		[
			225.739,
			-56.894,
			4510,
			"PSR J1502-5653"
		],
		[
			225.462,
			-56.63,
			6750,
			"PSR J1501-5637"
		],
		[
			226.205,
			-56.359,
			3930,
			"PSR J1504-5621"
		],
		[
			234.074,
			-59.118,
			12090,
			"PSR J1536-5907"
		],
		[
			233.82,
			-58.808,
			3130,
			"PSR J1535-5848"
		],
		[
			235.246,
			-57.616,
			8170,
			"PSR J1540-5736"
		],
		[
			234.535,
			-57.838,
			2410,
			"PSR J1538-5750"
		],
		[
			234.576,
			-57.541,
			3880,
			"PSR J1538-5732"
		],
		[
			234.462,
			-56.751,
			24590,
			"PSR J1537-5645"
		],
		[
			234.524,
			-56.637,
			12940,
			"PSR J1538-5638"
		],
		[
			234.808,
			-56.44,
			4e3,
			"PSR J1539-5626"
		],
		[
			234.68,
			-56.365,
			3760,
			"PSR J1538-5621"
		],
		[
			231.103,
			-58.321,
			10870,
			"PSR J1524-5819"
		],
		[
			229.948,
			-57.57,
			13120,
			"PSR J1519-5734"
		],
		[
			231.089,
			-57.11,
			21590,
			"PSR J1524-5706"
		],
		[
			231.672,
			-56.562,
			6440,
			"PSR J1526-5633"
		],
		[
			231.208,
			-56.423,
			3840,
			"PSR J1524-5625"
		],
		[
			233.075,
			-56.533,
			5690,
			"PSR J1532-56"
		],
		[
			232.866,
			-56.182,
			3100,
			"PSR J1531-5610"
		],
		[
			234.688,
			-55.86,
			10400,
			"PSR J1538-5551"
		],
		[
			232.399,
			-56.191,
			3770,
			"PSR J1529-5611"
		],
		[
			231.92,
			-55.869,
			7150,
			"PSR J1527-5552"
		],
		[
			232.163,
			-55.79,
			5550,
			"PSR J1528-5547"
		],
		[
			231.423,
			-56.087,
			6770,
			"PSR J1525-5605"
		],
		[
			231.367,
			-55.764,
			3530,
			"PSR J1525-5545"
		],
		[
			231.4,
			-55.391,
			3500,
			"PSR J1525-5523"
		],
		[
			237.271,
			-57.36,
			910,
			"PSR J1549-57"
		],
		[
			237.183,
			-56.126,
			6950,
			"PSR J1548-5607"
		],
		[
			235.457,
			-55.584,
			7460,
			"PSR J1541-5535"
		],
		[
			235.984,
			-54.987,
			6320,
			"PSR J1543-5459"
		],
		[
			238.669,
			-55.209,
			8050,
			"PSR J1554-5512"
		],
		[
			238.498,
			-54.935,
			4800,
			"PSR J1553-5456"
		],
		[
			239.673,
			-54.324,
			9090,
			"PSR J1558-5419"
		],
		[
			239.215,
			-53.982,
			6960,
			"PSR J1556-5358"
		],
		[
			237.726,
			-54.307,
			4e3,
			"PSR J1550-5418"
		],
		[
			237.922,
			-53.183,
			7520,
			"PSR J1551-5310"
		],
		[
			237.52,
			-53.289,
			8450,
			"PSR J1550-5317"
		],
		[
			234.67,
			-55.329,
			9700,
			"PSR J1538-5519"
		],
		[
			234.783,
			-55.353,
			6840,
			"PSR J1539-5521"
		],
		[
			233.993,
			-54.841,
			4630,
			"PSR J1535-5450"
		],
		[
			234.704,
			-54.638,
			3600,
			"PSR J1538-5438"
		],
		[
			234.02,
			-54.554,
			3720,
			"PSR J1536-5433"
		],
		[
			233.64,
			-54.094,
			4260,
			"PSR J1534-5405"
		],
		[
			233.535,
			-53.572,
			1130,
			"PSR J1534-5334"
		],
		[
			236.249,
			-53.146,
			1290,
			"PSR J1544-5308"
		],
		[
			235.727,
			-53.061,
			6020,
			"PSR J1542-5303"
		],
		[
			236.531,
			-53.04,
			6100,
			"PSR J1546-5302"
		],
		[
			235.934,
			-51.832,
			1460,
			"PSR J1543-5149"
		],
		[
			235.583,
			-51.56,
			4870,
			"PSR J1542-5133"
		],
		[
			230.528,
			-55.422,
			1890,
			"PSR J1522-5525"
		],
		[
			231.368,
			-54.289,
			6010,
			"PSR J1525-5417"
		],
		[
			229.556,
			-54.262,
			4260,
			"PSR J1518-5415"
		],
		[
			228.024,
			-54.522,
			6610,
			"PSR J1512-5431"
		],
		[
			227.964,
			-54.245,
			2240,
			"PSR J1511-5414"
		],
		[
			232.49,
			-53.927,
			7750,
			"PSR J1529-5355"
		],
		[
			232.612,
			-53.466,
			1460,
			"PSR J1530-5327"
		],
		[
			233.148,
			-53.135,
			4450,
			"PSR J1532-5308"
		],
		[
			234.316,
			-51.885,
			2630,
			"PSR J1537-5153"
		],
		[
			217.358,
			-59.6,
			10620,
			"PSR J1429-5935"
		],
		[
			216.134,
			-58.382,
			10190,
			"PSR J1424-5822"
		],
		[
			216.496,
			-57.986,
			10810,
			"PSR J1425-5759"
		],
		[
			217.765,
			-57.67,
			4070,
			"PSR J1431-5740"
		],
		[
			216.402,
			-57.392,
			1460,
			"PSR J1425-5723"
		],
		[
			215.013,
			-56.432,
			1740,
			"PSR J1420-5625"
		],
		[
			216.096,
			-56.68,
			1220,
			"PSR J1424-56"
		],
		[
			216.053,
			-55.937,
			7710,
			"PSR J1424-5556"
		],
		[
			217.11,
			-55.514,
			2290,
			"PSR J1428-5530"
		],
		[
			219.916,
			-55.023,
			760,
			"PSR J1439-5501"
		],
		[
			215.121,
			-54.273,
			4900,
			"PSR J1420-5416"
		],
		[
			220.862,
			-51.374,
			3170,
			"PSR J1443-5122"
		],
		[
			218.218,
			-50.538,
			5720,
			"PSR J1432-5032"
		],
		[
			226.665,
			-51.969,
			1670,
			"PSR J1506-5158"
		],
		[
			224.417,
			-51.381,
			1370,
			"PSR J1457-5122"
		],
		[
			228.58,
			-49.771,
			1270,
			"PSR J1514-4946"
		],
		[
			228.561,
			-48.572,
			1590,
			"PSR J1514-4834"
		],
		[
			229.372,
			-46.6,
			10980,
			"PSR J1517-4636"
		],
		[
			221.649,
			-47.024,
			2030,
			"PSR J1446-4701"
		],
		[
			256.314,
			-61.587,
			6310,
			"PSR J1705-6135"
		],
		[
			256.541,
			-61.303,
			3640,
			"PSR J1706-6118"
		],
		[
			256.062,
			-60.282,
			1890,
			"PSR J1704-6016"
		],
		[
			259.399,
			-58.001,
			8850,
			"PSR J1717-5800"
		],
		[
			263.252,
			-55.261,
			4110,
			"PSR J1733-5515"
		],
		[
			267.435,
			-56.089,
			2660,
			"PSR J1749-5605"
		],
		[
			266.162,
			-53.631,
			8160,
			"PSR J1744-5337"
		],
		[
			265.186,
			-53.678,
			2200,
			"PSR J1740-5340A"
		],
		[
			257.971,
			-53.838,
			4240,
			"PSR J1711-5350"
		],
		[
			256.458,
			-52.605,
			8990,
			"PSR J1705-52"
		],
		[
			248.58,
			-56.68,
			5710,
			"PSR J1634-5640"
		],
		[
			246.838,
			-55.798,
			5660,
			"PSR J1627-5547"
		],
		[
			252.38,
			-55.894,
			14070,
			"PSR J1649-5553"
		],
		[
			249.75,
			-52.449,
			4880,
			"PSR J1638-5226"
		],
		[
			243.918,
			-55.617,
			3570,
			"PSR J1615-5537"
		],
		[
			243.755,
			-54.742,
			8400,
			"PSR J1615-5444"
		],
		[
			245.06,
			-54.248,
			1730,
			"PSR J1620-5414"
		],
		[
			243.025,
			-55.15,
			8420,
			"PSR J1612-55"
		],
		[
			241.318,
			-52.959,
			1280,
			"PSR J1605-5257"
		],
		[
			243.71,
			-54.046,
			6960,
			"PSR J1614-5402"
		],
		[
			243.49,
			-52.571,
			9940,
			"PSR J1613-5234"
		],
		[
			243.427,
			-52.189,
			6140,
			"PSR J1613-5211"
		],
		[
			242.553,
			-53.064,
			6600,
			"PSR J1610-5303"
		],
		[
			242.763,
			-52.157,
			3330,
			"PSR J1611-5209"
		],
		[
			242.361,
			-51.972,
			12730,
			"PSR J1609-5158"
		],
		[
			245.482,
			-52.729,
			7760,
			"PSR J1621-5243"
		],
		[
			248.521,
			-51.129,
			9300,
			"PSR J1634-5107"
		],
		[
			246.875,
			-51.133,
			4300,
			"PSR J1627-51"
		],
		[
			246.925,
			-49.9,
			7830,
			"PSR J1627-49"
		],
		[
			244.097,
			-52.147,
			7380,
			"PSR J1616-5208"
		],
		[
			244.129,
			-51.155,
			18970,
			"PSR J1616-5109"
		],
		[
			244.372,
			-50.92,
			6460,
			"PSR J1617-5055"
		],
		[
			243.69,
			-51.747,
			9560,
			"PSR J1614-5144"
		],
		[
			243.002,
			-51.615,
			18180,
			"PSR J1612-5136"
		],
		[
			243.547,
			-50.801,
			7240,
			"PSR J1614-5048"
		],
		[
			244.125,
			-50.287,
			3920,
			"PSR J1616-5017"
		],
		[
			245.27,
			-50.663,
			4880,
			"PSR J1621-5039"
		],
		[
			245.978,
			-49.818,
			3760,
			"PSR J1623-4949"
		],
		[
			245.687,
			-49.848,
			9140,
			"PSR J1622-4950"
		],
		[
			245.656,
			-49.742,
			8550,
			"PSR J1622-4944"
		],
		[
			254.664,
			-53.402,
			1240,
			"PSR J1658-5324"
		],
		[
			252.922,
			-52.93,
			5990,
			"PSR J1651-5255"
		],
		[
			252.929,
			-52.383,
			6390,
			"PSR J1651-5222"
		],
		[
			251.651,
			-51.387,
			10920,
			"PSR J1646-5123"
		],
		[
			250.181,
			-49.851,
			10660,
			"PSR J1640-4951"
		],
		[
			252.646,
			-49.351,
			5830,
			"PSR J1650-4921"
		],
		[
			255.303,
			-49.976,
			9680,
			"PSR J1701-4958"
		],
		[
			255.094,
			-49.654,
			14530,
			"PSR J1700-4939"
		],
		[
			254.729,
			-49.983,
			6260,
			"PSR J1658-4958"
		],
		[
			255.977,
			-48.865,
			4500,
			"PSR J1703-4851"
		],
		[
			254.6,
			-47.2,
			3e4,
			"PSR J1658-47"
		],
		[
			253.486,
			-48.914,
			13760,
			"PSR J1653-4854"
		],
		[
			253.225,
			-48.75,
			4790,
			"PSR J1652-48"
		],
		[
			252.326,
			-47.498,
			12690,
			"PSR J1649-4729"
		],
		[
			252.352,
			-46.886,
			5630,
			"PSR J1649-4653"
		],
		[
			252.092,
			-46.188,
			5710,
			"PSR J1648-4611"
		],
		[
			248.25,
			-50.252,
			7020,
			"PSR J1633-5015"
		],
		[
			248.981,
			-49.743,
			8850,
			"PSR J1635-4944"
		],
		[
			248.625,
			-49.867,
			14390,
			"PSR J1634-49"
		],
		[
			249.23,
			-49.553,
			11160,
			"PSR J1636-4933"
		],
		[
			249.494,
			-48.27,
			10010,
			"PSR J1637-4816"
		],
		[
			249.554,
			-47.426,
			6870,
			"PSR J1638-4725"
		],
		[
			248.166,
			-48.315,
			8540,
			"PSR J1632-4818"
		],
		[
			248.272,
			-48.093,
			11900,
			"PSR J1633-4805"
		],
		[
			248.07,
			-47.96,
			6960,
			"PSR J1632-4757"
		],
		[
			249.133,
			-48.065,
			6530,
			"PSR J1636-4803"
		],
		[
			249.297,
			-47.351,
			5940,
			"PSR J1637-4721"
		],
		[
			246.318,
			-49.229,
			8210,
			"PSR J1625-4913"
		],
		[
			246.325,
			-49.076,
			7940,
			"PSR J1625-4904"
		],
		[
			246.793,
			-48.752,
			6860,
			"PSR J1627-4845"
		],
		[
			247.129,
			-48.478,
			14290,
			"PSR J1628-4828"
		],
		[
			247.112,
			-48.083,
			11210,
			"PSR J1628-4804"
		],
		[
			246.677,
			-48.132,
			10250,
			"PSR J1626-4807"
		],
		[
			245.523,
			-48.775,
			5240,
			"PSR J1622-4845"
		],
		[
			245.697,
			-48.037,
			6e3,
			"PSR J1622-4802"
		],
		[
			246.229,
			-47.357,
			6110,
			"PSR J1624-4721"
		],
		[
			247.656,
			-47.551,
			6530,
			"PSR J1630-4733"
		],
		[
			247.51,
			-47.328,
			6700,
			"PSR J1630-4719"
		],
		[
			246.87,
			-47.114,
			7150,
			"PSR J1627-4706"
		],
		[
			246.078,
			-46.217,
			5140,
			"PSR J1624-4613"
		],
		[
			246.704,
			-45.624,
			5410,
			"PSR J1626-4537"
		],
		[
			250.055,
			-47.26,
			7250,
			"PSR J1640-4715"
		],
		[
			251.16,
			-46.961,
			9580,
			"PSR J1644-4657"
		],
		[
			251.025,
			-46.433,
			5680,
			"PSR J1644-46"
		],
		[
			250.198,
			-46.812,
			6100,
			"PSR J1640-4648"
		],
		[
			250.181,
			-46.526,
			12750,
			"PSR J1640-4631"
		],
		[
			249.307,
			-46.704,
			5770,
			"PSR J1637-4642"
		],
		[
			249.838,
			-46.076,
			4640,
			"PSR J1639-4604"
		],
		[
			249.4,
			-46.217,
			8160,
			"PSR J1637-46"
		],
		[
			249.596,
			-46.137,
			5850,
			"PSR J1638-4608"
		],
		[
			249.495,
			-45.891,
			3830,
			"PSR J1637-4553"
		],
		[
			248.981,
			-45.224,
			6960,
			"PSR J1635-4513"
		],
		[
			251.205,
			-45.986,
			4500,
			"PSR J1644-4559"
		],
		[
			250.806,
			-45.848,
			5880,
			"PSR J1643-4550"
		],
		[
			250.835,
			-45.367,
			6190,
			"PSR J1643-4522"
		],
		[
			250.904,
			-45.096,
			6300,
			"PSR J1643-4505"
		],
		[
			249.471,
			-44.841,
			8200,
			"PSR J1637-4450"
		],
		[
			249.575,
			-44.667,
			9150,
			"PSR J1638-44"
		],
		[
			249.693,
			-44.284,
			8460,
			"PSR J1638-4417"
		],
		[
			249.779,
			-43.998,
			5230,
			"PSR J1639-4359"
		],
		[
			249.72,
			-43.734,
			5090,
			"PSR J1638-4344"
		],
		[
			248.208,
			-46.363,
			8420,
			"PSR J1632-4621"
		],
		[
			248.446,
			-44.885,
			11930,
			"PSR J1633-4453"
		],
		[
			248.058,
			-45.152,
			9130,
			"PSR J1632-4509"
		],
		[
			246.75,
			-44.367,
			7650,
			"PSR J1626-44"
		],
		[
			249.069,
			-44.674,
			9330,
			"PSR J1636-4440"
		],
		[
			249.487,
			-43.595,
			3e4,
			"PSR J1637-4335"
		],
		[
			269.313,
			-53.374,
			1360,
			"PSR J1757-5322"
		],
		[
			263.199,
			-50.817,
			1810,
			"PSR J1732-5049"
		],
		[
			267.349,
			-49.533,
			1800,
			"PSR J1749-4931"
		],
		[
			265.609,
			-46.282,
			4990,
			"PSR J1742-4616"
		],
		[
			259.005,
			-47.184,
			19580,
			"PSR J1716-4711"
		],
		[
			262.925,
			-47.743,
			4980,
			"PSR J1731-4744"
		],
		[
			261.107,
			-45.004,
			6260,
			"PSR J1724-4500"
		],
		[
			259.55,
			-45.654,
			10820,
			"PSR J1718-4539"
		],
		[
			260.694,
			-44.009,
			7270,
			"PSR J1722-4400"
		],
		[
			259.953,
			-43.036,
			9420,
			"PSR J1719-4302"
		],
		[
			258.794,
			-42.915,
			12580,
			"PSR J1715-4254"
		],
		[
			267.926,
			-46.957,
			1030,
			"PSR J1751-4657"
		],
		[
			265.772,
			-42.201,
			4670,
			"PSR J1743-4212"
		],
		[
			266.953,
			-40.615,
			5810,
			"PSR J1747-4036"
		],
		[
			263.204,
			-41.942,
			8780,
			"PSR J1732-4156"
		],
		[
			263.208,
			-41.48,
			5940,
			"PSR J1732-4128"
		],
		[
			259.468,
			-41.055,
			5470,
			"PSR J1717-4054"
		],
		[
			259.55,
			-41.117,
			6780,
			"PSR J1718-41"
		],
		[
			261.423,
			-40.72,
			4800,
			"PSR J1725-4043"
		],
		[
			262.115,
			-40.469,
			5510,
			"PSR J1728-4028"
		],
		[
			261.639,
			-40.101,
			6190,
			"PSR J1726-4006"
		],
		[
			265.518,
			-39.956,
			6400,
			"PSR J1742-3957"
		],
		[
			264.909,
			-39.867,
			1130,
			"PSR J1739-3951"
		],
		[
			263.494,
			-40.094,
			13950,
			"PSR J1733-4005"
		],
		[
			266.011,
			-39.373,
			4600,
			"PSR J1744-3922"
		],
		[
			265.325,
			-39.461,
			4750,
			"PSR J1741-3927"
		],
		[
			266.314,
			-38.202,
			4820,
			"PSR J1745-3812"
		],
		[
			263.087,
			-37.485,
			6200,
			"PSR J1732-3729"
		],
		[
			263.361,
			-37.282,
			3440,
			"PSR J1733-3716"
		],
		[
			264.417,
			-35.929,
			2250,
			"PSR J1737-3555"
		],
		[
			256.815,
			-47.493,
			10640,
			"PSR J1707-4729"
		],
		[
			255.371,
			-45.564,
			17390,
			"PSR J1701-4533"
		],
		[
			257.054,
			-45.381,
			3e4,
			"PSR J1708-4522"
		],
		[
			255.836,
			-44.712,
			5340,
			"PSR J1703-4442"
		],
		[
			255.224,
			-44.374,
			6440,
			"PSR J1700-4422"
		],
		[
			255.719,
			-44.467,
			7050,
			"PSR J1702-4428"
		],
		[
			252.988,
			-45.32,
			7290,
			"PSR J1651-4519"
		],
		[
			252.635,
			-45.044,
			5090,
			"PSR J1650-4502"
		],
		[
			252.054,
			-44.974,
			9890,
			"PSR J1648-4458"
		],
		[
			253.248,
			-44.101,
			8800,
			"PSR J1652-4406"
		],
		[
			252.686,
			-43.692,
			8110,
			"PSR J1650-4341"
		],
		[
			254.914,
			-44.65,
			9180,
			"PSR J1659-4439"
		],
		[
			254.403,
			-44.539,
			5580,
			"PSR J1657-4432"
		],
		[
			254.985,
			-43.268,
			7930,
			"PSR J1659-4316"
		],
		[
			254.569,
			-43.114,
			9590,
			"PSR J1658-4306"
		],
		[
			253.374,
			-43.25,
			5130,
			"PSR J1653-4315"
		],
		[
			252.953,
			-42.77,
			5200,
			"PSR J1651-4246"
		],
		[
			253.592,
			-42.761,
			11840,
			"PSR J1654-4245"
		],
		[
			253.418,
			-42.818,
			5640,
			"PSR J1653-4249"
		],
		[
			257.428,
			-44.486,
			2600,
			"PSR J1709-4429"
		],
		[
			256.923,
			-44.289,
			9170,
			"PSR J1707-4417"
		],
		[
			257.422,
			-44.02,
			4980,
			"PSR J1709-4401"
		],
		[
			257.446,
			-43.912,
			4980,
			"PSR J1709-43"
		],
		[
			257.379,
			-43.704,
			5490,
			"PSR J1709-4342"
		],
		[
			256.917,
			-43.687,
			7990,
			"PSR J1707-4341"
		],
		[
			257.794,
			-43.381,
			4170,
			"PSR J1711-4322"
		],
		[
			256.4,
			-43.52,
			3760,
			"PSR J1705-4331"
		],
		[
			256.519,
			-43.172,
			13430,
			"PSR J1706-4310"
		],
		[
			255.612,
			-43.178,
			5440,
			"PSR J1702-4310"
		],
		[
			255.614,
			-43.112,
			7120,
			"PSR J1702-4306"
		],
		[
			257.599,
			-41.805,
			6900,
			"PSR J1710-4148"
		],
		[
			256.841,
			-40.899,
			4e3,
			"PSR J1707-4053"
		],
		[
			255.652,
			-42.284,
			7490,
			"PSR J1702-4217"
		],
		[
			253.598,
			-41.673,
			5150,
			"PSR J1654-4140"
		],
		[
			255.719,
			-41.48,
			5180,
			"PSR J1702-4128"
		],
		[
			256.335,
			-41.146,
			11870,
			"PSR J1705-4108"
		],
		[
			257.195,
			-40.148,
			3800,
			"PSR J1708-4008"
		],
		[
			256.374,
			-39.85,
			3860,
			"PSR J1705-3950"
		],
		[
			255.161,
			-40.211,
			5770,
			"PSR J1700-4012"
		],
		[
			256.405,
			-39.608,
			8460,
			"PSR J1705-3936"
		],
		[
			255.56,
			-39.544,
			9690,
			"PSR J1702-3932"
		],
		[
			251.15,
			-44.167,
			7650,
			"PSR J1644-44"
		],
		[
			252.335,
			-43.823,
			5560,
			"PSR J1649-4349"
		],
		[
			251.714,
			-43.777,
			6860,
			"PSR J1646-4346"
		],
		[
			251.73,
			-43.135,
			10960,
			"PSR J1646-4308"
		],
		[
			252.555,
			-41.443,
			5060,
			"PSR J1650-4126"
		],
		[
			249.629,
			-42.566,
			15990,
			"PSR J1638-42"
		],
		[
			247.826,
			-41.918,
			8510,
			"PSR J1631-4155"
		],
		[
			249.565,
			-39.866,
			10960,
			"PSR J1638-3951"
		],
		[
			253.393,
			-40.5,
			10370,
			"PSR J1653-4030"
		],
		[
			255.093,
			-39.317,
			6340,
			"PSR J1700-3919"
		],
		[
			253.911,
			-38.736,
			11940,
			"PSR J1655-3844"
		],
		[
			253.416,
			-38.639,
			5120,
			"PSR J1653-3838"
		],
		[
			252.278,
			-39.596,
			9040,
			"PSR J1649-3935"
		],
		[
			252.451,
			-38.1,
			6620,
			"PSR J1649-3805"
		],
		[
			253.685,
			-37.183,
			13150,
			"PSR J1654-3710"
		],
		[
			259.185,
			-41.186,
			4790,
			"PSR J1716-4111"
		],
		[
			258.921,
			-40.573,
			4620,
			"PSR J1715-4034"
		],
		[
			259.45,
			-40.731,
			9030,
			"PSR J1717-4043"
		],
		[
			259.258,
			-40.725,
			11410,
			"PSR J1717-40435"
		],
		[
			259.757,
			-40.117,
			6280,
			"PSR J1719-4006"
		],
		[
			259.175,
			-40.091,
			6330,
			"PSR J1716-4005"
		],
		[
			259.356,
			-39.899,
			6880,
			"PSR J1717-3953"
		],
		[
			258.367,
			-39.817,
			5010,
			"PSR J1713-3949"
		],
		[
			258.146,
			-39.717,
			6370,
			"PSR J1712-391"
		],
		[
			258.146,
			-39.717,
			8940,
			"PSR J1712-392"
		],
		[
			258.81,
			-39.051,
			4800,
			"PSR J1715-3903"
		],
		[
			258.908,
			-38.99,
			10530,
			"PSR J1715-3859"
		],
		[
			261.364,
			-38.884,
			3440,
			"PSR J1725-3853"
		],
		[
			261.25,
			-38.81,
			4490,
			"PSR J1725-3848"
		],
		[
			260.75,
			-38.333,
			7e3,
			"PSR J1723-38"
		],
		[
			259.327,
			-38.784,
			9520,
			"PSR J1717-3847"
		],
		[
			259.557,
			-38.422,
			4240,
			"PSR J1718-3825"
		],
		[
			258.26,
			-38.741,
			6500,
			"PSR J1713-3844"
		],
		[
			257.935,
			-38.437,
			5200,
			"PSR J1711-3826"
		],
		[
			257.317,
			-38.688,
			5170,
			"PSR J1709-3841"
		],
		[
			257.069,
			-38.46,
			17550,
			"PSR J1708-3827"
		],
		[
			256.589,
			-38.664,
			12200,
			"PSR J1706-3839"
		],
		[
			257.625,
			-37.5,
			5340,
			"PSR J1710-37"
		],
		[
			258.524,
			-38.175,
			13200,
			"PSR J1714-3810"
		],
		[
			259.316,
			-37.627,
			6310,
			"PSR J1717-3737"
		],
		[
			259.542,
			-37.315,
			5080,
			"PSR J1718-3718"
		],
		[
			259.577,
			-37.238,
			10870,
			"PSR J1718-3714"
		],
		[
			259.047,
			-37.346,
			9460,
			"PSR J1716-3720"
		],
		[
			258.79,
			-37.001,
			6080,
			"PSR J1715-3700"
		],
		[
			262.193,
			-37.552,
			4940,
			"PSR J1728-3733"
		],
		[
			260.747,
			-37.201,
			2510,
			"PSR J1722-3712"
		],
		[
			260.782,
			-36.987,
			4280,
			"PSR J1723-3659"
		],
		[
			261.707,
			-36.596,
			7360,
			"PSR J1726-3635"
		],
		[
			263.125,
			-35.083,
			5e3,
			"PSR J1732-35"
		],
		[
			262.525,
			-34.8,
			8410,
			"PSR J1730-34"
		],
		[
			263.03,
			-34.435,
			6380,
			"PSR J1732-3426"
		],
		[
			260.008,
			-36.985,
			5110,
			"PSR J1720-3659"
		],
		[
			260.225,
			-36.883,
			4890,
			"PSR J1720-36"
		],
		[
			260.541,
			-36.548,
			5300,
			"PSR J1722-3632"
		],
		[
			261.179,
			-35.817,
			6610,
			"PSR J1724-35"
		],
		[
			261.426,
			-35.771,
			10200,
			"PSR J1725-3546"
		],
		[
			260.387,
			-35.547,
			4600,
			"PSR J1721-3532"
		],
		[
			261.531,
			-35.499,
			9970,
			"PSR J1726-3530"
		],
		[
			261.2,
			-35.093,
			12010,
			"PSR J1724-3505"
		],
		[
			255.858,
			-38.2,
			7780,
			"PSR J1703-38"
		],
		[
			255.327,
			-37.44,
			7810,
			"PSR J1701-3726"
		],
		[
			257.15,
			-36.689,
			6020,
			"PSR J1708-3641"
		],
		[
			257.438,
			-36.434,
			8970,
			"PSR J1709-3626"
		],
		[
			257.073,
			-35.106,
			3500,
			"PSR J1708-3506"
		],
		[
			257.241,
			-34.446,
			4780,
			"PSR J1708-3426"
		],
		[
			254.137,
			-36.367,
			7600,
			"PSR J1656-3621"
		],
		[
			255.205,
			-36.198,
			6480,
			"PSR J1700-3611"
		],
		[
			256.427,
			-34.396,
			3750,
			"PSR J1705-3423"
		],
		[
			259.334,
			-34.417,
			22210,
			"PSR J1717-3425"
		],
		[
			258.848,
			-32.792,
			3910,
			"PSR J1715-3247"
		],
		[
			260.512,
			-32.129,
			3180,
			"PSR J1722-3207"
		],
		[
			240.479,
			-53.595,
			4040,
			"PSR J1601-5335"
		],
		[
			240.364,
			-52.736,
			5140,
			"PSR J1601-5244"
		],
		[
			238.613,
			-52.161,
			3440,
			"PSR J1554-5209"
		],
		[
			241.329,
			-52.263,
			7060,
			"PSR J1605-5215"
		],
		[
			241.955,
			-51.671,
			7010,
			"PSR J1607-5140"
		],
		[
			240.578,
			-51.001,
			8e3,
			"PSR J1602-5100"
		],
		[
			240.221,
			-50.739,
			6900,
			"PSR J1600-5044"
		],
		[
			240.35,
			-50.383,
			1540,
			"PSR J1601-50"
		],
		[
			237.512,
			-52.702,
			6670,
			"PSR J1550-5242"
		],
		[
			238.055,
			-49.63,
			3360,
			"PSR J1552-4937"
		],
		[
			237.081,
			-49.461,
			3890,
			"PSR J1548-4927"
		],
		[
			242.685,
			-50.112,
			6590,
			"PSR J1610-5006"
		],
		[
			242.944,
			-49.833,
			8820,
			"PSR J1611-4949"
		],
		[
			240.576,
			-49.959,
			6830,
			"PSR J1602-4957"
		],
		[
			241.096,
			-49.166,
			3590,
			"PSR J1604-4909"
		],
		[
			243.225,
			-49.45,
			7180,
			"PSR J1612-49"
		],
		[
			242.761,
			-48.194,
			5410,
			"PSR J1611-4811"
		],
		[
			241.123,
			-47.313,
			1480,
			"PSR J1604-4718"
		],
		[
			235.689,
			-50.567,
			2580,
			"PSR J1542-5034"
		],
		[
			235.993,
			-50.233,
			6760,
			"PSR J1543-5013"
		],
		[
			234,
			-49.8,
			1340,
			"PSR J1536-4948"
		],
		[
			234.367,
			-49.201,
			1820,
			"PSR J1537-4912"
		],
		[
			234.92,
			-48.482,
			3740,
			"PSR J1539-4828"
		],
		[
			237.338,
			-48.81,
			1540,
			"PSR J1549-4848"
		],
		[
			237.097,
			-48.364,
			3760,
			"PSR J1548-4821"
		],
		[
			233.533,
			-46.233,
			1910,
			"PSR J1534-46"
		],
		[
			236.483,
			-45.844,
			2010,
			"PSR J1545-4550"
		],
		[
			237.95,
			-44.412,
			1980,
			"PSR J1551-4424"
		],
		[
			244.528,
			-47.389,
			3420,
			"PSR J1618-4723"
		],
		[
			243.371,
			-47.24,
			3890,
			"PSR J1613-4714"
		],
		[
			244.396,
			-46.143,
			10590,
			"PSR J1617-4608"
		],
		[
			242.421,
			-46.273,
			4120,
			"PSR J1609-4616"
		],
		[
			246.089,
			-44.193,
			3640,
			"PSR J1624-4411"
		],
		[
			245.625,
			-43.789,
			5370,
			"PSR J1622-4347"
		],
		[
			245.689,
			-43.541,
			8320,
			"PSR J1622-4332"
		],
		[
			245.951,
			-42.948,
			21850,
			"PSR J1623-4256"
		],
		[
			244.775,
			-42.033,
			6900,
			"PSR J1619-42"
		],
		[
			246.293,
			-40.806,
			5180,
			"PSR J1625-4048"
		],
		[
			244.347,
			-42.283,
			6280,
			"PSR J1617-4216"
		],
		[
			244.625,
			-39.317,
			4760,
			"PSR J1618-39"
		],
		[
			239.923,
			-44.646,
			2300,
			"PSR J1559-4438"
		],
		[
			239.251,
			-42.97,
			7530,
			"PSR J1557-4258"
		],
		[
			243.63,
			-39.625,
			10100,
			"PSR J1614-3937"
		],
		[
			243.679,
			-38.771,
			4780,
			"PSR J1614-38"
		],
		[
			229.364,
			-43.938,
			4440,
			"PSR J1517-4356"
		],
		[
			233.717,
			-44.469,
			10940,
			"PSR J1534-4428"
		],
		[
			233.983,
			-44.252,
			5380,
			"PSR J1535-4415"
		],
		[
			235.479,
			-42.314,
			2070,
			"PSR J1541-42"
		],
		[
			232.033,
			-41.158,
			5960,
			"PSR J1528-4109"
		],
		[
			233.821,
			-41.234,
			2800,
			"PSR J1535-4114"
		],
		[
			232.784,
			-40.209,
			7750,
			"PSR J1531-4012"
		],
		[
			227.704,
			-44.369,
			4220,
			"PSR J1510-4422"
		],
		[
			226.892,
			-43.868,
			1790,
			"PSR J1507-4352"
		],
		[
			231.996,
			-39.526,
			2010,
			"PSR J1527-3931"
		],
		[
			232.313,
			-38.479,
			4850,
			"PSR J1529-3828"
		],
		[
			236.514,
			-37.786,
			7660,
			"PSR J1546-3747A"
		],
		[
			240.974,
			-35.666,
			3830,
			"PSR J1603-3539"
		],
		[
			234.072,
			-36.05,
			6450,
			"PSR J1536-3602"
		],
		[
			249.656,
			-38.251,
			17540,
			"PSR J1638-3815"
		],
		[
			245.519,
			-37.854,
			11550,
			"PSR J1622-3751"
		],
		[
			247.399,
			-36.604,
			3740,
			"PSR J1629-3636"
		],
		[
			251.944,
			-36.118,
			12900,
			"PSR J1647-3607"
		],
		[
			247.029,
			-32.097,
			1540,
			"PSR J1628-3205"
		],
		[
			255.221,
			-33.213,
			5640,
			"PSR J1700-3312"
		],
		[
			252.025,
			-32.945,
			5300,
			"PSR J1648-3256"
		],
		[
			253.852,
			-30.812,
			8570,
			"PSR J1655-3048"
		],
		[
			255.844,
			-32.697,
			3310,
			"PSR J1703-3241"
		],
		[
			255.431,
			-31.51,
			4530,
			"PSR J1701-3130"
		],
		[
			255.304,
			-30.117,
			7050,
			"PSR J1701-3006C"
		],
		[
			255.303,
			-30.114,
			7050,
			"PSR J1701-3006B"
		],
		[
			255.303,
			-30.114,
			7050,
			"PSR J1701-3006F"
		],
		[
			255.305,
			-30.113,
			7050,
			"PSR J1701-3006E"
		],
		[
			255.307,
			-30.112,
			7050,
			"PSR J1701-3006D"
		],
		[
			255.302,
			-30.108,
			7050,
			"PSR J1701-3006A"
		],
		[
			253.598,
			-27.217,
			4080,
			"PSR J1654-2713"
		],
		[
			243.97,
			-29.671,
			1880,
			"PSR J1615-2940"
		],
		[
			238.825,
			-31.572,
			6100,
			"PSR J1555-3134"
		],
		[
			240.216,
			-30.897,
			1800,
			"PSR J1600-3053"
		],
		[
			240.784,
			-27.224,
			2580,
			"PSR J1603-2712"
		],
		[
			248.967,
			-26.271,
			7230,
			"PSR J1635-26"
		],
		[
			245.909,
			-26.532,
			1800,
			"PSR J1623-2631"
		],
		[
			250.325,
			-23.793,
			1330,
			"PSR J1641-2347"
		],
		[
			243.109,
			-24.134,
			3120,
			"PSR J1612-2408"
		],
		[
			243.5,
			-23.25,
			3880,
			"PSR J1614-23"
		],
		[
			184.031,
			-64.169,
			1710,
			"PSR J1216-6410"
		],
		[
			186.092,
			-64.132,
			4e3,
			"PSR J1224-6407"
		],
		[
			186.428,
			-64.145,
			24600,
			"PSR J1225-6408"
		],
		[
			188.416,
			-63.749,
			3e4,
			"PSR J1233-6344"
		],
		[
			188.381,
			-63.208,
			20490,
			"PSR J1233-6312"
		],
		[
			186.8,
			-63.15,
			15490,
			"PSR J1227-63"
		],
		[
			187.804,
			-63.055,
			12120,
			"PSR J1231-6303"
		],
		[
			182.851,
			-63.413,
			12300,
			"PSR J1211-6324"
		],
		[
			184.175,
			-62.399,
			3e4,
			"PSR J1216-6223"
		],
		[
			185.074,
			-63.313,
			13960,
			"PSR J1220-6318"
		],
		[
			186.752,
			-62.145,
			15820,
			"PSR J1227-6208"
		],
		[
			186.184,
			-62.145,
			23640,
			"PSR J1224-6208"
		],
		[
			191.338,
			-62.649,
			14630,
			"PSR J1245-6238"
		],
		[
			193.635,
			-61.847,
			2240,
			"PSR J1254-6150"
		],
		[
			193.979,
			-61.519,
			7360,
			"PSR J1255-6131"
		],
		[
			180.346,
			-63.117,
			3e4,
			"PSR J1201-6306"
		],
		[
			186.369,
			-60.594,
			6190,
			"PSR J1225-6035"
		],
		[
			193.368,
			-58.345,
			2940,
			"PSR J1253-5820"
		],
		[
			190.897,
			-57.595,
			19200,
			"PSR J1243-5735"
		],
		[
			200.415,
			-59.381,
			3e4,
			"PSR J1321-5922"
		],
		[
			199.443,
			-57.992,
			5550,
			"PSR J1317-5759"
		],
		[
			197.088,
			-58.737,
			8860,
			"PSR J1308-5844"
		],
		[
			198.224,
			-55.28,
			6750,
			"PSR J1312-5516"
		],
		[
			200.225,
			-53.985,
			4230,
			"PSR J1320-5359"
		],
		[
			198.019,
			-54.045,
			9650,
			"PSR J1312-5402"
		],
		[
			202.75,
			-52.757,
			10500,
			"PSR J1331-5245"
		],
		[
			207.567,
			-51.257,
			4520,
			"PSR J1350-5115"
		],
		[
			183.535,
			-58.507,
			4830,
			"PSR J1214-5830"
		],
		[
			185.718,
			-57.639,
			2120,
			"PSR J1222-5738"
		],
		[
			180.618,
			-58.343,
			4940,
			"PSR J1202-5820"
		],
		[
			186.433,
			-55.945,
			5390,
			"PSR J1225-5556"
		],
		[
			188.829,
			-55.267,
			3890,
			"PSR J1235-5516"
		],
		[
			182.525,
			-55.984,
			11650,
			"PSR J1210-5559"
		],
		[
			183.753,
			-53.475,
			11240,
			"PSR J1215-5328"
		],
		[
			189.246,
			-50.56,
			8290,
			"PSR J1236-5033"
		],
		[
			191.048,
			-50.889,
			8490,
			"PSR J1244-5053"
		],
		[
			202.14,
			-49.359,
			7780,
			"PSR J1328-4921"
		],
		[
			204.986,
			-47.202,
			1770,
			"PSR J1339-4712"
		],
		[
			197.186,
			-46.842,
			4910,
			"PSR J1308-4650"
		],
		[
			203.437,
			-44.824,
			2320,
			"PSR J1333-4449"
		],
		[
			202.027,
			-43.962,
			2290,
			"PSR J1328-4357"
		],
		[
			208.994,
			-51.898,
			6470,
			"PSR J1355-5153"
		],
		[
			210.737,
			-51.4,
			1520,
			"PSR J1402-5124"
		],
		[
			214.186,
			-50.555,
			1990,
			"PSR J1416-5033"
		],
		[
			206.593,
			-49.302,
			3900,
			"PSR J1346-4918"
		],
		[
			211.339,
			-46.934,
			740,
			"PSR J1405-4656"
		],
		[
			217.936,
			-47.258,
			2420,
			"PSR J1431-4715"
		],
		[
			216.962,
			-41.982,
			5890,
			"PSR J1427-4158"
		],
		[
			214.71,
			-39.355,
			5040,
			"PSR J1418-3921"
		],
		[
			182.504,
			-52.441,
			2600,
			"PSR J1210-5226"
		],
		[
			181.841,
			-50.842,
			2190,
			"PSR J1207-5050"
		],
		[
			184.083,
			-50.45,
			8440,
			"PSR J1216-50"
		],
		[
			186.995,
			-48.895,
			2e3,
			"PSR J1227-4853"
		],
		[
			188.08,
			-47.714,
			1400,
			"PSR J1232-4742"
		],
		[
			187.941,
			-46.163,
			6160,
			"PSR J1231-4609"
		],
		[
			190.073,
			-41.414,
			3590,
			"PSR J1240-4124"
		],
		[
			203.9,
			-36.7,
			4110,
			"PSR J1335-3642"
		],
		[
			200.053,
			-35.207,
			930,
			"PSR J1320-3512"
		],
		[
			203.219,
			-30.538,
			870,
			"PSR J1332-3032"
		],
		[
			197.941,
			-34.508,
			3720,
			"PSR J1311-3430"
		],
		[
			195.5,
			-32,
			1860,
			"PSR J1302-32"
		],
		[
			223.95,
			-33.513,
			740,
			"PSR J1455-3330"
		],
		[
			232.146,
			-31.769,
			990,
			"PSR J1528-3146"
		],
		[
			240.77,
			-25.53,
			4600,
			"PSR J1603-2531"
		],
		[
			238.888,
			-23.686,
			4610,
			"PSR J1555-2341"
		],
		[
			243.652,
			-22.509,
			700,
			"PSR J1614-2230"
		],
		[
			242.272,
			-19.502,
			2330,
			"PSR J1609-1930"
		],
		[
			242.546,
			-17.833,
			4310,
			"PSR J1610-17"
		],
		[
			209.675,
			-25.55,
			3080,
			"PSR J1358-2533"
		],
		[
			210.126,
			-14.637,
			270,
			"PSR J1400-1438"
		],
		[
			229.746,
			-6.452,
			2690,
			"PSR J1518-0627"
		],
		[
			225.437,
			-.773,
			2370,
			"PSR J1501-0046"
		],
		[
			285.102,
			-79.863,
			3870,
			"PSR J1900-7951"
		],
		[
			280.358,
			-78.754,
			4010,
			"PSR J1841-7845"
		],
		[
			313.446,
			-72.012,
			1050,
			"PSR J2053-7200"
		],
		[
			321.88,
			-66.808,
			2750,
			"PSR J2127-6648"
		],
		[
			328.756,
			-56.699,
			860,
			"PSR J2155-5641"
		],
		[
			281.557,
			-74.051,
			4070,
			"PSR J1846-7403"
		],
		[
			285.912,
			-70.862,
			1130,
			"PSR J1903-7051"
		],
		[
			285.5,
			-70,
			1120,
			"PSR J1902-70"
		],
		[
			293.385,
			-62.196,
			630,
			"PSR J1933-6211"
		],
		[
			322.345,
			-57.354,
			3200,
			"PSR J2129-5721"
		],
		[
			326.163,
			-52.626,
			1430,
			"PSR J2144-5237"
		],
		[
			351.112,
			-60.902,
			900,
			"PSR J2324-6054"
		],
		[
			339.216,
			-55.464,
			2030,
			"PSR J2236-5527"
		],
		[
			340.425,
			-52.61,
			680,
			"PSR J2241-5236"
		],
		[
			326.05,
			-39.566,
			160,
			"PSR J2144-3933"
		],
		[
			328.807,
			-31.315,
			970,
			"PSR J2155-3118"
		],
		[
			287.718,
			-59.985,
			2150,
			"PSR J1910-5959D"
		],
		[
			287.717,
			-59.984,
			2150,
			"PSR J1910-5959B"
		],
		[
			287.717,
			-59.984,
			2160,
			"PSR J1910-5959E"
		],
		[
			278.312,
			-60.384,
			1850,
			"PSR J1833-6023"
		],
		[
			287.773,
			-60.017,
			2160,
			"PSR J1910-5959C"
		],
		[
			287.928,
			-59.974,
			4550,
			"PSR J1910-5959A"
		],
		[
			296.6,
			-54.033,
			1460,
			"PSR J1946-5403"
		],
		[
			274.152,
			-56.728,
			3060,
			"PSR J1816-5643"
		],
		[
			272.685,
			-53.635,
			2e3,
			"PSR J1810-5338"
		],
		[
			285.512,
			-51.099,
			2100,
			"PSR J1902-5105"
		],
		[
			309.726,
			-38.27,
			2940,
			"PSR J2038-3816"
		],
		[
			296.775,
			-42.25,
			2970,
			"PSR J1947-4215"
		],
		[
			272.863,
			-49.506,
			2010,
			"PSR J1811-4930"
		],
		[
			287.448,
			-37.737,
			1140,
			"PSR J1909-3744"
		],
		[
			275.547,
			-42.153,
			3500,
			"PSR J1822-4209"
		],
		[
			274.251,
			-38.633,
			5230,
			"PSR J1817-3837"
		],
		[
			284.148,
			-37.902,
			160,
			"PSR J1856-3754"
		],
		[
			278.933,
			-32.99,
			10700,
			"PSR J1835-3259A"
		],
		[
			293.026,
			-36.917,
			4410,
			"PSR J1932-3655"
		],
		[
			296.716,
			-29.23,
			4310,
			"PSR J1946-2913"
		],
		[
			299,
			-27.883,
			4080,
			"PSR J1956-28"
		],
		[
			297.356,
			-25.4,
			1340,
			"PSR J1949-2524"
		],
		[
			295.252,
			-26.035,
			4740,
			"PSR J1941-2602"
		],
		[
			295.125,
			-24.05,
			4910,
			"PSR J1940-2403"
		],
		[
			317.127,
			-34.494,
			2630,
			"PSR J2108-3429"
		],
		[
			321.183,
			-33.979,
			410,
			"PSR J2124-3358"
		],
		[
			325.093,
			-23.18,
			9200,
			"PSR J2140-2310A"
		],
		[
			325.092,
			-23.18,
			9200,
			"PSR J2140-2310B"
		],
		[
			324.001,
			-16.104,
			1270,
			"PSR J2136-1606"
		],
		[
			303.194,
			-20.492,
			3920,
			"PSR J2012-2029"
		],
		[
			308.481,
			-19.65,
			1540,
			"PSR J2033-1938"
		],
		[
			296.022,
			-17.836,
			5300,
			"PSR J1944-1750"
		],
		[
			302.691,
			-13.399,
			1290,
			"PSR J2010-1323"
		],
		[
			312.149,
			-16.279,
			950,
			"PSR J2048-1616"
		],
		[
			312.781,
			-8.46,
			1280,
			"PSR J2051-0827"
		],
		[
			311.501,
			-4.357,
			3830,
			"PSR J2046-0421"
		]
	];
	PULSARS.forEach((q) => {
		q.psr = true;
		q._dir = dirOf(q[0], q[1]);
		q.n = q[3];
		q.d = q[2];
	});
	const CLUSTERS = [
		[
			56.601,
			24.114,
			128,
			"Melotte 22"
		],
		[
			56.336,
			29.827,
			416,
			"UBC 19"
		],
		[
			52.297,
			31.31,
			299,
			"NGC 1333"
		],
		[
			67.449,
			25.422,
			1233,
			"UBC 199"
		],
		[
			74.258,
			28.763,
			2586,
			"Czernik 19"
		],
		[
			76.78,
			30.846,
			6088,
			"Skiff J0507+30.8"
		],
		[
			75.919,
			32.157,
			1529,
			"FSR 0771"
		],
		[
			61.146,
			32.532,
			341,
			"UBC 31"
		],
		[
			66.963,
			30.936,
			1325,
			"Czernik 18"
		],
		[
			67.458,
			38.496,
			1876,
			"FSR 0728"
		],
		[
			68.11,
			39.479,
			669,
			"COIN-Gaia 11"
		],
		[
			68.385,
			40.509,
			1018,
			"COIN-Gaia 10"
		],
		[
			78.634,
			31.691,
			1044,
			"COIN-Gaia 20"
		],
		[
			81.09,
			32.607,
			3410,
			"Berkeley 69"
		],
		[
			80.724,
			33.444,
			3222,
			"NGC 1893"
		],
		[
			80.56,
			33.792,
			1137,
			"Gulliver 8"
		],
		[
			78.623,
			32.707,
			1332,
			"Dolidze 16"
		],
		[
			81.297,
			33.688,
			1190,
			"Gulliver 54"
		],
		[
			82.188,
			34.29,
			1241,
			"COIN-Gaia 19"
		],
		[
			81.956,
			34.452,
			2354,
			"Stock 8"
		],
		[
			80.975,
			34.012,
			2434,
			"Gulliver 53"
		],
		[
			82.089,
			34.777,
			2338,
			"Kronberger 1"
		],
		[
			82.033,
			35.33,
			1618,
			"NGC 1907"
		],
		[
			82.109,
			35.736,
			1744,
			"UBC 198"
		],
		[
			82.167,
			35.824,
			1104,
			"NGC 1912"
		],
		[
			80.689,
			35.27,
			2671,
			"Gulliver 26"
		],
		[
			81.671,
			36.013,
			4036,
			"Czernik 21"
		],
		[
			81.244,
			37.558,
			1082,
			"COIN-Gaia 17"
		],
		[
			78.408,
			35.498,
			1027,
			"COIN-Gaia 18"
		],
		[
			76.09,
			35.831,
			1174,
			"COIN-Gaia 15"
		],
		[
			75.067,
			36.23,
			1314,
			"UBC 61"
		],
		[
			77.033,
			37.02,
			1663,
			"NGC 1778"
		],
		[
			75.508,
			37.475,
			347,
			"RSG 1"
		],
		[
			80.179,
			37.438,
			1531,
			"COIN-Gaia 16"
		],
		[
			79.664,
			37.815,
			1546,
			"UBC 63"
		],
		[
			79.976,
			38.975,
			3986,
			"UBC 613"
		],
		[
			80.031,
			39.336,
			2900,
			"NGC 1857"
		],
		[
			80.129,
			39.545,
			3488,
			"Czernik 20"
		],
		[
			77.09,
			39.069,
			4106,
			"King 17"
		],
		[
			77.696,
			39.195,
			936,
			"COIN-Gaia 14"
		],
		[
			79.031,
			39.518,
			2904,
			"UBC 432"
		],
		[
			79.833,
			40.14,
			5607,
			"UBC 612"
		],
		[
			84.808,
			37.85,
			373,
			"Stock 10"
		],
		[
			85.342,
			39.237,
			4807,
			"Teutsch 2"
		],
		[
			83.359,
			39.841,
			3185,
			"UBC 197"
		],
		[
			83.186,
			42.087,
			545,
			"COIN-Gaia 13"
		],
		[
			81.457,
			41.951,
			4954,
			"Berkeley 70"
		],
		[
			81,
			42.315,
			4683,
			"SAI 47"
		],
		[
			79.209,
			41.708,
			954,
			"COIN-Gaia 12"
		],
		[
			73.471,
			40.859,
			2856,
			"FSR 0735"
		],
		[
			71.449,
			41.477,
			3129,
			"UBC 430"
		],
		[
			72.4,
			41.744,
			1048,
			"ASCC 12"
		],
		[
			71.053,
			42.134,
			3383,
			"Berkeley 68"
		],
		[
			69.612,
			42.95,
			1010,
			"COIN-Gaia 39"
		],
		[
			71.1,
			42.691,
			4298,
			"Berkeley 12"
		],
		[
			71.638,
			44.711,
			3401,
			"Ruprecht 148"
		],
		[
			74.547,
			43.036,
			2643,
			"Skiff J0458+43.0"
		],
		[
			74.935,
			43.488,
			4933,
			"Berkeley 14"
		],
		[
			77.786,
			45.718,
			3575,
			"FSR 0716"
		],
		[
			75.52,
			44.506,
			2958,
			"Berkeley 15"
		],
		[
			72.763,
			43.676,
			1341,
			"NGC 1664"
		],
		[
			72.578,
			44.762,
			2580,
			"UBC 429"
		],
		[
			80.531,
			45.442,
			5632,
			"Berkeley 18"
		],
		[
			78.255,
			44.417,
			1115,
			"ASCC 13"
		],
		[
			81.48,
			46.493,
			4710,
			"NGC 1883"
		],
		[
			82.239,
			48.043,
			2585,
			"UBC 59"
		],
		[
			77.914,
			47.691,
			5124,
			"NGC 1798"
		],
		[
			56.132,
			32.159,
			337,
			"IC 348"
		],
		[
			61.002,
			35.347,
			604,
			"UBC 4"
		],
		[
			51.87,
			34.981,
			660,
			"ASCC 10"
		],
		[
			52.894,
			37.38,
			686,
			"NGC 1342"
		],
		[
			62.981,
			42.723,
			2090,
			"UBC 57"
		],
		[
			65.126,
			44.922,
			3050,
			"Berkeley 11"
		],
		[
			61.771,
			44.094,
			706,
			"UPK 333"
		],
		[
			64.747,
			46.453,
			1105,
			"UBC 54"
		],
		[
			62.703,
			46.874,
			3115,
			"Juchert 20"
		],
		[
			53.056,
			44.856,
			867,
			"ASCC 11"
		],
		[
			52.011,
			45.152,
			1356,
			"Gulliver 25"
		],
		[
			58.17,
			45.969,
			951,
			"UBC 88"
		],
		[
			59.821,
			47.395,
			1692,
			"UBC 53"
		],
		[
			59.236,
			48.622,
			3069,
			"UBC 425"
		],
		[
			62.47,
			49.504,
			1546,
			"NGC 1513"
		],
		[
			62.5,
			50.103,
			2675,
			"UBC 426"
		],
		[
			61.766,
			51.141,
			1182,
			"FSR 0667"
		],
		[
			59.783,
			51.785,
			3171,
			"King 7"
		],
		[
			61.111,
			52.668,
			1667,
			"NGC 1496"
		],
		[
			60.585,
			52.446,
			5822,
			"Juchert 19"
		],
		[
			59.648,
			52.56,
			1051,
			"UBC 51"
		],
		[
			67.996,
			43.62,
			907,
			"Gulliver 11"
		],
		[
			67.985,
			43.718,
			994,
			"NGC 1582"
		],
		[
			68.745,
			45.269,
			3073,
			"NGC 1605"
		],
		[
			66.793,
			44.67,
			3429,
			"UBC 428"
		],
		[
			69.874,
			47.534,
			891,
			"UBC 56"
		],
		[
			75.838,
			49.495,
			3795,
			"NGC 1724"
		],
		[
			66.364,
			46.122,
			896,
			"UBC 55"
		],
		[
			67.683,
			46.302,
			1101,
			"LP 2139"
		],
		[
			69.472,
			50.755,
			2216,
			"Berkeley 67"
		],
		[
			71.783,
			49.035,
			3130,
			"UBC 427"
		],
		[
			73.943,
			52.809,
			3958,
			"Berkeley 13"
		],
		[
			75.871,
			52.851,
			967,
			"NGC 1708"
		],
		[
			77.168,
			53.213,
			2926,
			"FSR 0683"
		],
		[
			84.519,
			57.124,
			497,
			"UBC 8"
		],
		[
			65.202,
			50.221,
			732,
			"NGC 1545"
		],
		[
			63.878,
			51.218,
			1067,
			"NGC 1528"
		],
		[
			64.728,
			52.344,
			2215,
			"UBC 52"
		],
		[
			65.262,
			53.069,
			3645,
			"UBC 609"
		],
		[
			71.602,
			55.199,
			657,
			"Alessi 2"
		],
		[
			64.682,
			52.863,
			4670,
			"Waterloo 1"
		],
		[
			68.037,
			56.066,
			720,
			"UPK 312"
		],
		[
			41.127,
			39.027,
			408,
			"UPK 305"
		],
		[
			40.054,
			40.291,
			206,
			"UPK 303"
		],
		[
			40.531,
			42.722,
			534,
			"NGC 1039"
		],
		[
			29.223,
			37.794,
			483,
			"NGC 752"
		],
		[
			30.347,
			43.787,
			779,
			"UPK 282"
		],
		[
			37.686,
			48.305,
			1361,
			"UBC 194"
		],
		[
			5.584,
			46.532,
			555,
			"UBC 2"
		],
		[
			4.18,
			52.298,
			1533,
			"UBC 182"
		],
		[
			13.343,
			49.536,
			689,
			"Alessi 1"
		],
		[
			28.136,
			53.058,
			5370,
			"Gaia 2"
		],
		[
			29.214,
			54.43,
			2095,
			"UBC 417"
		],
		[
			27.466,
			53.9,
			2872,
			"UBC 188"
		],
		[
			26.858,
			54.711,
			2887,
			"UBC 603"
		],
		[
			18.644,
			57.816,
			2608,
			"UBC 85"
		],
		[
			19.887,
			58.278,
			2749,
			"NGC 457"
		],
		[
			19.001,
			58.82,
			3109,
			"NGC 436"
		],
		[
			3.36,
			53.832,
			1837,
			"UBC 596"
		],
		[
			5.005,
			55.714,
			1046,
			"UBC 183"
		],
		[
			2.593,
			58.742,
			412,
			"Alessi 20"
		],
		[
			15.06,
			55.409,
			1204,
			"COIN-Gaia 2"
		],
		[
			13.205,
			56.629,
			2980,
			"IC 1590"
		],
		[
			12.741,
			58.188,
			6760,
			"King 2"
		],
		[
			16.487,
			59.632,
			2042,
			"UBC 36"
		],
		[
			10.952,
			60.197,
			1899,
			"Czernik 2"
		],
		[
			9.885,
			61.09,
			1228,
			"NGC 189"
		],
		[
			10.805,
			61.774,
			679,
			"NGC 225"
		],
		[
			9.945,
			61.967,
			2961,
			"Stock 24"
		],
		[
			7.59,
			57.922,
			2040,
			"Stock 21"
		],
		[
			5.76,
			59.451,
			1697,
			"UBC 184"
		],
		[
			7.607,
			60.213,
			1906,
			"NGC 129"
		],
		[
			7.36,
			60.498,
			1586,
			"UBC 33"
		],
		[
			6.319,
			60.392,
			6928,
			"Berkeley 2"
		],
		[
			6.312,
			61.326,
			3167,
			"NGC 103"
		],
		[
			4.078,
			59.967,
			5383,
			"Juchert Saloran 1"
		],
		[
			2.449,
			60.476,
			3779,
			"Berkeley 1"
		],
		[
			.597,
			60.975,
			3570,
			"UBC 406"
		],
		[
			.063,
			60.937,
			3468,
			"Berkeley 58"
		],
		[
			4.44,
			60.936,
			3711,
			"Berkeley 60"
		],
		[
			2.553,
			61.175,
			3525,
			"King 13"
		],
		[
			1.906,
			61.476,
			3124,
			"Czernik 1"
		],
		[
			1.161,
			62.835,
			1498,
			"Gulliver 24"
		],
		[
			7.896,
			61.506,
			5141,
			"NGC 136"
		],
		[
			8.262,
			61.854,
			3403,
			"King 15"
		],
		[
			7.317,
			62.389,
			2674,
			"FSR 0498"
		],
		[
			5.502,
			61.751,
			2618,
			"Mayer 1"
		],
		[
			6.318,
			62.624,
			2598,
			"Stock 20"
		],
		[
			5.895,
			62.712,
			3226,
			"SAI 4"
		],
		[
			7.987,
			63.163,
			2420,
			"King 14"
		],
		[
			8.262,
			63.316,
			3141,
			"NGC 146"
		],
		[
			7.8,
			63.397,
			4015,
			"UBC 185"
		],
		[
			6.999,
			62.925,
			2628,
			"UBC 410"
		],
		[
			6.701,
			63.208,
			3038,
			"UBC 409"
		],
		[
			6.416,
			63.754,
			4073,
			"FSR 0494"
		],
		[
			6.656,
			64.01,
			1423,
			"FSR 0496"
		],
		[
			5.505,
			64.383,
			1727,
			"King 1"
		],
		[
			4.566,
			63.367,
			3317,
			"UBC 407"
		],
		[
			1.959,
			62.984,
			3287,
			"UBC 597"
		],
		[
			.584,
			63.562,
			1123,
			"UBC 181"
		],
		[
			.865,
			63.587,
			4325,
			"Berkeley 104"
		],
		[
			.399,
			64.625,
			2860,
			"Stock 18"
		],
		[
			46.486,
			44.383,
			4988,
			"NGC 1193"
		],
		[
			48.691,
			47.235,
			3201,
			"NGC 1245"
		],
		[
			47.748,
			48.023,
			864,
			"COIN-Gaia 9"
		],
		[
			47.731,
			50.297,
			5318,
			"UBC 607"
		],
		[
			42.666,
			48.561,
			565,
			"UPK 296"
		],
		[
			51.617,
			48.975,
			171,
			"Melotte 20"
		],
		[
			53.524,
			51.409,
			2400,
			"NGC 1348"
		],
		[
			51.472,
			51.072,
			1274,
			"COIN-Gaia 38"
		],
		[
			50.967,
			51.237,
			2251,
			"UBC 424"
		],
		[
			50.781,
			52.223,
			2373,
			"Czernik 15"
		],
		[
			53.167,
			52.649,
			1814,
			"Berkeley 9"
		],
		[
			52.754,
			52.612,
			2751,
			"Czernik 16"
		],
		[
			57.361,
			52.658,
			1167,
			"NGC 1444"
		],
		[
			48.682,
			52.695,
			2581,
			"King 5"
		],
		[
			47.92,
			53.344,
			3064,
			"NGC 1220"
		],
		[
			51.982,
			56.444,
			751,
			"King 6"
		],
		[
			39.048,
			50.013,
			722,
			"COIN-Gaia 8"
		],
		[
			39.853,
			54.922,
			1919,
			"Czernik 12"
		],
		[
			39.232,
			55.905,
			710,
			"Trumpler 2"
		],
		[
			31.11,
			54.359,
			2737,
			"UBC 44"
		],
		[
			37.112,
			57.142,
			2479,
			"UBC 192"
		],
		[
			39.836,
			57.802,
			2466,
			"UBC 421"
		],
		[
			38.343,
			57.553,
			2614,
			"NGC 957"
		],
		[
			37.507,
			58,
			2693,
			"UBC 191"
		],
		[
			34.741,
			57.134,
			2197,
			"NGC 869"
		],
		[
			35.584,
			57.149,
			2130,
			"NGC 884"
		],
		[
			33.672,
			57.318,
			2626,
			"UBC 46"
		],
		[
			33.033,
			57.619,
			2544,
			"UBC 86"
		],
		[
			34.878,
			58.304,
			2327,
			"Basel 10"
		],
		[
			38.24,
			58.764,
			2845,
			"Czernik 8"
		],
		[
			34.694,
			58.924,
			2346,
			"UBC 419"
		],
		[
			35.218,
			59.188,
			6065,
			"SAI 17"
		],
		[
			45.109,
			57.307,
			2651,
			"SAI 25"
		],
		[
			41.671,
			57.743,
			2376,
			"ASCC 9"
		],
		[
			46.03,
			58.731,
			4759,
			"Berkeley 66"
		],
		[
			49.262,
			58.612,
			3176,
			"Czernik 14"
		],
		[
			48.257,
			58.927,
			2518,
			"UBC 423"
		],
		[
			49.075,
			60.377,
			625,
			"Stock 23"
		],
		[
			40.546,
			58.171,
			2355,
			"UBC 422"
		],
		[
			39.028,
			59.024,
			2706,
			"King 4"
		],
		[
			42.855,
			60.419,
			2398,
			"IC 1848"
		],
		[
			37.448,
			59.782,
			3225,
			"UBC 190"
		],
		[
			38.393,
			59.883,
			3304,
			"Czernik 9"
		],
		[
			38.483,
			60.167,
			4387,
			"Czernik 10"
		],
		[
			39.768,
			60.403,
			2282,
			"Berkeley 65"
		],
		[
			37.431,
			60.627,
			708,
			"Stock 7"
		],
		[
			38.21,
			61.471,
			1964,
			"IC 1805"
		],
		[
			40.333,
			60.871,
			2304,
			"UBC 420"
		],
		[
			40.677,
			61.616,
			1125,
			"NGC 1027"
		],
		[
			41.106,
			62.327,
			3500,
			"Czernik 13"
		],
		[
			44.816,
			60.566,
			2248,
			"SAI 24"
		],
		[
			48.004,
			63.218,
			693,
			"Trumpler 3"
		],
		[
			41.996,
			63.789,
			1514,
			"UBC 47"
		],
		[
			61.358,
			55.926,
			5383,
			"UBC 608"
		],
		[
			60.53,
			56.419,
			2491,
			"UBC 87"
		],
		[
			64.736,
			58.252,
			3576,
			"IC 361"
		],
		[
			58.84,
			58.391,
			4770,
			"Juchert 9"
		],
		[
			56.984,
			59.07,
			1706,
			"Tombaugh 5"
		],
		[
			60.217,
			59.198,
			2774,
			"UBC 49"
		],
		[
			61.954,
			62.332,
			1171,
			"NGC 1502"
		],
		[
			60.902,
			66.176,
			811,
			"UPK 294"
		],
		[
			54.894,
			66.486,
			2365,
			"Berkeley 10"
		],
		[
			69.976,
			71.28,
			177,
			"Platais 3"
		],
		[
			29.652,
			55.473,
			1373,
			"NGC 744"
		],
		[
			28.039,
			57.055,
			1322,
			"Stock 4"
		],
		[
			26.846,
			57.722,
			1590,
			"ASCC 6"
		],
		[
			27.408,
			58.078,
			912,
			"COIN-Gaia 5"
		],
		[
			28.101,
			58.636,
			3259,
			"COIN-Gaia 6"
		],
		[
			26.129,
			58.756,
			2205,
			"COIN-Gaia 4"
		],
		[
			33.738,
			58.466,
			1485,
			"COIN-Gaia 7"
		],
		[
			33.856,
			59.522,
			399,
			"Stock 2"
		],
		[
			34.671,
			59.832,
			2988,
			"UBC 418"
		],
		[
			31.862,
			60.26,
			3073,
			"Riddle 4"
		],
		[
			29.614,
			60.13,
			1169,
			"NGC 743"
		],
		[
			27.803,
			61.061,
			3051,
			"Berkeley 6"
		],
		[
			28.927,
			61.355,
			4146,
			"Czernik 5"
		],
		[
			31.231,
			61.776,
			1022,
			"COIN-Gaia 34"
		],
		[
			31.366,
			62.265,
			4893,
			"SAI 16"
		],
		[
			28.513,
			61.992,
			2929,
			"UBC 414"
		],
		[
			30.543,
			62.838,
			2541,
			"Czernik 6"
		],
		[
			23.255,
			59.797,
			2504,
			"UBC 41"
		],
		[
			22.643,
			60.245,
			2451,
			"UBC 40"
		],
		[
			26.108,
			60.679,
			3317,
			"NGC 659"
		],
		[
			23.339,
			60.659,
			2502,
			"NGC 581"
		],
		[
			23.433,
			60.751,
			4886,
			"Gulliver 16"
		],
		[
			23.711,
			60.658,
			2528,
			"UBC 186"
		],
		[
			23.915,
			61.283,
			2773,
			"Trumpler 1"
		],
		[
			19.698,
			60.358,
			3391,
			"FSR 0537"
		],
		[
			18.798,
			60.133,
			2050,
			"NGC 433"
		],
		[
			18.739,
			60.505,
			1209,
			"COIN-Gaia 3"
		],
		[
			19.817,
			61.019,
			2045,
			"UBC 39"
		],
		[
			19.349,
			61.273,
			2842,
			"FSR 0534"
		],
		[
			21.504,
			62.624,
			3999,
			"SAI 14"
		],
		[
			19.919,
			63.026,
			3203,
			"FSR 0536"
		],
		[
			26.586,
			61.212,
			2950,
			"NGC 663"
		],
		[
			26.008,
			61.883,
			3125,
			"NGC 654"
		],
		[
			28.094,
			61.857,
			5285,
			"IC 166"
		],
		[
			28.546,
			62.366,
			2863,
			"Berkeley 7"
		],
		[
			28.194,
			63.066,
			1248,
			"COIN-Gaia 32"
		],
		[
			26.928,
			62.935,
			7079,
			"Berkeley 5"
		],
		[
			25.775,
			64.038,
			2503,
			"NGC 637"
		],
		[
			22.387,
			63.301,
			2884,
			"NGC 559"
		],
		[
			21.485,
			63.011,
			3756,
			"FSR 0542"
		],
		[
			24.102,
			64.54,
			5023,
			"NGC 609"
		],
		[
			25.226,
			64.521,
			2974,
			"FSR 0553"
		],
		[
			24.938,
			64.878,
			976,
			"FSR 0551"
		],
		[
			37.305,
			61.787,
			3576,
			"Tombaugh 4"
		],
		[
			35.898,
			63.8,
			1021,
			"NGC 886"
		],
		[
			33.296,
			63.856,
			2846,
			"UBC 416"
		],
		[
			31.119,
			64.365,
			975,
			"Stock 5"
		],
		[
			34.858,
			63.718,
			5412,
			"Berkeley 63"
		],
		[
			32.546,
			65.42,
			3e3,
			"UBC 604"
		],
		[
			35.428,
			65.888,
			4775,
			"Berkeley 64"
		],
		[
			30.335,
			63.801,
			1536,
			"Gulliver 51"
		],
		[
			31.915,
			65.449,
			889,
			"UPK 265"
		],
		[
			30.191,
			67.799,
			2911,
			"FSR 0558"
		],
		[
			17.094,
			61.586,
			1172,
			"NGC 381"
		],
		[
			15.429,
			61.72,
			2650,
			"UBC 84"
		],
		[
			16.624,
			62.219,
			2677,
			"NGC 366"
		],
		[
			15.78,
			62.787,
			4415,
			"Czernik 3"
		],
		[
			15.309,
			63.918,
			2660,
			"Berkeley 62"
		],
		[
			12.987,
			63.785,
			3480,
			"UBC 412"
		],
		[
			10.63,
			64.056,
			2608,
			"Dias 1"
		],
		[
			10.915,
			64.172,
			2874,
			"King 16"
		],
		[
			11.291,
			64.391,
			3121,
			"Berkeley 4"
		],
		[
			20.774,
			64.54,
			3333,
			"UBC 600"
		],
		[
			11.933,
			66.769,
			658,
			"COIN-Gaia 1"
		],
		[
			12.04,
			67.199,
			2922,
			"Berkeley 61"
		],
		[
			14.604,
			68.458,
			2476,
			"Skiff J0058+68.4"
		],
		[
			5.352,
			65.495,
			758,
			"UPK 237"
		],
		[
			21.08,
			70.574,
			767,
			"COIN-Gaia 30"
		],
		[
			27.031,
			71.738,
			849,
			"Collinder 463"
		],
		[
			42.54,
			72.914,
			829,
			"UBC 415"
		],
		[
			37.868,
			72.346,
			859,
			"UBC 187"
		],
		[
			30.306,
			75.489,
			3339,
			"Berkeley 8"
		],
		[
			11.798,
			85.244,
			1698,
			"NGC 188"
		],
		[
			132.846,
			11.814,
			889,
			"NGC 2682"
		],
		[
			130.054,
			19.621,
			183,
			"NGC 2632"
		],
		[
			114.602,
			21.575,
			2587,
			"NGC 2420"
		],
		[
			103.823,
			29.745,
			1250,
			"FSR 0866"
		],
		[
			104.88,
			33.154,
			3116,
			"UBC 615"
		],
		[
			102.091,
			41.06,
			544,
			"NGC 2281"
		],
		[
			93.819,
			39.846,
			3589,
			"NGC 2192"
		],
		[
			101.689,
			48.688,
			463,
			"UPK 350"
		],
		[
			95.047,
			46.71,
			630,
			"ASCC 23"
		],
		[
			90.658,
			49.883,
			1304,
			"NGC 2126"
		],
		[
			305.39,
			13.509,
			666,
			"UPK 66"
		],
		[
			310.245,
			20.212,
			944,
			"UPK 84"
		],
		[
			309.476,
			21.462,
			279,
			"UPK 88"
		],
		[
			298.321,
			18.345,
			1898,
			"Harvard 20"
		],
		[
			297.833,
			18.661,
			2369,
			"Gulliver 55"
		],
		[
			299.695,
			20.509,
			1616,
			"Roslund 3"
		],
		[
			294.181,
			18.247,
			2371,
			"UBC 123"
		],
		[
			295.404,
			19.036,
			2621,
			"UBC 124"
		],
		[
			294.343,
			18.7,
			4303,
			"Teutsch 27"
		],
		[
			294.985,
			20.054,
			2482,
			"UBC 126"
		],
		[
			295.661,
			21.145,
			4610,
			"Czernik 40"
		],
		[
			297.22,
			21.213,
			5735,
			"NGC 6827"
		],
		[
			296.389,
			21.153,
			2068,
			"LP 321"
		],
		[
			297.959,
			22.107,
			1670,
			"LP 2123"
		],
		[
			297.164,
			21.987,
			870,
			"ASCC 107"
		],
		[
			297.718,
			23.101,
			2379,
			"NGC 6830"
		],
		[
			297.009,
			23.353,
			3594,
			"FSR 0154"
		],
		[
			303.989,
			21.447,
			922,
			"UPK 79"
		],
		[
			303.385,
			25.43,
			2800,
			"FSR 0166"
		],
		[
			304.778,
			27.618,
			950,
			"UPK 94"
		],
		[
			302.905,
			26.532,
			1595,
			"Gulliver 18"
		],
		[
			301.218,
			27.057,
			1773,
			"FSR 0167"
		],
		[
			303.694,
			28.355,
			1589,
			"UBC 133"
		],
		[
			303.436,
			29.672,
			1063,
			"Gulliver 60"
		],
		[
			310.875,
			23.871,
			544,
			"Alessi 12"
		],
		[
			312.427,
			25.488,
			763,
			"UPK 99"
		],
		[
			315.551,
			29.997,
			820,
			"UPK 108"
		],
		[
			308.626,
			28.278,
			1101,
			"NGC 6940"
		],
		[
			306.276,
			29.74,
			1902,
			"UBC 364"
		],
		[
			317.505,
			34.347,
			717,
			"UPK 113"
		],
		[
			313.576,
			35.686,
			1315,
			"UBC 141"
		],
		[
			310.856,
			37.031,
			2368,
			"Ruprecht 174"
		],
		[
			313.196,
			37.847,
			1198,
			"Roslund 7"
		],
		[
			315.745,
			40.433,
			6680,
			"Berkeley 54"
		],
		[
			339.03,
			39.621,
			472,
			"UBC 159"
		],
		[
			343.832,
			43.35,
			602,
			"UPK 168"
		],
		[
			354.175,
			48.205,
			402,
			"Aveni Hunter 1"
		],
		[
			325.52,
			37.584,
			871,
			"UBC 150"
		],
		[
			321.122,
			36.507,
			661,
			"NGC 7063"
		],
		[
			317.933,
			38.638,
			563,
			"ASCC 113"
		],
		[
			322.841,
			43.441,
			626,
			"UPK 136"
		],
		[
			319.391,
			41.835,
			9516,
			"Berkeley 56"
		],
		[
			316.524,
			41.498,
			1205,
			"NGC 7024"
		],
		[
			316.055,
			42.074,
			2124,
			"LP 876"
		],
		[
			318.284,
			42.494,
			3252,
			"NGC 7044"
		],
		[
			322.186,
			47.103,
			1339,
			"NGC 7082"
		],
		[
			320.862,
			46.385,
			2492,
			"NGC 7062"
		],
		[
			331.224,
			46.508,
			1154,
			"NGC 7209"
		],
		[
			330.72,
			49.114,
			1820,
			"UBC 383"
		],
		[
			322.889,
			48.247,
			311,
			"NGC 7092"
		],
		[
			325.001,
			49.305,
			2298,
			"UBC 382"
		],
		[
			328.682,
			49.748,
			1151,
			"UBC 157"
		],
		[
			327.716,
			51.374,
			1913,
			"UBC 160"
		],
		[
			329.28,
			51.558,
			731,
			"ASCC 115"
		],
		[
			328.718,
			52.821,
			2307,
			"UBC 384"
		],
		[
			339.203,
			46.927,
			658,
			"UPK 166"
		],
		[
			341.961,
			46.342,
			695,
			"Alessi 37"
		],
		[
			346.424,
			49.376,
			573,
			"UPK 185"
		],
		[
			337.143,
			49.814,
			559,
			"UPK 167"
		],
		[
			342.627,
			49.494,
			1347,
			"UBC 169"
		],
		[
			344.01,
			51.187,
			1493,
			"UBC 6"
		],
		[
			353.923,
			52.685,
			454,
			"Stock 12"
		],
		[
			-.666,
			56.726,
			2100,
			"NGC 7789"
		],
		[
			349.949,
			54.435,
			669,
			"ASCC 128"
		],
		[
			354.66,
			56.637,
			10519,
			"Berkeley 102"
		],
		[
			355.553,
			58.536,
			3009,
			"UBC 401"
		],
		[
			357.351,
			59.002,
			2145,
			"UBC 180"
		],
		[
			333.788,
			49.83,
			878,
			"NGC 7243"
		],
		[
			337,
			52.321,
			2365,
			"NGC 7296"
		],
		[
			337.723,
			53.951,
			4334,
			"FSR 0357"
		],
		[
			340.665,
			52.407,
			3519,
			"Berkeley 98"
		],
		[
			344.451,
			54.401,
			1334,
			"UBC 175"
		],
		[
			343.401,
			54.336,
			2467,
			"UBC 172"
		],
		[
			340.299,
			53.986,
			229,
			"ASCC 123"
		],
		[
			342.911,
			56.109,
			1920,
			"FSR 0384"
		],
		[
			341.704,
			56.408,
			3599,
			"UBC 173"
		],
		[
			332.625,
			52.858,
			3481,
			"IC 1434"
		],
		[
			332.209,
			53.001,
			3212,
			"UBC 592"
		],
		[
			331.931,
			53.104,
			2751,
			"FSR 0342"
		],
		[
			333.978,
			53.995,
			3386,
			"IC 1442"
		],
		[
			334.263,
			54.229,
			3132,
			"UBC 166"
		],
		[
			333.812,
			54.336,
			3210,
			"NGC 7245"
		],
		[
			333.877,
			54.405,
			5696,
			"King 9"
		],
		[
			332.605,
			55.398,
			4500,
			"NGC 7226"
		],
		[
			335.711,
			55.862,
			4097,
			"Berkeley 94"
		],
		[
			333.455,
			55.712,
			2227,
			"Teutsch 126"
		],
		[
			334.747,
			56.121,
			3450,
			"Teutsch 127"
		],
		[
			337.478,
			55.408,
			3573,
			"Berkeley 96"
		],
		[
			339.051,
			56.771,
			843,
			"UPK 180"
		],
		[
			341.388,
			57.382,
			3396,
			"UBC 174"
		],
		[
			343.055,
			58.289,
			3153,
			"King 18"
		],
		[
			341.817,
			58.125,
			3739,
			"NGC 7380"
		],
		[
			337.636,
			56.552,
			3616,
			"UBC 388"
		],
		[
			337.843,
			58.053,
			1392,
			"LP 1800"
		],
		[
			338.707,
			58.276,
			3888,
			"UBC 390"
		],
		[
			338.351,
			58.378,
			2114,
			"UBC 389"
		],
		[
			340.628,
			58.941,
			2165,
			"FSR 0385"
		],
		[
			339.853,
			59.005,
			3241,
			"Berkeley 97"
		],
		[
			338.939,
			59.051,
			2326,
			"UBC 391"
		],
		[
			345.615,
			56.953,
			3805,
			"UBC 393"
		],
		[
			345.532,
			57.063,
			4224,
			"UBC 176"
		],
		[
			345.63,
			57.199,
			2160,
			"UBC 395"
		],
		[
			343.789,
			57.096,
			3981,
			"NGC 7423"
		],
		[
			350.98,
			59.522,
			1182,
			"UBC 179"
		],
		[
			347.721,
			58.627,
			3571,
			"UBC 397"
		],
		[
			353.305,
			58.469,
			1949,
			"King 20"
		],
		[
			356.303,
			59.297,
			6060,
			"Berkeley 103"
		],
		[
			-.387,
			61.21,
			3303,
			"NGC 7790"
		],
		[
			357.955,
			60.916,
			3252,
			"FSR 0451"
		],
		[
			359.179,
			61.395,
			2974,
			"NGC 7788"
		],
		[
			359.482,
			61.449,
			4016,
			"UBC 594"
		],
		[
			354.506,
			60.541,
			3426,
			"SAI 149"
		],
		[
			352.553,
			60.257,
			2942,
			"Skiff J2330+60.2"
		],
		[
			353.077,
			61.032,
			3037,
			"UBC 400"
		],
		[
			356.818,
			60.902,
			3217,
			"FSR 0448"
		],
		[
			358.265,
			61.953,
			3126,
			"King 12"
		],
		[
			359.831,
			62.45,
			3927,
			"UBC 595"
		],
		[
			357.222,
			62.187,
			2597,
			"UBC 403"
		],
		[
			358.532,
			62.557,
			4233,
			"UBC 405"
		],
		[
			343.748,
			59.17,
			3931,
			"King 10"
		],
		[
			343.738,
			59.247,
			958,
			"UBC 394"
		],
		[
			344.19,
			59.363,
			416,
			"RSG 7"
		],
		[
			344.983,
			59.371,
			431,
			"RSG 8"
		],
		[
			345.245,
			59.698,
			3908,
			"FSR 0401"
		],
		[
			348.806,
			60.448,
			3198,
			"Markarian 50"
		],
		[
			347.053,
			60.523,
			2598,
			"King 19"
		],
		[
			347.767,
			60.579,
			2931,
			"NGC 7510"
		],
		[
			344.19,
			61.106,
			1732,
			"Gulliver 19"
		],
		[
			351.341,
			61.335,
			2954,
			"UBC 399"
		],
		[
			353.415,
			61.954,
			4399,
			"Czernik 44"
		],
		[
			351.195,
			61.59,
			1653,
			"NGC 7654"
		],
		[
			350.704,
			61.988,
			1613,
			"Gulliver 49"
		],
		[
			357.479,
			62.705,
			3005,
			"King 21"
		],
		[
			356.976,
			62.996,
			3453,
			"Teutsch 23"
		],
		[
			356.849,
			63.219,
			2879,
			"Negueruela 1"
		],
		[
			352.489,
			63.447,
			1712,
			"FSR 0442"
		],
		[
			351.485,
			63.781,
			6084,
			"Berkeley 100"
		],
		[
			353.213,
			64.209,
			4272,
			"Berkeley 101"
		],
		[
			292.651,
			20.262,
			2753,
			"NGC 6802"
		],
		[
			290.817,
			22.159,
			628,
			"NGC 6793"
		],
		[
			295.794,
			23.321,
			2330,
			"NGC 6823"
		],
		[
			296.261,
			23.977,
			2091,
			"Roslund 2"
		],
		[
			296.588,
			24.613,
			2228,
			"Dolidze 53"
		],
		[
			296.283,
			24.558,
			2994,
			"Gulliver 43"
		],
		[
			294.146,
			25.163,
			416,
			"Stock 1"
		],
		[
			288.881,
			22.968,
			1332,
			"UBC 125"
		],
		[
			291.664,
			25.008,
			1012,
			"NGC 6800"
		],
		[
			292.077,
			25.347,
			1438,
			"Gulliver 37"
		],
		[
			293.914,
			28.16,
			899,
			"UPK 80"
		],
		[
			297.754,
			25.29,
			2543,
			"Czernik 41"
		],
		[
			296.99,
			26.04,
			6131,
			"FSR 0158"
		],
		[
			298.285,
			26.379,
			554,
			"UPK 82"
		],
		[
			299.05,
			26.448,
			1208,
			"UBC 129"
		],
		[
			299.546,
			26.761,
			2429,
			"FSR 0165"
		],
		[
			295.548,
			27.366,
			567,
			"ASCC 105"
		],
		[
			296.297,
			28.16,
			6984,
			"Kronberger 4"
		],
		[
			298.06,
			27.437,
			2308,
			"UBC 130"
		],
		[
			299.271,
			28.445,
			2942,
			"UBC 132"
		],
		[
			298.052,
			29.399,
			3283,
			"NGC 6834"
		],
		[
			300.356,
			28.645,
			6663,
			"Berkeley 83"
		],
		[
			299.777,
			28.422,
			791,
			"UPK 90"
		],
		[
			301.199,
			29.196,
			2059,
			"Roslund 4"
		],
		[
			300.004,
			29.215,
			3372,
			"FSR 0172"
		],
		[
			300.324,
			29.971,
			692,
			"UPK 93"
		],
		[
			299.536,
			30.883,
			4997,
			"Kronberger 52"
		],
		[
			299.722,
			31.095,
			2370,
			"UBC 134"
		],
		[
			300.499,
			31.42,
			2680,
			"Kronberger 69"
		],
		[
			296.165,
			29.494,
			1774,
			"Turner 9"
		],
		[
			299.248,
			31.609,
			3118,
			"SAI 132"
		],
		[
			299.274,
			31.867,
			3429,
			"UBC 363"
		],
		[
			299.112,
			32.349,
			5321,
			"NGC 6846"
		],
		[
			299.824,
			33.724,
			4263,
			"UBC 135"
		],
		[
			294.091,
			35.742,
			509,
			"Teutsch 35"
		],
		[
			288.399,
			36.369,
			412,
			"ASCC 101"
		],
		[
			290.221,
			37.778,
			4231,
			"NGC 6791"
		],
		[
			304.49,
			32.582,
			1365,
			"UBC 136"
		],
		[
			301.607,
			33.015,
			4393,
			"UBC 578"
		],
		[
			302.641,
			33.751,
			546,
			"Roslund 5"
		],
		[
			303.314,
			34.364,
			2998,
			"UBC 365"
		],
		[
			307.059,
			35.103,
			4168,
			"Teutsch 28"
		],
		[
			305.886,
			36.099,
			1754,
			"UBC 371"
		],
		[
			306.929,
			36.074,
			1760,
			"Teutsch 30"
		],
		[
			306.874,
			37.665,
			1201,
			"UBC 373"
		],
		[
			300.742,
			33.528,
			1971,
			"ASCC 110"
		],
		[
			300.318,
			33.615,
			3454,
			"Toepler 1"
		],
		[
			300.808,
			34.435,
			2447,
			"Gulliver 38"
		],
		[
			301.131,
			35.237,
			2438,
			"UBC 137"
		],
		[
			300.598,
			35.31,
			1982,
			"Teutsch 8"
		],
		[
			302.505,
			34.967,
			3380,
			"Berkeley 50"
		],
		[
			302.283,
			35.488,
			1723,
			"Biurakan 2"
		],
		[
			302.888,
			35.603,
			3562,
			"Ruprecht 172"
		],
		[
			302.728,
			35.764,
			2095,
			"UBC 139"
		],
		[
			302.654,
			35.871,
			1631,
			"Gulliver 17"
		],
		[
			301.548,
			35.765,
			1720,
			"NGC 6871"
		],
		[
			302.847,
			36.512,
			2074,
			"UBC 368"
		],
		[
			302.357,
			36.47,
			2962,
			"UBC 367"
		],
		[
			299.872,
			34.643,
			3030,
			"Berkeley 49"
		],
		[
			300.614,
			35.681,
			2181,
			"FSR 0198"
		],
		[
			299.841,
			37.204,
			1797,
			"UBC 366"
		],
		[
			303.735,
			36.659,
			2943,
			"UBC 583"
		],
		[
			303.803,
			36.832,
			2086,
			"Dolidze 3"
		],
		[
			303.863,
			36.891,
			3099,
			"UBC 370"
		],
		[
			302.891,
			37.515,
			851,
			"ASCC 111"
		],
		[
			304.135,
			37.649,
			2043,
			"IC 4996"
		],
		[
			304.255,
			38.055,
			3424,
			"Gulliver 23"
		],
		[
			305.396,
			37.433,
			1644,
			"Berkeley 87"
		],
		[
			304.692,
			37.744,
			3526,
			"Berkeley 85"
		],
		[
			305.943,
			38.487,
			1608,
			"NGC 6913"
		],
		[
			305.698,
			38.939,
			1637,
			"UBC 374"
		],
		[
			304.417,
			38.03,
			3944,
			"Feibelman 1"
		],
		[
			305.084,
			38.688,
			1621,
			"Berkeley 86"
		],
		[
			305.025,
			39.331,
			2001,
			"Dolidze 5"
		],
		[
			302.375,
			38.291,
			3230,
			"UBC 372"
		],
		[
			301.912,
			38.232,
			2493,
			"Gulliver 31"
		],
		[
			304.574,
			40.063,
			1646,
			"UBC 375"
		],
		[
			304.534,
			40.732,
			1003,
			"Collinder 419"
		],
		[
			311.587,
			43.69,
			2735,
			"UBC 587"
		],
		[
			311.768,
			43.816,
			796,
			"UPK 126"
		],
		[
			307.185,
			39.798,
			375,
			"Roslund 6"
		],
		[
			307,
			40.548,
			1585,
			"UBC 585"
		],
		[
			305.797,
			40.771,
			1729,
			"NGC 6910"
		],
		[
			308.693,
			41.417,
			1526,
			"FSR 0238"
		],
		[
			305.829,
			41.701,
			1214,
			"Collinder 421"
		],
		[
			304.213,
			41.983,
			1674,
			"UBC 584"
		],
		[
			306.129,
			42.3,
			1053,
			"Dolidze 8"
		],
		[
			308.572,
			43.326,
			765,
			"UPK 119"
		],
		[
			311.555,
			45.417,
			1777,
			"UBC 588"
		],
		[
			307.515,
			45.921,
			1563,
			"LP 2253"
		],
		[
			307.511,
			46.161,
			2581,
			"UBC 376"
		],
		[
			309.732,
			46.464,
			2419,
			"UBC 148"
		],
		[
			309.368,
			46.467,
			2515,
			"UBC 146"
		],
		[
			308.819,
			46.843,
			3025,
			"Berkeley 90"
		],
		[
			308.317,
			47.147,
			2129,
			"UBC 147"
		],
		[
			299.833,
			38.551,
			1022,
			"UBC 582"
		],
		[
			295.611,
			38.645,
			2378,
			"Skiff J1942+38.6"
		],
		[
			298.306,
			39.349,
			1160,
			"ASCC 108"
		],
		[
			302.697,
			41.177,
			6167,
			"IC 1311"
		],
		[
			300.983,
			44.158,
			1406,
			"NGC 6866"
		],
		[
			295.327,
			40.19,
			2765,
			"NGC 6819"
		],
		[
			303.482,
			45.574,
			328,
			"RSG 5"
		],
		[
			306.114,
			46.048,
			3508,
			"Berkeley 89"
		],
		[
			299.689,
			45.553,
			1243,
			"UBC 143"
		],
		[
			300.763,
			46.196,
			2020,
			"FSR 0241"
		],
		[
			301.081,
			46.8,
			2578,
			"UBC 586"
		],
		[
			283.568,
			36.899,
			343,
			"Stephenson 1"
		],
		[
			294.34,
			46.378,
			1161,
			"NGC 6811"
		],
		[
			287.87,
			56.801,
			326,
			"UBC 1"
		],
		[
			315.428,
			44.114,
			4765,
			"Teutsch 22"
		],
		[
			315.517,
			45.391,
			964,
			"UPK 131"
		],
		[
			314.128,
			44.64,
			901,
			"NGC 6997"
		],
		[
			313.398,
			46.037,
			2195,
			"Barkhatova 1"
		],
		[
			313.673,
			45.996,
			2272,
			"Gulliver 30"
		],
		[
			314.906,
			45.861,
			2830,
			"UBC 377"
		],
		[
			316.243,
			46.271,
			3391,
			"UBC 153"
		],
		[
			314.171,
			46.902,
			4014,
			"FSR 0275"
		],
		[
			314.345,
			47.367,
			1367,
			"UBC 152"
		],
		[
			317.663,
			45.597,
			753,
			"NGC 7039"
		],
		[
			318.159,
			46.345,
			1113,
			"Gulliver 33"
		],
		[
			317.093,
			46.334,
			3323,
			"UBC 154"
		],
		[
			318.033,
			47.77,
			3301,
			"IC 1369"
		],
		[
			321.058,
			48.012,
			5269,
			"NGC 7067"
		],
		[
			315.95,
			47.215,
			5113,
			"Teutsch 156"
		],
		[
			317.71,
			47.705,
			1949,
			"UBC 380"
		],
		[
			317.711,
			48.543,
			6057,
			"Berkeley 91"
		],
		[
			315.572,
			48.096,
			4137,
			"FSR 0282"
		],
		[
			316.25,
			48.726,
			2164,
			"UBC 381"
		],
		[
			319.134,
			49.942,
			912,
			"UPK 143"
		],
		[
			318.413,
			50.134,
			1593,
			"UBC 155"
		],
		[
			312.253,
			46.47,
			2414,
			"UBC 149"
		],
		[
			311.961,
			47.432,
			1683,
			"UBC 151"
		],
		[
			313.621,
			47.4,
			577,
			"NGC 6991"
		],
		[
			313.824,
			47.579,
			3802,
			"UBC 590"
		],
		[
			313.264,
			48.538,
			2566,
			"UBC 379"
		],
		[
			311.56,
			48.828,
			1480,
			"UBC 378"
		],
		[
			314.141,
			49.362,
			3203,
			"FSR 0284"
		],
		[
			316.334,
			50.733,
			1042,
			"Gulliver 48"
		],
		[
			316.809,
			50.87,
			1443,
			"NGC 7031"
		],
		[
			313.975,
			51.06,
			3415,
			"Berkeley 53"
		],
		[
			321.715,
			49.114,
			2343,
			"UBC 156"
		],
		[
			320.976,
			49.925,
			3315,
			"FSR 0296"
		],
		[
			322.624,
			51.593,
			1677,
			"NGC 7086"
		],
		[
			320.438,
			50.595,
			2517,
			"Teutsch 144"
		],
		[
			320.448,
			50.822,
			350,
			"NGC 7058"
		],
		[
			319.232,
			51.762,
			2754,
			"Berkeley 55"
		],
		[
			322.129,
			51.69,
			2681,
			"FSR 0306"
		],
		[
			325.991,
			53.715,
			4199,
			"NGC 7128"
		],
		[
			327.751,
			52.982,
			2268,
			"UBC 162"
		],
		[
			327.711,
			55.243,
			2661,
			"FSR 0336"
		],
		[
			323.884,
			53.517,
			4045,
			"Kronberger 84"
		],
		[
			323.818,
			53.655,
			2169,
			"UBC 158"
		],
		[
			324.99,
			53.997,
			908,
			"ASCC 114"
		],
		[
			319.474,
			54.516,
			1031,
			"UPK 150"
		],
		[
			326.422,
			58.097,
			5221,
			"Teutsch 74"
		],
		[
			324.745,
			57.514,
			905,
			"IC 1396"
		],
		[
			321.206,
			57.528,
			7282,
			"Berkeley 92"
		],
		[
			307.761,
			51.021,
			1708,
			"FSR 0278"
		],
		[
			304.127,
			52.051,
			634,
			"Alessi Teutsch 11"
		],
		[
			306.015,
			54.152,
			809,
			"UPK 137"
		],
		[
			319.099,
			57.463,
			1312,
			"LP 2000"
		],
		[
			317.94,
			60.092,
			876,
			"UBC 385"
		],
		[
			319.784,
			61.952,
			1206,
			"UBC 386"
		],
		[
			311.731,
			60.867,
			838,
			"UPK 155"
		],
		[
			307.917,
			60.653,
			1815,
			"NGC 6939"
		],
		[
			330.44,
			54.815,
			4400,
			"FSR 0344"
		],
		[
			330.873,
			55.643,
			1527,
			"UBC 163"
		],
		[
			333.083,
			57.271,
			3951,
			"NGC 7235"
		],
		[
			332.43,
			57.549,
			928,
			"UBC 168"
		],
		[
			333.316,
			58.939,
			2112,
			"Teutsch 125"
		],
		[
			336.259,
			57.869,
			2250,
			"NGC 7281"
		],
		[
			335.056,
			58.128,
			3462,
			"NGC 7261"
		],
		[
			337.082,
			59.129,
			3907,
			"Berkeley 95"
		],
		[
			339.896,
			59.908,
			4422,
			"Czernik 42"
		],
		[
			334.479,
			60.071,
			962,
			"UPK 178"
		],
		[
			326.098,
			58.756,
			1519,
			"UBC 387"
		],
		[
			332.218,
			61.103,
			907,
			"Alessi Teutsch 5"
		],
		[
			326.718,
			59.915,
			904,
			"UPK 169"
		],
		[
			327.047,
			61.032,
			1006,
			"UBC 10b"
		],
		[
			328.448,
			62.589,
			903,
			"NGC 7160"
		],
		[
			334.695,
			63.251,
			981,
			"Pismis Moreno 1"
		],
		[
			339.135,
			64.153,
			917,
			"FSR 0398"
		],
		[
			336.125,
			64.926,
			965,
			"UBC 392"
		],
		[
			336.446,
			65.004,
			1003,
			"UPK 194"
		],
		[
			344.732,
			61.648,
			919,
			"UPK 201"
		],
		[
			346.201,
			63.36,
			947,
			"UBC 178"
		],
		[
			348.835,
			64.162,
			2636,
			"FSR 0430"
		],
		[
			347.205,
			64.974,
			376,
			"ASCC 127"
		],
		[
			351.854,
			65.31,
			873,
			"UPK 219"
		],
		[
			357.75,
			66.186,
			6873,
			"FSR 0465"
		],
		[
			350.955,
			66.505,
			990,
			"UPK 220"
		],
		[
			357.472,
			68.035,
			897,
			"NGC 7762"
		],
		[
			356.912,
			68.636,
			3097,
			"King 11"
		],
		[
			339.659,
			67.044,
			1149,
			"UBC 177"
		],
		[
			324.652,
			62.206,
			873,
			"UBC 10a"
		],
		[
			324.786,
			62.332,
			931,
			"UBC 167"
		],
		[
			326.29,
			65.782,
			2406,
			"NGC 7142"
		],
		[
			325.74,
			66.114,
			878,
			"NGC 7129"
		],
		[
			337.301,
			66.526,
			1021,
			"UBC 396"
		],
		[
			350.26,
			71.778,
			5105,
			"Berkeley 99"
		],
		[
			353.465,
			71.788,
			558,
			"UPK 230"
		],
		[
			.853,
			-29.958,
			240,
			"Blanco 1"
		],
		[
			97.395,
			-31.282,
			3719,
			"NGC 2243"
		],
		[
			100.025,
			-27.189,
			897,
			"vdBergh 83"
		],
		[
			102.252,
			-23.999,
			8304,
			"Berkeley 75"
		],
		[
			100.71,
			-23.7,
			1882,
			"UBC 451"
		],
		[
			101.499,
			-20.716,
			688,
			"NGC 2287"
		],
		[
			106.635,
			-23.534,
			2767,
			"UBC 225"
		],
		[
			105.773,
			-20.82,
			9316,
			"Tombaugh 2"
		],
		[
			106.626,
			-20.125,
			2198,
			"Ruprecht 10"
		],
		[
			109.85,
			-21.407,
			2653,
			"UBC 457"
		],
		[
			110.217,
			-20.78,
			3355,
			"UBC 456"
		],
		[
			109.924,
			-20.841,
			2207,
			"UBC 222"
		],
		[
			109.278,
			-20.661,
			3278,
			"UBC 454"
		],
		[
			109.524,
			-20.295,
			4501,
			"UBC 453"
		],
		[
			112.088,
			-19.679,
			2989,
			"FSR 1260"
		],
		[
			110.798,
			-19.48,
			3066,
			"Ruprecht 16"
		],
		[
			110.103,
			-19.353,
			3040,
			"UBC 450"
		],
		[
			111.185,
			-19.225,
			3389,
			"UBC 452"
		],
		[
			110.659,
			-18.703,
			3035,
			"FSR 1252"
		],
		[
			108.394,
			-19.495,
			965,
			"UPK 470"
		],
		[
			109.928,
			-18.975,
			2952,
			"UBC 634"
		],
		[
			105.126,
			-20.569,
			2554,
			"Tombaugh 1"
		],
		[
			106.06,
			-19.748,
			8984,
			"Auner 1"
		],
		[
			107.579,
			-18.434,
			3238,
			"DBSB 3"
		],
		[
			109.261,
			-17.143,
			908,
			"NGC 2358"
		],
		[
			107.389,
			-16.866,
			2042,
			"Haffner 23"
		],
		[
			106.512,
			-15.002,
			5051,
			"Haffner 4"
		],
		[
			93.882,
			-18.67,
			3991,
			"NGC 2204"
		],
		[
			100.317,
			-16.487,
			6780,
			"Berkeley 25"
		],
		[
			101.474,
			-16.733,
			6460,
			"Gaia 1"
		],
		[
			104.854,
			-13.822,
			1394,
			"NGC 2318"
		],
		[
			105.424,
			-13.539,
			2251,
			"Ruprecht 8"
		],
		[
			104.858,
			-13.254,
			1513,
			"Gulliver 13"
		],
		[
			104.456,
			-13.227,
			5851,
			"Berkeley 33"
		],
		[
			99.084,
			-14.157,
			1533,
			"Ruprecht 1"
		],
		[
			102.248,
			-10.524,
			4087,
			"Ruprecht 4"
		],
		[
			92.385,
			-15.03,
			663,
			"UPK 445"
		],
		[
			96.319,
			-10.551,
			961,
			"BDSB91"
		],
		[
			98.4,
			-11.549,
			622,
			"UPK 442"
		],
		[
			97.739,
			-9.625,
			910,
			"vdBergh 80"
		],
		[
			96.652,
			-9.643,
			3392,
			"NGC 2225"
		],
		[
			94.159,
			-8.945,
			911,
			"FSR 1117"
		],
		[
			95.199,
			-7.277,
			978,
			"NGC 2215"
		],
		[
			95.52,
			-6.321,
			6158,
			"Berkeley 73"
		],
		[
			83.81,
			-5.924,
			377,
			"NGC 1980"
		],
		[
			88.007,
			-7.543,
			295,
			"UPK 422"
		],
		[
			92.717,
			-6.213,
			815,
			"NGC 2183"
		],
		[
			91.69,
			-2,
			589,
			"NGC 2184"
		],
		[
			112.493,
			-19.102,
			3792,
			"DBSB 6"
		],
		[
			111.583,
			-18.433,
			4607,
			"FSR 1253"
		],
		[
			114.831,
			-16.55,
			1322,
			"NGC 2428"
		],
		[
			112.877,
			-17.229,
			1285,
			"Bochum 4"
		],
		[
			111.175,
			-17.001,
			2906,
			"Haffner 9"
		],
		[
			110.65,
			-17.174,
			3157,
			"UBC 220"
		],
		[
			112.824,
			-15.429,
			5629,
			"UBC 633"
		],
		[
			113.293,
			-15.449,
			5273,
			"NGC 2414"
		],
		[
			112.1,
			-15.385,
			3485,
			"Czernik 29"
		],
		[
			112.156,
			-15.364,
			3409,
			"Haffner 10"
		],
		[
			115.315,
			-16.279,
			1126,
			"Ruprecht 151"
		],
		[
			114.297,
			-15.681,
			2389,
			"UBC 221"
		],
		[
			114.271,
			-15.587,
			1078,
			"Ruprecht 26"
		],
		[
			115.445,
			-14.844,
			1511,
			"NGC 2437"
		],
		[
			114.577,
			-14.885,
			3576,
			"NGC 2425"
		],
		[
			114.147,
			-14.489,
			504,
			"NGC 2422"
		],
		[
			114.299,
			-13.863,
			943,
			"NGC 2423"
		],
		[
			115.22,
			-12.892,
			3171,
			"UBC 449"
		],
		[
			109.443,
			-15.631,
			1122,
			"NGC 2360"
		],
		[
			111.532,
			-15.09,
			3560,
			"Waterloo 7"
		],
		[
			109.296,
			-13.988,
			1363,
			"Basel 11a"
		],
		[
			111.016,
			-13.235,
			1212,
			"NGC 2374"
		],
		[
			109.998,
			-13.151,
			4466,
			"Haffner 6"
		],
		[
			109.105,
			-13.196,
			4360,
			"Berkeley 36"
		],
		[
			112.352,
			-13.968,
			4749,
			"NGC 2401"
		],
		[
			112.836,
			-12.699,
			2216,
			"UBC 630"
		],
		[
			114.383,
			-12.065,
			2139,
			"Melotte 71"
		],
		[
			110.777,
			-12.31,
			3009,
			"Haffner 8"
		],
		[
			111.984,
			-11.725,
			1453,
			"NGC 2396"
		],
		[
			110.203,
			-11.712,
			636,
			"UPK 452"
		],
		[
			112.796,
			-9.945,
			6647,
			"Czernik 30"
		],
		[
			118.411,
			-13.511,
			862,
			"UPK 468"
		],
		[
			121.237,
			-11.42,
			579,
			"UPK 467"
		],
		[
			120.01,
			-10.773,
			3191,
			"NGC 2506"
		],
		[
			114.618,
			-10.698,
			2684,
			"Melotte 72"
		],
		[
			115.336,
			-9.607,
			3311,
			"FSR 1211"
		],
		[
			106.941,
			-14.145,
			9682,
			"FSR 1212"
		],
		[
			106.785,
			-13.827,
			5467,
			"FSR 1209"
		],
		[
			106.883,
			-13.328,
			2513,
			"FSR 1207"
		],
		[
			107.075,
			-13.199,
			2663,
			"NGC 2345"
		],
		[
			106.332,
			-12.327,
			1144,
			"BDSB96"
		],
		[
			106.038,
			-11.475,
			1193,
			"vdBergh 92"
		],
		[
			106.672,
			-11.735,
			4746,
			"Berkeley 76"
		],
		[
			107.029,
			-10.619,
			1088,
			"NGC 2343"
		],
		[
			106.69,
			-10.023,
			1661,
			"NGC 2335"
		],
		[
			108.641,
			-10.257,
			1220,
			"NGC 2353"
		],
		[
			108.357,
			-9.884,
			2201,
			"FSR 1183"
		],
		[
			108.897,
			-9.453,
			2686,
			"FSR 1180"
		],
		[
			107.69,
			-9.363,
			587,
			"Alessi 21"
		],
		[
			103.909,
			-11.035,
			2526,
			"FSR 1172"
		],
		[
			104.81,
			-9.078,
			2345,
			"FSR 1163"
		],
		[
			105.144,
			-8.861,
			2480,
			"Ivanov 4"
		],
		[
			104.297,
			-8.202,
			1196,
			"BDSB93"
		],
		[
			106.514,
			-9.163,
			2704,
			"UBC 218"
		],
		[
			106.389,
			-9.026,
			2673,
			"UBC 447"
		],
		[
			106.873,
			-8.879,
			3110,
			"FSR 1170"
		],
		[
			105.684,
			-8.365,
			983,
			"NGC 2323"
		],
		[
			108.501,
			-6.563,
			2751,
			"UBC 445"
		],
		[
			106.146,
			-6.621,
			3507,
			"FSR 1150"
		],
		[
			105.311,
			-6.837,
			1084,
			"UBC 444"
		],
		[
			107.153,
			-6.212,
			4853,
			"UBC 628"
		],
		[
			106.027,
			-6.133,
			2511,
			"Haffner 3"
		],
		[
			113.508,
			-8.089,
			3144,
			"UBC 448"
		],
		[
			116.702,
			-4.665,
			3968,
			"Berkeley 39"
		],
		[
			108.213,
			-4.692,
			2630,
			"UBC 217"
		],
		[
			110.362,
			-3.234,
			3617,
			"Berkeley 77"
		],
		[
			123.412,
			-5.726,
			772,
			"NGC 2548"
		],
		[
			121.07,
			-3.797,
			2998,
			"UBC 629"
		],
		[
			120.007,
			1.469,
			2651,
			"UBC 627"
		],
		[
			116.674,
			.137,
			300,
			"ASCC 41"
		],
		[
			120.914,
			3.54,
			629,
			"UBC 13"
		],
		[
			100.18,
			-8.126,
			845,
			"UPK 436"
		],
		[
			104.02,
			-7.18,
			2431,
			"NGC 2309"
		],
		[
			102.977,
			-7.086,
			1258,
			"NGC 2302"
		],
		[
			100.431,
			-5.789,
			1209,
			"UBC 216"
		],
		[
			104.298,
			-6.628,
			1808,
			"FSR 1144"
		],
		[
			104.271,
			-6.23,
			1067,
			"ASCC 30"
		],
		[
			103.455,
			-5.729,
			787,
			"UPK 433"
		],
		[
			105.86,
			-5.021,
			2238,
			"Bochum 3"
		],
		[
			104.455,
			-4.616,
			2003,
			"NGC 2311"
		],
		[
			102.619,
			-5.444,
			6699,
			"FSR 1125"
		],
		[
			98.638,
			-6.818,
			3171,
			"UBC 443"
		],
		[
			100.461,
			-5.243,
			1419,
			"UBC 215"
		],
		[
			100.581,
			-4.624,
			4182,
			"UBC 442"
		],
		[
			96.888,
			-4.749,
			315,
			"NGC 2232"
		],
		[
			97.754,
			-4.183,
			7087,
			"Czernik 26"
		],
		[
			101.916,
			-3.167,
			2286,
			"NGC 2286"
		],
		[
			99.998,
			-3.613,
			1991,
			"UBC 441"
		],
		[
			102.845,
			-1.801,
			2371,
			"LP 930"
		],
		[
			100.957,
			-.886,
			2798,
			"UBC 212"
		],
		[
			101.181,
			-.532,
			6783,
			"Patchick 90"
		],
		[
			108.234,
			-2.635,
			765,
			"UPK 431"
		],
		[
			106.476,
			-2.304,
			4141,
			"UBC 626"
		],
		[
			105.689,
			-2.117,
			2756,
			"UBC 214"
		],
		[
			107.3,
			-1.502,
			3767,
			"FSR 1113"
		],
		[
			105.619,
			-1.12,
			2953,
			"Alessi 60"
		],
		[
			110.075,
			-1.002,
			4185,
			"Berkeley 37"
		],
		[
			110.459,
			-.988,
			3136,
			"King 23"
		],
		[
			108.961,
			-.875,
			904,
			"UPK 429"
		],
		[
			107.932,
			.827,
			1930,
			"Gulliver 47"
		],
		[
			103.571,
			-1.67,
			1057,
			"ASCC 29"
		],
		[
			105.097,
			-.239,
			7609,
			"Berkeley 34"
		],
		[
			103.29,
			-.192,
			1565,
			"FSR 1085"
		],
		[
			102.943,
			.465,
			857,
			"NGC 2301"
		],
		[
			106.033,
			1.046,
			4214,
			"NGC 2324"
		],
		[
			107.491,
			2.734,
			4745,
			"Berkeley 35"
		],
		[
			95.274,
			-3.431,
			1533,
			"LP 658"
		],
		[
			99.452,
			-.874,
			4900,
			"Berkeley 24"
		],
		[
			97.675,
			-1.413,
			2321,
			"UBC 210"
		],
		[
			98.654,
			-.265,
			2379,
			"FSR 1063"
		],
		[
			93.646,
			.637,
			820,
			"Ferrero 11"
		],
		[
			93.351,
			1.431,
			1807,
			"UBC 206"
		],
		[
			97.923,
			2.501,
			1443,
			"UBC 620"
		],
		[
			101.718,
			1.32,
			1690,
			"vdBergh 85"
		],
		[
			100.984,
			1.404,
			5220,
			"Teutsch 13"
		],
		[
			99.905,
			1.147,
			3552,
			"NGC 2262"
		],
		[
			101.659,
			1.776,
			1956,
			"Collinder 115"
		],
		[
			100.767,
			1.672,
			6338,
			"Alessi 15"
		],
		[
			103.028,
			2.922,
			4789,
			"Berkeley 28"
		],
		[
			99.677,
			2.069,
			2183,
			"Collinder 110"
		],
		[
			99.275,
			3.078,
			1946,
			"vdBergh 1"
		],
		[
			104.617,
			3.104,
			3332,
			"Gulliver 45"
		],
		[
			104.438,
			3.229,
			5383,
			"Berkeley 30"
		],
		[
			103.046,
			3.662,
			2479,
			"FSR 1051"
		],
		[
			102.837,
			5.772,
			4835,
			"Berkeley 27"
		],
		[
			104.53,
			6.433,
			3072,
			"Berkeley 32"
		],
		[
			100.818,
			4.628,
			2187,
			"NGC 2269"
		],
		[
			99.203,
			4.972,
			1666,
			"Collinder 107"
		],
		[
			98.045,
			4.914,
			1478,
			"NGC 2244"
		],
		[
			99.278,
			6.002,
			1505,
			"Collinder 106"
		],
		[
			102.62,
			6.612,
			6136,
			"FSR 1025"
		],
		[
			110.503,
			3.557,
			4884,
			"FSR 1083"
		],
		[
			110.913,
			5.37,
			4125,
			"Berkeley 78"
		],
		[
			107.506,
			4.667,
			1204,
			"LP 2198"
		],
		[
			112.48,
			5.605,
			922,
			"UPK 418"
		],
		[
			113.09,
			6.015,
			3158,
			"UBC 440"
		],
		[
			119.227,
			7.984,
			2563,
			"UBC 624"
		],
		[
			118.391,
			7.739,
			2623,
			"UBC 623"
		],
		[
			105.83,
			6.382,
			4313,
			"Czernik 27"
		],
		[
			111.743,
			9.299,
			3287,
			"UBC 622"
		],
		[
			104.406,
			8.285,
			7177,
			"Berkeley 31"
		],
		[
			111.692,
			13.116,
			3179,
			"UBC 619"
		],
		[
			109.247,
			13.772,
			1941,
			"NGC 2355"
		],
		[
			83.815,
			-4.819,
			407,
			"NGC 1977"
		],
		[
			83.848,
			-4.486,
			378,
			"UBC 207"
		],
		[
			83.422,
			-1.671,
			352,
			"UBC 17a"
		],
		[
			83.278,
			-1.652,
			403,
			"Gulliver 6"
		],
		[
			83.195,
			-1.585,
			408,
			"UBC 17b"
		],
		[
			88.452,
			.403,
			1148,
			"NGC 2112"
		],
		[
			81.982,
			-1.987,
			346,
			"ASCC 19"
		],
		[
			83.152,
			.185,
			8728,
			"Berkeley 20"
		],
		[
			81.198,
			1.655,
			344,
			"ASCC 16"
		],
		[
			82.179,
			3.527,
			341,
			"ASCC 21"
		],
		[
			78.808,
			6.291,
			795,
			"UPK 394"
		],
		[
			72.198,
			10.882,
			428,
			"NGC 1662"
		],
		[
			67.447,
			16.948,
			47,
			"Melotte 25"
		],
		[
			92.291,
			4.573,
			4009,
			"Dias 2"
		],
		[
			93.031,
			5.453,
			2251,
			"NGC 2186"
		],
		[
			92.953,
			7.02,
			2139,
			"FSR 0985"
		],
		[
			87.515,
			2.822,
			433,
			"UPK 402"
		],
		[
			89.618,
			7.763,
			6225,
			"Berkeley 22"
		],
		[
			97.416,
			6.834,
			2429,
			"NGC 2236"
		],
		[
			97.864,
			6.804,
			5733,
			"Juchert 18"
		],
		[
			97.561,
			7.335,
			2105,
			"UBC 83"
		],
		[
			96.241,
			7.617,
			5004,
			"UBC 618"
		],
		[
			93.432,
			6.953,
			2167,
			"Czernik 25"
		],
		[
			95.878,
			8.369,
			2336,
			"UBC 82"
		],
		[
			98.383,
			7.478,
			1693,
			"Gulliver 32"
		],
		[
			98.949,
			7.671,
			2617,
			"NGC 2254"
		],
		[
			98.55,
			8.005,
			1510,
			"Basel 8"
		],
		[
			98.68,
			8.337,
			1519,
			"NGC 2251"
		],
		[
			100.217,
			9.877,
			707,
			"NGC 2264"
		],
		[
			99.126,
			9.465,
			3047,
			"Trumpler 5"
		],
		[
			97.352,
			9.18,
			5736,
			"Alessi 53"
		],
		[
			97.788,
			9.894,
			659,
			"Collinder 95"
		],
		[
			99.633,
			10.885,
			3005,
			"NGC 2259"
		],
		[
			97.814,
			11.081,
			2969,
			"FSR 0979"
		],
		[
			94.739,
			10.121,
			2392,
			"UBC 617"
		],
		[
			91.613,
			8.745,
			2085,
			"UBC 80"
		],
		[
			92.843,
			11.863,
			2662,
			"FSR 0968"
		],
		[
			96.333,
			11.159,
			1600,
			"COIN-Gaia 28"
		],
		[
			94.541,
			10.752,
			3056,
			"UBC 439"
		],
		[
			97.974,
			11.865,
			2185,
			"FSR 0977"
		],
		[
			96.428,
			13.611,
			3865,
			"Teutsch 12"
		],
		[
			85.994,
			7.021,
			448,
			"UPK 398"
		],
		[
			87.17,
			7.374,
			2498,
			"Collinder 74"
		],
		[
			83.792,
			9.813,
			416,
			"Collinder 69"
		],
		[
			90.734,
			10.451,
			5183,
			"NGC 2141"
		],
		[
			93.44,
			12.813,
			3498,
			"NGC 2194"
		],
		[
			93.691,
			12.87,
			3500,
			"Skiff J0614+12.9"
		],
		[
			94.762,
			14.15,
			2567,
			"FSR 0953"
		],
		[
			93.425,
			15.006,
			7693,
			"FSR 0937"
		],
		[
			91.487,
			13.667,
			3409,
			"FSR 0942"
		],
		[
			92.125,
			13.951,
			1072,
			"NGC 2169"
		],
		[
			91.087,
			14.573,
			2340,
			"FSR 0932"
		],
		[
			93.356,
			15.938,
			1703,
			"UBC 201"
		],
		[
			85.76,
			13.743,
			1173,
			"COIN-Gaia 27"
		],
		[
			91.295,
			16.684,
			3260,
			"FSR 0921"
		],
		[
			92.644,
			16.971,
			1667,
			"FSR 0923"
		],
		[
			89.19,
			16.997,
			1674,
			"UBC 77"
		],
		[
			88.994,
			17.328,
			1729,
			"UBC 76"
		],
		[
			89.835,
			19.026,
			1988,
			"COIN-Gaia 41"
		],
		[
			102.371,
			12.045,
			4607,
			"UBC 204"
		],
		[
			98.156,
			12.553,
			3893,
			"FSR 0974"
		],
		[
			96.352,
			13.878,
			6309,
			"Teutsch 11"
		],
		[
			97.208,
			14.921,
			2913,
			"UBC 90"
		],
		[
			97.793,
			15.059,
			3092,
			"UBC 203"
		],
		[
			103.268,
			16.93,
			12604,
			"Berkeley 29"
		],
		[
			103.802,
			17.984,
			3843,
			"NGC 2304"
		],
		[
			106.99,
			19.939,
			2817,
			"UBC 616"
		],
		[
			95.573,
			14.65,
			1757,
			"FSR 0951"
		],
		[
			96.48,
			15.859,
			4098,
			"FSR 0948"
		],
		[
			94.851,
			15.287,
			3605,
			"UBC 438"
		],
		[
			95.445,
			15.776,
			4359,
			"FSR 0941"
		],
		[
			94.829,
			18.546,
			1502,
			"Skiff J0619+18.5"
		],
		[
			98.778,
			17.74,
			2577,
			"FSR 0935"
		],
		[
			98.318,
			20.535,
			5425,
			"Berkeley 23"
		],
		[
			91.774,
			19.021,
			2311,
			"FSR 0904"
		],
		[
			91.691,
			20.276,
			824,
			"COIN-Gaia 25"
		],
		[
			92.719,
			20.617,
			1883,
			"Pismis 27"
		],
		[
			93.454,
			21.608,
			2328,
			"FSR 0893"
		],
		[
			95.461,
			22.419,
			2570,
			"UBC 74"
		],
		[
			98.442,
			22.312,
			1424,
			"FSR 0905"
		],
		[
			100.832,
			26.976,
			3251,
			"NGC 2266"
		],
		[
			75.647,
			13.02,
			321,
			"UPK 385"
		],
		[
			78.139,
			16.696,
			1799,
			"NGC 1817"
		],
		[
			76.912,
			17.585,
			2663,
			"UBC 200"
		],
		[
			83.771,
			15.721,
			1442,
			"COIN-Gaia 26"
		],
		[
			71.481,
			19.079,
			635,
			"NGC 1647"
		],
		[
			75.926,
			23.695,
			727,
			"NGC 1750"
		],
		[
			76.175,
			23.813,
			885,
			"NGC 1758"
		],
		[
			88.848,
			20.876,
			3981,
			"Czernik 24"
		],
		[
			91.094,
			22.037,
			3030,
			"FSR 0883"
		],
		[
			89.547,
			21.965,
			1793,
			"Basel 11b"
		],
		[
			89.533,
			22.036,
			1978,
			"UBC 437"
		],
		[
			87.93,
			21.812,
			6417,
			"Berkeley 21"
		],
		[
			87.559,
			22.247,
			5470,
			"Berkeley 72"
		],
		[
			90.693,
			23.203,
			1030,
			"COIN-Gaia 24"
		],
		[
			90.275,
			23.328,
			2056,
			"NGC 2129"
		],
		[
			91.862,
			24.099,
			4298,
			"NGC 2158"
		],
		[
			91.183,
			24.091,
			2020,
			"IC 2157"
		],
		[
			92.197,
			24.281,
			2382,
			"Kharchenko 1"
		],
		[
			92.272,
			24.336,
			906,
			"NGC 2168"
		],
		[
			92.499,
			24.567,
			3780,
			"Koposov 63"
		],
		[
			92.221,
			26.264,
			5143,
			"Koposov 53"
		],
		[
			88.363,
			25.19,
			3307,
			"FSR 0852"
		],
		[
			86.257,
			24.74,
			2232,
			"FSR 0850"
		],
		[
			87.449,
			27.008,
			937,
			"COIN-Gaia 23"
		],
		[
			90.682,
			25.519,
			3268,
			"UBC 435"
		],
		[
			90.986,
			26.651,
			1912,
			"UBC 72"
		],
		[
			91.045,
			28.05,
			5133,
			"UBC 434"
		],
		[
			88.463,
			26.834,
			4673,
			"Teutsch 51"
		],
		[
			94.897,
			26.234,
			3217,
			"UBC 436"
		],
		[
			95.38,
			26.909,
			2074,
			"Gulliver 56"
		],
		[
			95.381,
			26.913,
			2146,
			"UBC 73"
		],
		[
			95.506,
			29.107,
			712,
			"UPK 381"
		],
		[
			94.071,
			30.794,
			772,
			"UPK 379"
		],
		[
			91.32,
			30.827,
			4836,
			"FSR 0833"
		],
		[
			92.335,
			31.228,
			4591,
			"DC 8"
		],
		[
			84.766,
			28.402,
			1406,
			"COIN-Gaia 21"
		],
		[
			87.696,
			28.724,
			4786,
			"UBC 433"
		],
		[
			87.525,
			28.898,
			3968,
			"Czernik 23"
		],
		[
			86.096,
			28.828,
			3450,
			"Teutsch 10"
		],
		[
			88.079,
			29.901,
			4662,
			"Koposov 43"
		],
		[
			85.765,
			28.989,
			4812,
			"FSR 0826"
		],
		[
			87.242,
			30.19,
			3322,
			"Basel 4"
		],
		[
			81.014,
			29.575,
			6568,
			"Berkeley 19"
		],
		[
			80.099,
			30.241,
			1844,
			"UBC 614"
		],
		[
			80.13,
			30.574,
			3341,
			"Berkeley 17"
		],
		[
			84.218,
			31.21,
			1864,
			"Koposov 36"
		],
		[
			85.233,
			32.272,
			3598,
			"Berkeley 71"
		],
		[
			84.871,
			33.347,
			5318,
			"Teutsch 1"
		],
		[
			84.084,
			34.135,
			1162,
			"NGC 1960"
		],
		[
			91.06,
			31.602,
			1987,
			"COIN-Gaia 22"
		],
		[
			88.074,
			32.545,
			1432,
			"NGC 2099"
		],
		[
			90.245,
			35.287,
			2461,
			"Koposov 12"
		],
		[
			94.105,
			36.377,
			3094,
			"FSR 0811"
		],
		[
			91.18,
			36.784,
			2366,
			"UBC 68"
		],
		[
			87.324,
			33.633,
			5517,
			"King 8"
		],
		[
			86.861,
			35.427,
			2992,
			"Koposov 10"
		],
		[
			186.014,
			25.652,
			85,
			"Melotte 111"
		],
		[
			269.182,
			-35.298,
			1346,
			"Trumpler 30"
		],
		[
			268.447,
			-34.841,
			285,
			"NGC 6475"
		],
		[
			266.063,
			-34.879,
			1772,
			"Ruprecht 128"
		],
		[
			267.408,
			-34.816,
			1942,
			"NGC 6444"
		],
		[
			275.063,
			-32.338,
			875,
			"Ferrero 1"
		],
		[
			264.399,
			-35.013,
			2519,
			"NGC 6396"
		],
		[
			264.777,
			-34.874,
			557,
			"ASCC 90"
		],
		[
			263.999,
			-34.645,
			2396,
			"UBC 564"
		],
		[
			263.783,
			-34.306,
			3274,
			"Ruprecht 126"
		],
		[
			264.004,
			-33.908,
			2299,
			"UBC 565"
		],
		[
			264.916,
			-33.224,
			2500,
			"NGC 6404"
		],
		[
			265.069,
			-32.242,
			459,
			"NGC 6405"
		],
		[
			266.014,
			-32.344,
			1020,
			"NGC 6416"
		],
		[
			263.673,
			-32.573,
			1117,
			"NGC 6383"
		],
		[
			262.462,
			-32.541,
			1056,
			"Antalova 2"
		],
		[
			262.951,
			-31.915,
			2545,
			"UBC 568"
		],
		[
			264.231,
			-32.469,
			1397,
			"Trumpler 28"
		],
		[
			266.733,
			-31.507,
			976,
			"NGC 6425"
		],
		[
			267.675,
			-30.206,
			2777,
			"NGC 6451"
		],
		[
			268.184,
			-29.537,
			2252,
			"Ruprecht 134"
		],
		[
			265.57,
			-30.731,
			1695,
			"UBC 334"
		],
		[
			266.9,
			-30.098,
			2345,
			"Ruprecht 130"
		],
		[
			267.346,
			-29.574,
			2599,
			"UBC 571"
		],
		[
			267.433,
			-28.761,
			2195,
			"UBC 91"
		],
		[
			266.582,
			-29.175,
			1866,
			"LP 1624"
		],
		[
			262.126,
			-29.487,
			1524,
			"Trumpler 26"
		],
		[
			270.856,
			-27.884,
			1663,
			"NGC 6520"
		],
		[
			268.32,
			-27.373,
			2314,
			"Czernik 37"
		],
		[
			269.883,
			-26.655,
			2370,
			"UBC 92"
		],
		[
			269.984,
			-24.665,
			2732,
			"Ruprecht 138"
		],
		[
			271.722,
			-24.649,
			1659,
			"UBC 337"
		],
		[
			271.535,
			-24.233,
			1600,
			"UBC 338"
		],
		[
			268.575,
			-25.399,
			2432,
			"UBC 93"
		],
		[
			269.643,
			-24.646,
			1276,
			"UBC 94"
		],
		[
			271.308,
			-23.308,
			2346,
			"UBC 339"
		],
		[
			270.774,
			-22.649,
			1383,
			"UBC 340"
		],
		[
			271.036,
			-22.505,
			1165,
			"NGC 6531"
		],
		[
			270.56,
			-21.922,
			2666,
			"ESO 589 26"
		],
		[
			268.277,
			-22.3,
			1710,
			"NGC 6469"
		],
		[
			268.252,
			-22.171,
			2101,
			"UBC 95"
		],
		[
			281.361,
			-23.764,
			829,
			"UPK 4"
		],
		[
			280.417,
			-21.959,
			1527,
			"UBC 572"
		],
		[
			288.805,
			-22.143,
			628,
			"UPK 12"
		],
		[
			283.616,
			-19.888,
			702,
			"NGC 6716"
		],
		[
			283.092,
			-20.229,
			700,
			"Collinder 394"
		],
		[
			282.636,
			-18.27,
			629,
			"Ruprecht 145"
		],
		[
			273.962,
			-22.143,
			2053,
			"NGC 6583"
		],
		[
			279.263,
			-19.139,
			598,
			"ASCC 97"
		],
		[
			277.937,
			-19.114,
			698,
			"IC 4725"
		],
		[
			276.159,
			-19.711,
			1455,
			"Trumpler 33"
		],
		[
			273.192,
			-21.612,
			1079,
			"NGC 6568"
		],
		[
			274.385,
			-19.707,
			1303,
			"Dias 5"
		],
		[
			274.393,
			-18.875,
			1719,
			"Turner 3"
		],
		[
			273.819,
			-18.997,
			1802,
			"Markarian 38"
		],
		[
			274.143,
			-18.309,
			2422,
			"Collinder 469"
		],
		[
			273.976,
			-18.099,
			2536,
			"LP 1218"
		],
		[
			273.304,
			-18.308,
			587,
			"UPK 5"
		],
		[
			274.616,
			-18.409,
			2727,
			"NGC 6603"
		],
		[
			276.781,
			-17.401,
			782,
			"UPK 7"
		],
		[
			278.158,
			-16.918,
			1810,
			"NGC 6645"
		],
		[
			276.464,
			-17.076,
			2005,
			"UBC 341"
		],
		[
			274.989,
			-17.089,
			1477,
			"NGC 6613"
		],
		[
			273.777,
			-16.314,
			1554,
			"UBC 96"
		],
		[
			274.782,
			-15.722,
			1377,
			"UBC 97"
		],
		[
			282.17,
			-18.488,
			285,
			"ASCC 99"
		],
		[
			282.007,
			-18.281,
			950,
			"UPK 13"
		],
		[
			280.763,
			-15.325,
			782,
			"UPK 18"
		],
		[
			282.895,
			-15.15,
			578,
			"UPK 21"
		],
		[
			278.012,
			-16.062,
			1522,
			"Ruprecht 171"
		],
		[
			279.741,
			-15.034,
			726,
			"UPK 17"
		],
		[
			281.145,
			-14.456,
			494,
			"UPK 20"
		],
		[
			279.312,
			-14.096,
			280,
			"UBC 32"
		],
		[
			276.989,
			-14.72,
			2229,
			"UBC 343"
		],
		[
			282.218,
			-12.879,
			972,
			"UPK 23"
		],
		[
			281.238,
			-11.127,
			1429,
			"UBC 100"
		],
		[
			269.237,
			-18.987,
			742,
			"NGC 6494"
		],
		[
			272.659,
			-16.74,
			1480,
			"NGC 6561"
		],
		[
			272.599,
			-16.723,
			2043,
			"Gulliver 15"
		],
		[
			273.914,
			-14.925,
			1585,
			"UBC 342"
		],
		[
			274.294,
			-13.349,
			1608,
			"Trumpler 32"
		],
		[
			269.511,
			-11.646,
			1054,
			"Ruprecht 135"
		],
		[
			267.698,
			-11.853,
			712,
			"Alessi 31"
		],
		[
			277.617,
			-12.33,
			2524,
			"Dias 6"
		],
		[
			278.174,
			-12.148,
			2764,
			"Ruprecht 143"
		],
		[
			276.79,
			-12.029,
			2676,
			"NGC 6631"
		],
		[
			276.005,
			-12.256,
			2005,
			"UBC 345"
		],
		[
			274.475,
			-12.083,
			1919,
			"UBC 344"
		],
		[
			276.722,
			-10.968,
			1443,
			"UBC 347"
		],
		[
			276.039,
			-10.623,
			1543,
			"UBC 346"
		],
		[
			278.437,
			-11.425,
			1591,
			"Ruprecht 144"
		],
		[
			278.359,
			-10.399,
			2124,
			"NGC 6649"
		],
		[
			276.335,
			-9.995,
			2159,
			"Ruprecht 170"
		],
		[
			279.125,
			-8.194,
			2110,
			"NGC 6664"
		],
		[
			275.017,
			-9.46,
			1728,
			"UBC 573"
		],
		[
			275.051,
			-5.167,
			924,
			"UPK 27"
		],
		[
			267.878,
			-2.779,
			599,
			"UPK 25"
		],
		[
			289.087,
			-16.333,
			323,
			"Ruprecht 147"
		],
		[
			301.233,
			-10.555,
			469,
			"Alessi 10"
		],
		[
			282.646,
			-10.788,
			502,
			"UPK 24"
		],
		[
			283.438,
			-9.847,
			855,
			"UPK 26"
		],
		[
			284.715,
			-8.953,
			1829,
			"NGC 6728"
		],
		[
			284.36,
			-8.936,
			1566,
			"UBC 350"
		],
		[
			285.913,
			-8.51,
			537,
			"UPK 31"
		],
		[
			292.631,
			-6.882,
			666,
			"UPK 40"
		],
		[
			293.908,
			-3.653,
			595,
			"UPK 42"
		],
		[
			288.853,
			-4.203,
			1026,
			"UBC 356"
		],
		[
			294.707,
			-1.363,
			693,
			"UPK 46"
		],
		[
			295.325,
			1.592,
			679,
			"Alessi 44"
		],
		[
			281.317,
			-9.386,
			1921,
			"NGC 6694"
		],
		[
			282.766,
			-6.272,
			2203,
			"NGC 6705"
		],
		[
			280.081,
			-7.027,
			2411,
			"UBC 349"
		],
		[
			280.613,
			-6.904,
			1877,
			"UBC 102"
		],
		[
			279.496,
			-7.135,
			2175,
			"UBC 101"
		],
		[
			280.633,
			-6.592,
			2984,
			"UBC 103"
		],
		[
			282.036,
			-5.876,
			1846,
			"Basel 1"
		],
		[
			280.692,
			-6.257,
			3028,
			"UBC 104"
		],
		[
			281.22,
			-5.849,
			3653,
			"UBC 352"
		],
		[
			281.611,
			-5.181,
			1585,
			"UBC 108"
		],
		[
			283.967,
			-5.094,
			1969,
			"LP 2068"
		],
		[
			282.687,
			-5.203,
			2040,
			"NGC 6704"
		],
		[
			281.846,
			-5.255,
			1998,
			"LP 1235"
		],
		[
			282.302,
			-4.466,
			1507,
			"LP 2117"
		],
		[
			282.378,
			-4.386,
			1869,
			"UBC 354"
		],
		[
			282.667,
			-4.158,
			3063,
			"FSR 0088"
		],
		[
			278.617,
			-5.47,
			681,
			"UPK 29"
		],
		[
			280.319,
			-5.427,
			2144,
			"UBC 105"
		],
		[
			280.475,
			-5.417,
			2353,
			"UBC 106"
		],
		[
			280.617,
			-5.249,
			3545,
			"Teutsch 145"
		],
		[
			279.769,
			-4.8,
			2501,
			"UBC 107"
		],
		[
			280.046,
			-4.333,
			523,
			"UPK 33"
		],
		[
			280.26,
			-4.054,
			2085,
			"Dolidze 32"
		],
		[
			277.352,
			-4.974,
			927,
			"UPK 28"
		],
		[
			280.741,
			-4.215,
			2784,
			"Trumpler 35"
		],
		[
			281.923,
			-3.817,
			1843,
			"UBC 355"
		],
		[
			280.854,
			-3.735,
			2179,
			"UBC 353"
		],
		[
			280.829,
			-1.654,
			601,
			"UPK 38"
		],
		[
			281.25,
			-1.146,
			2272,
			"Berkeley 79"
		],
		[
			285.138,
			-1.557,
			2487,
			"UBC 113"
		],
		[
			286.446,
			-.399,
			1517,
			"UBC 114"
		],
		[
			291.696,
			.212,
			897,
			"UPK 45"
		],
		[
			283.591,
			-1.214,
			2270,
			"Berkeley 80"
		],
		[
			285.155,
			-.498,
			2378,
			"NGC 6735"
		],
		[
			285.419,
			-.454,
			3313,
			"Berkeley 81"
		],
		[
			284.743,
			-.237,
			3100,
			"UBC 357"
		],
		[
			284.685,
			.433,
			1322,
			"UBC 576"
		],
		[
			286.942,
			4.224,
			2647,
			"NGC 6755"
		],
		[
			286.926,
			4.337,
			3265,
			"Czernik 39"
		],
		[
			282.451,
			4.965,
			2461,
			"Czernik 38"
		],
		[
			279.649,
			5.435,
			506,
			"IC 4756"
		],
		[
			282.104,
			8.714,
			2087,
			"LP 597"
		],
		[
			294.746,
			3.703,
			752,
			"UBC 14"
		],
		[
			287.181,
			4.711,
			3166,
			"NGC 6756"
		],
		[
			296.812,
			10.428,
			769,
			"UPK 55"
		],
		[
			290.628,
			8.41,
			1659,
			"UBC 119"
		],
		[
			283.309,
			8.172,
			1003,
			"UPK 50"
		],
		[
			282.649,
			9.763,
			1512,
			"UBC 118"
		],
		[
			282.836,
			10.334,
			1041,
			"NGC 6709"
		],
		[
			284.793,
			10.342,
			2921,
			"UBC 359"
		],
		[
			287.911,
			12.037,
			3952,
			"FSR 0123"
		],
		[
			287.845,
			13.111,
			1365,
			"Berkeley 82"
		],
		[
			292.533,
			10.659,
			2777,
			"UBC 360"
		],
		[
			294.337,
			15.589,
			1137,
			"UBC 27"
		],
		[
			288.891,
			12.844,
			1607,
			"UBC 121"
		],
		[
			291.122,
			13.696,
			3089,
			"King 25"
		],
		[
			288.544,
			14.392,
			621,
			"UPK 53"
		],
		[
			290.003,
			15.159,
			1474,
			"UBC 361"
		],
		[
			289.778,
			15.716,
			3328,
			"Berkeley 45"
		],
		[
			292.237,
			14.882,
			2281,
			"King 26"
		],
		[
			292.127,
			17.362,
			2437,
			"Berkeley 47"
		],
		[
			293.559,
			18.059,
			634,
			"Gulliver 28"
		],
		[
			267.018,
			1.525,
			371,
			"Collinder 350"
		],
		[
			270.598,
			3.26,
			546,
			"Collinder 359"
		],
		[
			266.554,
			5.615,
			354,
			"IC 4665"
		],
		[
			276.845,
			6.615,
			424,
			"NGC 6633"
		],
		[
			273.736,
			11.082,
			429,
			"Gulliver 20"
		],
		[
			274.741,
			12.311,
			573,
			"Alessi 19"
		],
		[
			283.799,
			12.326,
			1704,
			"UBC 3"
		],
		[
			284.108,
			13.242,
			1148,
			"UBC 120"
		],
		[
			288.142,
			15.717,
			2671,
			"UBC 122"
		],
		[
			286.157,
			15.689,
			807,
			"UPK 54"
		],
		[
			289.313,
			19.55,
			2863,
			"Berkeley 44"
		],
		[
			284.026,
			21.597,
			650,
			"Alessi 62"
		],
		[
			285.37,
			22.02,
			582,
			"UBC 26"
		],
		[
			286.514,
			23.337,
			744,
			"UPK 65"
		],
		[
			282.158,
			22.091,
			1122,
			"UBC 577"
		],
		[
			276.544,
			26.432,
			353,
			"UBC 9"
		],
		[
			79.561,
			-68.294,
			427,
			"NGC 1901"
		],
		[
			51.762,
			-35.821,
			105,
			"Alessi 13"
		],
		[
			140.148,
			-69.885,
			572,
			"UBC 260"
		],
		[
			158.561,
			-73.324,
			1850,
			"UBC 514"
		],
		[
			156.138,
			-72.51,
			1840,
			"LP 5"
		],
		[
			179.651,
			-68.683,
			1366,
			"UBC 283"
		],
		[
			173.443,
			-66.087,
			1614,
			"UBC 279"
		],
		[
			161.029,
			-67.524,
			645,
			"UPK 567"
		],
		[
			160.535,
			-65.11,
			2027,
			"Melotte 101"
		],
		[
			160.613,
			-64.426,
			149,
			"IC 2602"
		],
		[
			167.723,
			-65.714,
			4136,
			"UBC 275"
		],
		[
			165.349,
			-63.655,
			3675,
			"UBC 268"
		],
		[
			167.32,
			-63.834,
			2850,
			"BH 111"
		],
		[
			169.92,
			-63.486,
			2346,
			"Melotte 105"
		],
		[
			166.769,
			-62.87,
			1828,
			"UBC 269"
		],
		[
			164.134,
			-63.018,
			3558,
			"Graham 1"
		],
		[
			163.234,
			-62.747,
			4395,
			"UBC 510"
		],
		[
			162.594,
			-61.437,
			4731,
			"UBC 507"
		],
		[
			151.935,
			-70.747,
			1273,
			"UBC 511"
		],
		[
			150.801,
			-64.755,
			12444,
			"ESO 092 05"
		],
		[
			147.281,
			-65.259,
			1732,
			"Ruprecht 84"
		],
		[
			156.274,
			-62.321,
			2108,
			"UBC 503"
		],
		[
			153.73,
			-64.611,
			9910,
			"ESO 092 18"
		],
		[
			152.4,
			-61.259,
			903,
			"Ruprecht 161"
		],
		[
			153.233,
			-60.885,
			1970,
			"LP 2059"
		],
		[
			159.233,
			-62.035,
			3399,
			"UBC 506"
		],
		[
			160.819,
			-61.081,
			424,
			"Alessi 5"
		],
		[
			159.738,
			-61.099,
			4824,
			"UBC 504"
		],
		[
			160.562,
			-60.48,
			3356,
			"UBC 262"
		],
		[
			160.939,
			-60.107,
			3511,
			"UBC 505"
		],
		[
			159.52,
			-60.503,
			3953,
			"UBC 261"
		],
		[
			159.284,
			-59.875,
			4159,
			"UBC 654"
		],
		[
			159.583,
			-59.54,
			1767,
			"UBC 502"
		],
		[
			158.639,
			-59.752,
			2349,
			"UBC 499"
		],
		[
			156.635,
			-60.675,
			5469,
			"NGC 3255"
		],
		[
			155.952,
			-60.142,
			4612,
			"Trumpler 13"
		],
		[
			155.086,
			-59.657,
			2924,
			"UBC 498"
		],
		[
			157.621,
			-60.078,
			2377,
			"UBC 259"
		],
		[
			155.685,
			-59.51,
			5241,
			"SAI 113"
		],
		[
			156.429,
			-57.922,
			2457,
			"Collinder 220"
		],
		[
			151.248,
			-61.619,
			3578,
			"Trumpler 11"
		],
		[
			151.621,
			-60.29,
			3307,
			"Trumpler 12"
		],
		[
			150.553,
			-60.041,
			1021,
			"NGC 3114"
		],
		[
			150.962,
			-59.232,
			4907,
			"DBSB 43"
		],
		[
			153.064,
			-58.069,
			2792,
			"BH 90"
		],
		[
			152.216,
			-57.288,
			5421,
			"FSR 1530"
		],
		[
			150.331,
			-58.218,
			4449,
			"BH 84"
		],
		[
			150.379,
			-58.198,
			2365,
			"Gulliver 35"
		],
		[
			148.852,
			-56.605,
			4933,
			"FSR 1521"
		],
		[
			151.148,
			-55.386,
			2121,
			"BH 87"
		],
		[
			150.36,
			-55.109,
			4803,
			"Ruprecht 85"
		],
		[
			150.169,
			-54.79,
			8071,
			"NGC 3105"
		],
		[
			119.527,
			-60.8,
			423,
			"NGC 2516"
		],
		[
			118.12,
			-60.373,
			962,
			"UBC 250"
		],
		[
			114.567,
			-58.609,
			360,
			"UPK 540"
		],
		[
			128.456,
			-61.463,
			890,
			"UBC 255"
		],
		[
			130.809,
			-58.629,
			346,
			"UPK 545"
		],
		[
			136.718,
			-58.685,
			134,
			"Platais 8"
		],
		[
			144.977,
			-57.294,
			3773,
			"UBC 495"
		],
		[
			143.863,
			-57.313,
			3524,
			"UBC 494"
		],
		[
			141.857,
			-57.004,
			1323,
			"IC 2488"
		],
		[
			141.18,
			-57.341,
			1772,
			"UBC 493"
		],
		[
			140.486,
			-56.314,
			3938,
			"Ruprecht 75"
		],
		[
			141.821,
			-55.119,
			4108,
			"Ruprecht 77"
		],
		[
			141.746,
			-55.127,
			5523,
			"Gulliver 7"
		],
		[
			147.145,
			-56.415,
			1784,
			"NGC 3033"
		],
		[
			148.412,
			-55.756,
			3907,
			"UBC 651"
		],
		[
			145.952,
			-56.574,
			5400,
			"BH 78"
		],
		[
			147.006,
			-55.073,
			4203,
			"FSR 1509"
		],
		[
			149.424,
			-54.612,
			4025,
			"Hogg 4"
		],
		[
			147.307,
			-54.611,
			3706,
			"Ruprecht 83"
		],
		[
			145.259,
			-53.846,
			3806,
			"Ruprecht 79"
		],
		[
			143.659,
			-54.375,
			1781,
			"UBC 254"
		],
		[
			146.088,
			-54.117,
			2716,
			"Gulliver 27"
		],
		[
			146.421,
			-54.004,
			2201,
			"Ruprecht 82"
		],
		[
			146.49,
			-52.49,
			1014,
			"UPK 549"
		],
		[
			144.729,
			-52.947,
			3606,
			"SAI 108"
		],
		[
			139.532,
			-56.015,
			1573,
			"UBC 253"
		],
		[
			141.314,
			-54.719,
			6301,
			"BH 66"
		],
		[
			139.157,
			-54.145,
			4503,
			"UBC 252"
		],
		[
			140.563,
			-53.872,
			2743,
			"UBC 490"
		],
		[
			139.767,
			-53.576,
			5400,
			"UBC 488"
		],
		[
			137.602,
			-53.884,
			1090,
			"ESO 166 04"
		],
		[
			136.943,
			-52.945,
			1938,
			"UBC 249"
		],
		[
			143.321,
			-53.413,
			738,
			"NGC 2925"
		],
		[
			142.838,
			-53.04,
			5844,
			"BH 72"
		],
		[
			142.884,
			-53.001,
			3755,
			"UBC 491"
		],
		[
			142.643,
			-52.913,
			1266,
			"NGC 2910"
		],
		[
			143.368,
			-52.381,
			4095,
			"Teutsch 66"
		],
		[
			141.158,
			-53.069,
			2792,
			"UBC 489"
		],
		[
			142.452,
			-50.697,
			2370,
			"FSR 1484"
		],
		[
			142.981,
			-50.225,
			6708,
			"BH 73"
		],
		[
			141.077,
			-51.651,
			1940,
			"Ruprecht 76"
		],
		[
			141.687,
			-51.273,
			8167,
			"BH 67"
		],
		[
			140.447,
			-51.252,
			1865,
			"UBC 251"
		],
		[
			140.526,
			-51.1,
			2926,
			"NGC 2866"
		],
		[
			139.691,
			-51.6,
			1826,
			"UBC 487"
		],
		[
			139.738,
			-50.555,
			1483,
			"UBC 486"
		],
		[
			134.258,
			-54.303,
			808,
			"UPK 542"
		],
		[
			131.611,
			-52.931,
			1096,
			"NGC 2669"
		],
		[
			130.292,
			-52.991,
			148,
			"IC 2391"
		],
		[
			126.57,
			-52.113,
			628,
			"UPK 537"
		],
		[
			127.025,
			-50.899,
			320,
			"UPK 535"
		],
		[
			126.678,
			-50.729,
			1152,
			"UBC 247"
		],
		[
			129.243,
			-50.045,
			3434,
			"SAI 91"
		],
		[
			132.897,
			-50.253,
			5313,
			"ESO 211 03"
		],
		[
			135.119,
			-48.984,
			2394,
			"Collinder 205"
		],
		[
			138.974,
			-50.006,
			2807,
			"Pismis 11"
		],
		[
			141.203,
			-48.075,
			1403,
			"Gulliver 57"
		],
		[
			131.386,
			-48.801,
			1512,
			"NGC 2670"
		],
		[
			134.478,
			-47.761,
			1858,
			"Muzzio 1"
		],
		[
			133.332,
			-47.871,
			2300,
			"FSR 1452"
		],
		[
			130.531,
			-48.09,
			702,
			"IC 2395"
		],
		[
			130.667,
			-47.201,
			2788,
			"NGC 2660"
		],
		[
			129.88,
			-47.098,
			4338,
			"FSR 1441"
		],
		[
			132.316,
			-46.875,
			1844,
			"Ruprecht 71"
		],
		[
			131.171,
			-46.292,
			4592,
			"SAI 94"
		],
		[
			131.14,
			-45.951,
			2245,
			"UBC 482"
		],
		[
			132.626,
			-45.509,
			2135,
			"Gulliver 5"
		],
		[
			134.355,
			-43.181,
			840,
			"BH 56"
		],
		[
			178.121,
			-64.593,
			2417,
			"UBC 281"
		],
		[
			179.715,
			-64.581,
			506,
			"Ruprecht 98"
		],
		[
			176.771,
			-62.639,
			5384,
			"FSR 1595"
		],
		[
			175.925,
			-62.537,
			2396,
			"Stock 14"
		],
		[
			174.822,
			-63.44,
			2508,
			"IC 2948"
		],
		[
			174.661,
			-63.387,
			2413,
			"BH 121"
		],
		[
			172.772,
			-63.426,
			2244,
			"Ruprecht 94"
		],
		[
			174.061,
			-61.616,
			2123,
			"NGC 3766"
		],
		[
			171.342,
			-61.446,
			2599,
			"UBC 513"
		],
		[
			179.311,
			-62.968,
			3580,
			"UBC 515"
		],
		[
			179.369,
			-62.708,
			3890,
			"Ruprecht 97"
		],
		[
			177.923,
			-62.646,
			2350,
			"UBC 280"
		],
		[
			177.67,
			-62.14,
			3280,
			"Ruprecht 96"
		],
		[
			177.324,
			-62.226,
			4130,
			"SAI 116"
		],
		[
			175.495,
			-61.961,
			1733,
			"LP 2094"
		],
		[
			178.897,
			-61.532,
			4249,
			"UBC 662"
		],
		[
			175.28,
			-61.013,
			1999,
			"ASCC 67"
		],
		[
			172.616,
			-60.752,
			3916,
			"Ruprecht 164"
		],
		[
			172.884,
			-60.766,
			4166,
			"UBC 276"
		],
		[
			174.042,
			-59.46,
			1834,
			"UBC 277"
		],
		[
			172.769,
			-58.507,
			1734,
			"Loden 372"
		],
		[
			169.373,
			-62.719,
			1360,
			"IC 2714"
		],
		[
			168.099,
			-62.284,
			2513,
			"UBC 272"
		],
		[
			167.141,
			-60.741,
			3623,
			"Teutsch 143a"
		],
		[
			170.302,
			-60.568,
			2197,
			"UBC 273"
		],
		[
			168.262,
			-60.79,
			2638,
			"NGC 3590"
		],
		[
			167.826,
			-60.656,
			1523,
			"Trumpler 18"
		],
		[
			167.285,
			-60.687,
			2352,
			"UBC 659"
		],
		[
			167.64,
			-60.294,
			2455,
			"NGC 3572"
		],
		[
			168.369,
			-59.705,
			2077,
			"UBC 660"
		],
		[
			166.037,
			-61.372,
			2150,
			"Ruprecht 93"
		],
		[
			164.064,
			-61.089,
			3420,
			"UBC 509"
		],
		[
			166.386,
			-60.466,
			3488,
			"UBC 512"
		],
		[
			164.877,
			-60.335,
			2310,
			"NGC 3496"
		],
		[
			165.262,
			-60.233,
			6066,
			"Sher 1"
		],
		[
			163.166,
			-60.595,
			3e3,
			"UBC 264"
		],
		[
			164.106,
			-60.489,
			4581,
			"UBC 508"
		],
		[
			162.656,
			-59.992,
			2519,
			"UBC 263"
		],
		[
			163.209,
			-59.463,
			5857,
			"Teutsch 31"
		],
		[
			166.334,
			-59.759,
			2423,
			"UBC 266"
		],
		[
			164.836,
			-59.557,
			7184,
			"Teutsch 106"
		],
		[
			166.417,
			-58.707,
			498,
			"NGC 3532"
		],
		[
			164.108,
			-59.23,
			2709,
			"Trumpler 17"
		],
		[
			163.697,
			-58.05,
			2536,
			"Gulliver 39"
		],
		[
			169.813,
			-59.552,
			2543,
			"UBC 270"
		],
		[
			170.219,
			-59.302,
			2539,
			"LP 1540"
		],
		[
			168.283,
			-58.901,
			2421,
			"UBC 267"
		],
		[
			167.65,
			-59.047,
			2305,
			"Basel 17"
		],
		[
			170.765,
			-58.549,
			8807,
			"BH 118"
		],
		[
			168.623,
			-57.563,
			2509,
			"Trumpler 19"
		],
		[
			165.861,
			-56.978,
			802,
			"UPK 562"
		],
		[
			167.713,
			-56.821,
			1193,
			"LP 2238"
		],
		[
			177.644,
			-55.679,
			2345,
			"NGC 3960"
		],
		[
			168.367,
			-55.437,
			971,
			"ASCC 66"
		],
		[
			161.769,
			-60.096,
			2584,
			"Bochum 11"
		],
		[
			161.669,
			-59.508,
			2482,
			"Gulliver 52"
		],
		[
			161.253,
			-59.7,
			2107,
			"Trumpler 16"
		],
		[
			160.986,
			-59.553,
			2290,
			"Trumpler 14"
		],
		[
			161.177,
			-59.369,
			2599,
			"Trumpler 15"
		],
		[
			159.553,
			-59.168,
			467,
			"BH 99"
		],
		[
			160.101,
			-59,
			2510,
			"UBC 653"
		],
		[
			159.341,
			-58.615,
			2389,
			"NGC 3324"
		],
		[
			163.095,
			-58.394,
			1652,
			"Gulliver 40"
		],
		[
			161.964,
			-57.483,
			1070,
			"Ruprecht 91"
		],
		[
			161.024,
			-58.095,
			2764,
			"LP 403"
		],
		[
			161.582,
			-57.034,
			2731,
			"Gulliver 1"
		],
		[
			158.97,
			-58.231,
			2710,
			"NGC 3293"
		],
		[
			158.917,
			-57.615,
			2419,
			"UBC 258"
		],
		[
			156.867,
			-57.626,
			2535,
			"IC 2581"
		],
		[
			162.663,
			-55.845,
			2575,
			"UBC 500"
		],
		[
			162.381,
			-54.711,
			2542,
			"UBC 652"
		],
		[
			159.693,
			-54.247,
			1651,
			"UBC 496"
		],
		[
			159.659,
			-54.148,
			1716,
			"NGC 3330"
		],
		[
			154.779,
			-56.425,
			2384,
			"BH 92"
		],
		[
			153.657,
			-55.001,
			491,
			"ASCC 58"
		],
		[
			155.884,
			-54.667,
			1105,
			"Loden 46"
		],
		[
			155.347,
			-54.45,
			6962,
			"Teutsch 44"
		],
		[
			155.378,
			-51.814,
			498,
			"NGC 3228"
		],
		[
			158.509,
			-47.263,
			324,
			"UPK 552"
		],
		[
			158.037,
			-44.451,
			598,
			"UPK 560"
		],
		[
			171.392,
			-43.24,
			1072,
			"NGC 3680"
		],
		[
			145.902,
			-50.797,
			7159,
			"SAI 109"
		],
		[
			148.736,
			-50.951,
			2627,
			"UBC 492"
		],
		[
			150.469,
			-49.564,
			7481,
			"BH 85"
		],
		[
			145.058,
			-50.326,
			1986,
			"NGC 2972"
		],
		[
			145.123,
			-49.685,
			3053,
			"UBC 650"
		],
		[
			143.684,
			-48.04,
			2559,
			"Pismis 15"
		],
		[
			142.145,
			-46.607,
			2800,
			"Teutsch 103"
		],
		[
			140.007,
			-45.131,
			2107,
			"Pismis 12"
		],
		[
			139.241,
			-43.862,
			173,
			"Platais 9"
		],
		[
			137.032,
			-43.346,
			1013,
			"UPK 528"
		],
		[
			139.85,
			-40.52,
			5221,
			"NGC 2849"
		],
		[
			143.284,
			-36.358,
			435,
			"Turner 5"
		],
		[
			142.543,
			-34.136,
			5085,
			"UBC 648"
		],
		[
			142.445,
			-33.848,
			3455,
			"FSR 1407"
		],
		[
			115.198,
			-52.839,
			624,
			"UPK 526"
		],
		[
			118.228,
			-53.022,
			693,
			"Alessi Teutsch 3"
		],
		[
			105.304,
			-54.432,
			569,
			"UPK 524"
		],
		[
			111.573,
			-47.685,
			4830,
			"Melotte 66"
		],
		[
			109.275,
			-46.142,
			297,
			"Alessi 3"
		],
		[
			122.798,
			-52.529,
			344,
			"UPK 533"
		],
		[
			119.954,
			-50.636,
			481,
			"UBC 480"
		],
		[
			122.525,
			-49.198,
			396,
			"NGC 2547"
		],
		[
			128.169,
			-48.304,
			4009,
			"Ruprecht 63"
		],
		[
			126.998,
			-47.929,
			559,
			"Gulliver 9"
		],
		[
			124.711,
			-47.786,
			11165,
			"FSR 1419"
		],
		[
			126.105,
			-47.207,
			4322,
			"Ruprecht 60"
		],
		[
			116.643,
			-48.192,
			1494,
			"UBC 647"
		],
		[
			122.374,
			-47.335,
			330,
			"Pozzo 1"
		],
		[
			129.774,
			-46.235,
			1763,
			"NGC 2645"
		],
		[
			130.407,
			-46.272,
			1903,
			"Pismis 8"
		],
		[
			130.848,
			-45.788,
			1457,
			"LP 2219"
		],
		[
			130.634,
			-44.999,
			2095,
			"NGC 2659"
		],
		[
			130.734,
			-44.932,
			2120,
			"UBC 246"
		],
		[
			129.276,
			-45.245,
			2303,
			"UBC 245"
		],
		[
			128.79,
			-44.407,
			695,
			"Pismis 4"
		],
		[
			129.838,
			-44.041,
			2405,
			"Ruprecht 65"
		],
		[
			130.464,
			-43.363,
			1607,
			"Ruprecht 67"
		],
		[
			128.946,
			-43.61,
			4038,
			"BH 37"
		],
		[
			132.413,
			-44.353,
			2245,
			"BH 54"
		],
		[
			131.943,
			-42.566,
			427,
			"Trumpler 10"
		],
		[
			132.631,
			-41.738,
			917,
			"Alessi 43"
		],
		[
			133.864,
			-40.746,
			2044,
			"UBC 243"
		],
		[
			131.557,
			-41.886,
			1386,
			"NGC 2671"
		],
		[
			131.202,
			-41.28,
			955,
			"Collinder 197"
		],
		[
			130.571,
			-40.737,
			1574,
			"DBSB 21"
		],
		[
			127.45,
			-41.343,
			1349,
			"LP 2220"
		],
		[
			124.338,
			-42.582,
			1473,
			"UBC 479"
		],
		[
			124.477,
			-41.674,
			4066,
			"Pismis 2"
		],
		[
			126.722,
			-41.251,
			5859,
			"ESO 312 04"
		],
		[
			126.123,
			-41.287,
			4268,
			"ESO 312 03"
		],
		[
			126.366,
			-39.64,
			6433,
			"Saurer 2"
		],
		[
			129.407,
			-39.603,
			941,
			"Pismis 5"
		],
		[
			131.035,
			-39.352,
			2920,
			"FSR 1399"
		],
		[
			131.523,
			-38.025,
			671,
			"Teutsch 38"
		],
		[
			130.287,
			-38.699,
			4611,
			"Pismis 7"
		],
		[
			130.142,
			-38.071,
			3659,
			"Ruprecht 66"
		],
		[
			127.834,
			-38.64,
			2349,
			"Pismis 3"
		],
		[
			127.249,
			-38.095,
			1227,
			"Gulliver 44"
		],
		[
			119.399,
			-44.648,
			2859,
			"UBC 478"
		],
		[
			120.415,
			-41.596,
			5445,
			"ESO 311 21"
		],
		[
			120.304,
			-40.676,
			1578,
			"FSR 1378"
		],
		[
			115.736,
			-38.264,
			195,
			"NGC 2451A"
		],
		[
			116.128,
			-37.954,
			361,
			"NGC 2451B"
		],
		[
			118.046,
			-38.537,
			1442,
			"NGC 2477"
		],
		[
			117.656,
			-36.401,
			2721,
			"FSR 1361"
		],
		[
			122.764,
			-39.994,
			3245,
			"FSR 1380"
		],
		[
			123.09,
			-38.676,
			613,
			"Gulliver 10"
		],
		[
			122.164,
			-37.5,
			2747,
			"Gulliver 4"
		],
		[
			124.371,
			-37.798,
			715,
			"UPK 502"
		],
		[
			124.58,
			-37.102,
			5666,
			"Pismis 1"
		],
		[
			123.082,
			-37.661,
			934,
			"NGC 2546"
		],
		[
			122.883,
			-37.404,
			1375,
			"Gulliver 2"
		],
		[
			122.536,
			-37.244,
			4435,
			"Gulliver 3"
		],
		[
			123.449,
			-36.329,
			462,
			"BH 23"
		],
		[
			125.833,
			-36.349,
			1564,
			"Collinder 185"
		],
		[
			126.579,
			-33.835,
			4071,
			"UBC 476"
		],
		[
			122.055,
			-36.606,
			3630,
			"SAI 86"
		],
		[
			123.185,
			-35.111,
			1311,
			"Gulliver 36"
		],
		[
			121.787,
			-36.057,
			4736,
			"Teutsch 50"
		],
		[
			122.655,
			-34.616,
			3691,
			"FSR 1363"
		],
		[
			120.76,
			-35.07,
			1977,
			"UBC 472"
		],
		[
			120.392,
			-34.483,
			2386,
			"FSR 1360"
		],
		[
			124.111,
			-34.057,
			6358,
			"UBC 646"
		],
		[
			122.648,
			-34.297,
			4498,
			"UBC 473"
		],
		[
			122.523,
			-34.046,
			4086,
			"UBC 644"
		],
		[
			123.892,
			-33.904,
			2004,
			"UBC 475"
		],
		[
			123.855,
			-33.814,
			5034,
			"UBC 645"
		],
		[
			124.866,
			-33.216,
			4990,
			"UBC 474"
		],
		[
			125.797,
			-32.972,
			4673,
			"NGC 2588"
		],
		[
			121.561,
			-33.053,
			4389,
			"UBC 471"
		],
		[
			121.312,
			-33.036,
			2608,
			"UBC 240"
		],
		[
			121.768,
			-32.355,
			4563,
			"BH 19"
		],
		[
			122.844,
			-31.947,
			4858,
			"Ruprecht 54"
		],
		[
			123.71,
			-31.938,
			3218,
			"Ruprecht 58"
		],
		[
			123.911,
			-30.851,
			2788,
			"Haffner 26"
		],
		[
			123.763,
			-30.155,
			2147,
			"UBC 239"
		],
		[
			105.863,
			-40.886,
			660,
			"UPK 495"
		],
		[
			106.786,
			-37.729,
			276,
			"UBC 7"
		],
		[
			116.086,
			-34.628,
			2117,
			"ESO 368 11"
		],
		[
			116.614,
			-34.287,
			3643,
			"FSR 1352"
		],
		[
			114.683,
			-33.845,
			11751,
			"Arp Madore 2"
		],
		[
			109.362,
			-37.044,
			292,
			"Collinder 135"
		],
		[
			110.882,
			-31.966,
			388,
			"Collinder 140"
		],
		[
			119.487,
			-31.511,
			4384,
			"FSR 1342"
		],
		[
			117.053,
			-33.703,
			3492,
			"UBC 238"
		],
		[
			116.751,
			-32.959,
			4254,
			"ESO 368 14"
		],
		[
			116.38,
			-32.846,
			3811,
			"Haffner 15"
		],
		[
			116.589,
			-32.266,
			3251,
			"UBC 469"
		],
		[
			117.899,
			-31.812,
			3331,
			"Haffner 17"
		],
		[
			120.681,
			-32.045,
			3945,
			"Ruprecht 48"
		],
		[
			121.799,
			-30.88,
			4012,
			"UBC 470"
		],
		[
			120.57,
			-31.074,
			3720,
			"Ruprecht 47"
		],
		[
			120.872,
			-30.873,
			2157,
			"Ruprecht 50"
		],
		[
			121.773,
			-29.872,
			2631,
			"NGC 2533"
		],
		[
			119.061,
			-30.369,
			4341,
			"Haffner 20"
		],
		[
			119.064,
			-30.06,
			2276,
			"NGC 2489"
		],
		[
			118.572,
			-29.718,
			1789,
			"UBC 237"
		],
		[
			119.708,
			-28.558,
			5753,
			"Ruprecht 44"
		],
		[
			121.246,
			-28.122,
			664,
			"NGC 2527"
		],
		[
			120.586,
			-27.873,
			4692,
			"UBC 640"
		],
		[
			115.194,
			-31.694,
			3707,
			"NGC 2439"
		],
		[
			116.548,
			-31.278,
			3970,
			"Ruprecht 35"
		],
		[
			114.9,
			-30.933,
			4240,
			"Ruprecht 28"
		],
		[
			116.591,
			-30.762,
			4164,
			"UBC 468"
		],
		[
			117.653,
			-29.945,
			3356,
			"UBC 236"
		],
		[
			117.62,
			-29.853,
			4139,
			"Czernik 32"
		],
		[
			117.326,
			-29.349,
			1701,
			"UBC 235"
		],
		[
			115.209,
			-30.073,
			562,
			"Haffner 13"
		],
		[
			116.182,
			-28.384,
			4108,
			"Haffner 14"
		],
		[
			118.036,
			-28.12,
			4646,
			"SAI 81"
		],
		[
			120.288,
			-27.212,
			3143,
			"Haffner 21"
		],
		[
			118.61,
			-27.518,
			2889,
			"LP 947"
		],
		[
			118.443,
			-26.992,
			4322,
			"Ruprecht 41"
		],
		[
			116.894,
			-27.194,
			4486,
			"NGC 2453"
		],
		[
			117.159,
			-26.974,
			4458,
			"FSR 1315"
		],
		[
			116.362,
			-27.239,
			4609,
			"UBC 466"
		],
		[
			116.554,
			-26.202,
			2027,
			"UBC 463"
		],
		[
			118.168,
			-26.387,
			5083,
			"Haffner 18"
		],
		[
			118.193,
			-26.274,
			5472,
			"Haffner 19"
		],
		[
			119.407,
			-25.92,
			6560,
			"Ruprecht 42"
		],
		[
			118.911,
			-25.888,
			2554,
			"Trumpler 9"
		],
		[
			118.863,
			-25.412,
			4780,
			"UBC 465"
		],
		[
			117.096,
			-26.287,
			2706,
			"Ruprecht 36"
		],
		[
			117.586,
			-25.458,
			3244,
			"Haffner 16"
		],
		[
			110.734,
			-29.502,
			4350,
			"Haffner 7"
		],
		[
			108.485,
			-30.758,
			624,
			"Collinder 132"
		],
		[
			105.714,
			-26.512,
			805,
			"ASCC 32"
		],
		[
			106.961,
			-25.462,
			670,
			"Gulliver 21"
		],
		[
			112.783,
			-28.377,
			2395,
			"UBC 233"
		],
		[
			113.533,
			-28.127,
			3294,
			"UBC 464"
		],
		[
			113.855,
			-27.708,
			5605,
			"Haffner 11"
		],
		[
			114.423,
			-26.516,
			2063,
			"Ruprecht 27"
		],
		[
			114.295,
			-26.386,
			7199,
			"Alessi 18"
		],
		[
			111.16,
			-26.213,
			2655,
			"Ruprecht 18"
		],
		[
			115.551,
			-26.305,
			2896,
			"UBC 231"
		],
		[
			114.521,
			-25.378,
			1894,
			"UBC 230"
		],
		[
			116.034,
			-24.837,
			1128,
			"NGC 2448"
		],
		[
			115.279,
			-24.377,
			2020,
			"Ruprecht 29"
		],
		[
			116.141,
			-23.853,
			1018,
			"NGC 2447"
		],
		[
			114.192,
			-23.387,
			8740,
			"Ruprecht 25"
		],
		[
			109.671,
			-24.954,
			1341,
			"NGC 2362"
		],
		[
			109.992,
			-24.535,
			2330,
			"FSR 1284"
		],
		[
			108.503,
			-25.724,
			1370,
			"NGC 2354"
		],
		[
			109.493,
			-22.66,
			1692,
			"Haffner 5"
		],
		[
			111.849,
			-23.949,
			1712,
			"Trumpler 7"
		],
		[
			112.665,
			-23.383,
			2724,
			"Ruprecht 23"
		],
		[
			113.818,
			-21.318,
			2946,
			"UBC 460"
		],
		[
			111.48,
			-21.844,
			1409,
			"Ruprecht 19"
		],
		[
			110.031,
			-21.867,
			2276,
			"NGC 2367"
		],
		[
			111.174,
			-20.949,
			3456,
			"NGC 2383"
		],
		[
			112.176,
			-20.807,
			2318,
			"ESO 559 13"
		],
		[
			111.415,
			-20.903,
			2592,
			"UBC 224"
		],
		[
			112.127,
			-20.107,
			3213,
			"LP 198"
		],
		[
			136.441,
			-37.874,
			4373,
			"FSR 1402"
		],
		[
			134.042,
			-39.518,
			4783,
			"BH 55"
		],
		[
			139.044,
			-36.624,
			3085,
			"NGC 2818"
		],
		[
			135.775,
			-34.942,
			831,
			"UPK 508"
		],
		[
			133.248,
			-35.476,
			5832,
			"ESO 371 25"
		],
		[
			131.147,
			-35.9,
			3040,
			"Ruprecht 68"
		],
		[
			129.619,
			-34.777,
			5011,
			"NGC 2635"
		],
		[
			130.868,
			-32.662,
			4055,
			"NGC 2658"
		],
		[
			127.069,
			-31.007,
			4389,
			"UBC 241"
		],
		[
			129.309,
			-29.952,
			1837,
			"NGC 2627"
		],
		[
			124.645,
			-30.631,
			1726,
			"NGC 2567"
		],
		[
			125.371,
			-30.306,
			4154,
			"NGC 2580"
		],
		[
			125.861,
			-29.503,
			3206,
			"NGC 2587"
		],
		[
			124.723,
			-29.775,
			1329,
			"NGC 2571"
		],
		[
			123.012,
			-28.986,
			6961,
			"FSR 1335"
		],
		[
			123.108,
			-27.913,
			2802,
			"Haffner 22"
		],
		[
			123.177,
			-25.657,
			5122,
			"UBC 467"
		],
		[
			120.07,
			-24.269,
			3228,
			"UBC 232"
		],
		[
			118.829,
			-24.32,
			2852,
			"UBC 636"
		],
		[
			118.787,
			-24.263,
			1285,
			"NGC 2482"
		],
		[
			118.846,
			-24.033,
			3381,
			"UBC 462"
		],
		[
			119.21,
			-23.815,
			3210,
			"UBC 461"
		],
		[
			123.753,
			-22.201,
			6167,
			"UBC 638"
		],
		[
			123.755,
			-22.189,
			4684,
			"UBC 637"
		],
		[
			130.455,
			-20.747,
			919,
			"UBC 21"
		],
		[
			118.378,
			-22.392,
			2896,
			"UBC 228"
		],
		[
			119.27,
			-22.796,
			2554,
			"UBC 229"
		],
		[
			116.445,
			-21.915,
			2370,
			"Ruprecht 33"
		],
		[
			117.284,
			-21.298,
			3090,
			"NGC 2455"
		],
		[
			120.201,
			-19.056,
			2495,
			"NGC 2509"
		],
		[
			119.812,
			-19.126,
			3037,
			"LP 589"
		],
		[
			114.051,
			-20.627,
			2683,
			"NGC 2421"
		],
		[
			114.238,
			-20.515,
			3396,
			"Czernik 31"
		],
		[
			115.101,
			-19.743,
			2396,
			"UBC 459"
		],
		[
			116.478,
			-20.386,
			2525,
			"Ruprecht 34"
		],
		[
			113.661,
			-19.793,
			2978,
			"Teutsch 61"
		],
		[
			112.992,
			-19.416,
			3931,
			"Bochum 6"
		],
		[
			113.855,
			-18.677,
			2667,
			"DBSB 7"
		],
		[
			115.223,
			-19.078,
			1901,
			"NGC 2432"
		],
		[
			115.321,
			-18.699,
			3505,
			"UBC 458"
		],
		[
			115.386,
			-17.584,
			3527,
			"UBC 455"
		],
		[
			118.762,
			-17.732,
			1562,
			"NGC 2479"
		],
		[
			119.894,
			-16.292,
			4043,
			"Ruprecht 45"
		],
		[
			117.452,
			-17.249,
			4526,
			"Ruprecht 37"
		],
		[
			122.658,
			-12.834,
			1228,
			"NGC 2539"
		],
		[
			126.027,
			-8.405,
			461,
			"UBC 12"
		],
		[
			212.787,
			-75.872,
			705,
			"UPK 585"
		],
		[
			253.423,
			-67.788,
			242,
			"UPK 612"
		],
		[
			234.582,
			-65.957,
			734,
			"UPK 605"
		],
		[
			246.666,
			-59.936,
			444,
			"UBC 11"
		],
		[
			240.779,
			-60.43,
			750,
			"NGC 6025"
		],
		[
			237.41,
			-57.594,
			1777,
			"Collinder 292"
		],
		[
			244.721,
			-57.916,
			954,
			"NGC 6087"
		],
		[
			238.697,
			-57.868,
			1626,
			"UBC 534"
		],
		[
			238.955,
			-57.439,
			2383,
			"NGC 6005"
		],
		[
			239.415,
			-57.265,
			2747,
			"UBC 307"
		],
		[
			219.173,
			-67.975,
			936,
			"UPK 594"
		],
		[
			222.311,
			-66.465,
			438,
			"BH 164"
		],
		[
			220.058,
			-66.127,
			886,
			"Alessi 6"
		],
		[
			222.958,
			-65.308,
			1883,
			"UBC 300"
		],
		[
			207.058,
			-66.066,
			1752,
			"Collinder 277"
		],
		[
			204.529,
			-66.651,
			1687,
			"UBC 527"
		],
		[
			207.193,
			-64.68,
			2675,
			"NGC 5288"
		],
		[
			218.081,
			-62.222,
			2717,
			"UBC 297"
		],
		[
			211.837,
			-63.076,
			2691,
			"UBC 531"
		],
		[
			212.694,
			-62.331,
			1136,
			"ASCC 77"
		],
		[
			216.085,
			-61.328,
			970,
			"Lynga 2"
		],
		[
			216.202,
			-61.046,
			2016,
			"UBC 296"
		],
		[
			189.519,
			-68.377,
			2850,
			"Collinder 261"
		],
		[
			189.281,
			-67.203,
			655,
			"ASCC 73"
		],
		[
			199.543,
			-67.079,
			2633,
			"Collinder 268"
		],
		[
			200.992,
			-66.204,
			1702,
			"Collinder 269"
		],
		[
			198.808,
			-65.92,
			9649,
			"BH 144"
		],
		[
			199.937,
			-64.944,
			3464,
			"Ruprecht 107"
		],
		[
			185.033,
			-67.509,
			1269,
			"ASCC 71"
		],
		[
			186.083,
			-66.672,
			1866,
			"UBC 520"
		],
		[
			184.671,
			-65.42,
			1647,
			"UBC 285"
		],
		[
			187.466,
			-64.8,
			1804,
			"NGC 4463"
		],
		[
			191.63,
			-66.205,
			3337,
			"UBC 523"
		],
		[
			194.499,
			-64.96,
			3295,
			"NGC 4815"
		],
		[
			195.721,
			-64.6,
			2199,
			"Gulliver 59"
		],
		[
			199.091,
			-63.436,
			2944,
			"UBC 291"
		],
		[
			196.023,
			-63.941,
			2279,
			"UBC 525"
		],
		[
			205.811,
			-63.146,
			1829,
			"SAI 118"
		],
		[
			206.614,
			-62.916,
			1576,
			"NGC 5281"
		],
		[
			202.453,
			-64.199,
			2613,
			"Collinder 271"
		],
		[
			204.506,
			-63.346,
			5580,
			"BH 150"
		],
		[
			203.068,
			-62.787,
			1326,
			"Trumpler 21"
		],
		[
			206.147,
			-62.907,
			2080,
			"NGC 5269"
		],
		[
			205.412,
			-61.922,
			2875,
			"UBC 529"
		],
		[
			204.227,
			-62.091,
			2860,
			"Pismis 18"
		],
		[
			205.051,
			-61.731,
			4989,
			"BH 151"
		],
		[
			204.627,
			-61.607,
			3795,
			"UBC 528"
		],
		[
			209.994,
			-62.152,
			2242,
			"Lynga 1"
		],
		[
			208.516,
			-61.883,
			1450,
			"NGC 5316"
		],
		[
			207.554,
			-60.399,
			1717,
			"UBC 295"
		],
		[
			210.205,
			-59.578,
			2349,
			"NGC 5381"
		],
		[
			212.006,
			-59.786,
			688,
			"Loden 1194"
		],
		[
			201.967,
			-62.306,
			1863,
			"Basel 18"
		],
		[
			202.711,
			-61.775,
			3293,
			"UBC 293"
		],
		[
			199.664,
			-62.523,
			1969,
			"UBC 526"
		],
		[
			202.586,
			-61.319,
			2236,
			"Collinder 272"
		],
		[
			202.791,
			-60.945,
			2892,
			"NGC 5168"
		],
		[
			205.251,
			-60.203,
			2940,
			"FSR 1663"
		],
		[
			205.22,
			-59.271,
			240,
			"Platais 10"
		],
		[
			200.201,
			-61.258,
			2170,
			"UBC 292"
		],
		[
			201.829,
			-59.023,
			1827,
			"NGC 5138"
		],
		[
			203.002,
			-58.509,
			992,
			"Ruprecht 108"
		],
		[
			204.258,
			-58.073,
			1586,
			"UBC 294"
		],
		[
			224.256,
			-62.56,
			2733,
			"Ruprecht 112"
		],
		[
			226.476,
			-62.239,
			2035,
			"UBC 532"
		],
		[
			229.731,
			-60.798,
			825,
			"ASCC 79"
		],
		[
			227.612,
			-60.495,
			1992,
			"LP 2100"
		],
		[
			226.132,
			-60.862,
			2993,
			"UBC 664"
		],
		[
			219.644,
			-62.153,
			2739,
			"UBC 299"
		],
		[
			223.361,
			-60.478,
			2432,
			"Teutsch 80"
		],
		[
			218.459,
			-61.326,
			2277,
			"Hogg 17"
		],
		[
			217.783,
			-61.169,
			2439,
			"Trumpler 22"
		],
		[
			217.666,
			-60.889,
			3515,
			"Pismis 19"
		],
		[
			217.452,
			-60.719,
			2236,
			"NGC 5617"
		],
		[
			219.01,
			-59.975,
			1451,
			"Ruprecht 111"
		],
		[
			217.559,
			-59.815,
			2511,
			"UBC 298"
		],
		[
			221.22,
			-59.158,
			2420,
			"ESO 134 12"
		],
		[
			219.49,
			-58.996,
			1704,
			"UBC 301"
		],
		[
			220.859,
			-57.578,
			2117,
			"NGC 5715"
		],
		[
			224.4,
			-59.75,
			703,
			"UPK 604"
		],
		[
			225.058,
			-57.148,
			919,
			"UPK 607"
		],
		[
			226.365,
			-55.608,
			1906,
			"NGC 5823"
		],
		[
			235.462,
			-56.68,
			2929,
			"Lynga 5"
		],
		[
			237.584,
			-56.758,
			2862,
			"UBC 535"
		],
		[
			236.593,
			-56.792,
			2398,
			"UFMG 1"
		],
		[
			238.046,
			-56.482,
			2751,
			"NGC 5999"
		],
		[
			237.585,
			-55.961,
			2228,
			"UFMG 2"
		],
		[
			237.68,
			-55.632,
			1982,
			"UBC 536"
		],
		[
			238.115,
			-55.419,
			1949,
			"UFMG 3"
		],
		[
			237.093,
			-54.403,
			842,
			"UPK 621"
		],
		[
			234.809,
			-55.394,
			714,
			"UPK 617"
		],
		[
			231.847,
			-54.515,
			1404,
			"NGC 5925"
		],
		[
			231.204,
			-53.967,
			893,
			"UPK 614"
		],
		[
			230.274,
			-53.179,
			1226,
			"UBC 533"
		],
		[
			226.051,
			-54.366,
			854,
			"NGC 5822"
		],
		[
			232.408,
			-51.227,
			668,
			"Alessi 8"
		],
		[
			216.946,
			-59.632,
			2493,
			"NGC 5606"
		],
		[
			215.15,
			-58.858,
			1652,
			"Ruprecht 167"
		],
		[
			218.734,
			-56.64,
			761,
			"NGC 5662"
		],
		[
			221.85,
			-56.255,
			1726,
			"UBC 303"
		],
		[
			220.122,
			-55.385,
			1192,
			"UBC 302"
		],
		[
			222.204,
			-54.502,
			1122,
			"NGC 5749"
		],
		[
			216.419,
			-54.795,
			1029,
			"NGC 5593"
		],
		[
			223.389,
			-52.667,
			2002,
			"NGC 5764"
		],
		[
			222.716,
			-52.271,
			1756,
			"Hogg 18"
		],
		[
			226.276,
			-49.152,
			859,
			"UPK 613"
		],
		[
			260.764,
			-62.693,
			502,
			"Alessi 24"
		],
		[
			254.138,
			-60.422,
			317,
			"UPK 624"
		],
		[
			255.421,
			-58.981,
			641,
			"Alessi Teutsch 12"
		],
		[
			255.222,
			-55.976,
			945,
			"UPK 629"
		],
		[
			247.197,
			-54.963,
			1400,
			"LP 2210"
		],
		[
			252.336,
			-53.714,
			1215,
			"NGC 6208"
		],
		[
			244.859,
			-54.957,
			716,
			"Harvard 10"
		],
		[
			244.473,
			-53.527,
			2722,
			"UBC 310"
		],
		[
			243.299,
			-54.227,
			1881,
			"NGC 6067"
		],
		[
			240.397,
			-54.149,
			2278,
			"Moffat 1"
		],
		[
			241.907,
			-54.014,
			1702,
			"NGC 6031"
		],
		[
			242.896,
			-53.037,
			3316,
			"UBC 537"
		],
		[
			244.705,
			-52.88,
			4087,
			"LP 861"
		],
		[
			243.215,
			-52.393,
			2355,
			"Ruprecht 115"
		],
		[
			242.592,
			-52.339,
			2772,
			"UBC 538"
		],
		[
			245.354,
			-53.089,
			533,
			"UPK 627"
		],
		[
			245.888,
			-51.879,
			3294,
			"Ruprecht 117"
		],
		[
			246.139,
			-51.932,
			3231,
			"UBC 313"
		],
		[
			248.213,
			-52.629,
			1618,
			"NGC 6152"
		],
		[
			249.193,
			-51.304,
			892,
			"UPK 630"
		],
		[
			247.039,
			-51.5,
			2228,
			"Ruprecht 119"
		],
		[
			246.04,
			-51.151,
			2382,
			"ESO 226 06"
		],
		[
			243.758,
			-51.688,
			2828,
			"UBC 540"
		],
		[
			244.723,
			-51.594,
			4025,
			"UBC 666"
		],
		[
			243.053,
			-51.471,
			2404,
			"UBC 539"
		],
		[
			243.676,
			-51.332,
			2615,
			"Ruprecht 176"
		],
		[
			244.235,
			-50.721,
			2516,
			"UBC 312"
		],
		[
			243.386,
			-50.128,
			1646,
			"UBC 314"
		],
		[
			245.723,
			-50.172,
			2399,
			"LP 273"
		],
		[
			244.575,
			-49.487,
			1777,
			"UBC 542"
		],
		[
			254.778,
			-52.712,
			1653,
			"NGC 6253"
		],
		[
			255.997,
			-51.088,
			1078,
			"DBSB 104"
		],
		[
			255.999,
			-48.09,
			1308,
			"Harvard 13"
		],
		[
			253.687,
			-48.459,
			1796,
			"UBC 546"
		],
		[
			251.414,
			-47.747,
			2703,
			"Hogg 21"
		],
		[
			251.144,
			-47.577,
			2795,
			"UBC 318"
		],
		[
			251.64,
			-47.103,
			2726,
			"UBC 547"
		],
		[
			251.538,
			-47.027,
			1235,
			"NGC 6204"
		],
		[
			252.156,
			-46.965,
			2895,
			"UBC 549"
		],
		[
			251.81,
			-46.665,
			2378,
			"UBC 669"
		],
		[
			251.853,
			-45.555,
			829,
			"ASCC 85"
		],
		[
			248.792,
			-50.99,
			2099,
			"Collinder 307"
		],
		[
			248.662,
			-49.759,
			1336,
			"NGC 6167"
		],
		[
			247.236,
			-49.11,
			2558,
			"Hogg 19"
		],
		[
			248.527,
			-48.881,
			2575,
			"UBC 545"
		],
		[
			247.745,
			-48.386,
			2902,
			"UBC 667"
		],
		[
			250.319,
			-48.777,
			1264,
			"NGC 6193"
		],
		[
			248.751,
			-47.992,
			1697,
			"UBC 316"
		],
		[
			246.953,
			-49.161,
			1182,
			"NGC 6134"
		],
		[
			246.376,
			-47.935,
			2252,
			"UBC 315"
		],
		[
			245.17,
			-48.523,
			2525,
			"Lynga 9"
		],
		[
			250.674,
			-48.01,
			2693,
			"UBC 668"
		],
		[
			250.65,
			-47.894,
			2179,
			"UBC 317"
		],
		[
			250.436,
			-46.159,
			1974,
			"Ruprecht 121"
		],
		[
			250.353,
			-46.11,
			2379,
			"UBC 548"
		],
		[
			248.939,
			-45.635,
			913,
			"NGC 6178"
		],
		[
			249.699,
			-44.755,
			1329,
			"UBC 319"
		],
		[
			265.974,
			-47.028,
			215,
			"Alessi 9"
		],
		[
			261.212,
			-49.917,
			982,
			"IC 4651"
		],
		[
			259.625,
			-42.937,
			1377,
			"NGC 6322"
		],
		[
			263.081,
			-44.242,
			917,
			"UPK 642"
		],
		[
			259.305,
			-41.523,
			1740,
			"UBC 556"
		],
		[
			261.768,
			-39.405,
			2464,
			"LP 866"
		],
		[
			265.347,
			-40.158,
			1488,
			"Trumpler 29"
		],
		[
			262.776,
			-37.891,
			2440,
			"UBC 562"
		],
		[
			264.483,
			-37.657,
			643,
			"Collinder 338"
		],
		[
			265.062,
			-36.957,
			1200,
			"NGC 6400"
		],
		[
			264.462,
			-36.309,
			2298,
			"Ruprecht 127"
		],
		[
			255.195,
			-44.678,
			2314,
			"NGC 6259"
		],
		[
			254.497,
			-45.951,
			998,
			"NGC 6250"
		],
		[
			254.445,
			-44.815,
			1261,
			"NGC 6249"
		],
		[
			252.65,
			-45.07,
			2589,
			"UBC 550"
		],
		[
			252.335,
			-44.721,
			2578,
			"NGC 6216"
		],
		[
			252.484,
			-44.182,
			2314,
			"BH 200"
		],
		[
			255.213,
			-44.184,
			2780,
			"UBC 322"
		],
		[
			253.992,
			-43.207,
			2320,
			"UBC 671"
		],
		[
			256.976,
			-44.157,
			1982,
			"LP 145"
		],
		[
			256.09,
			-42.07,
			2446,
			"Teutsch 84"
		],
		[
			256.116,
			-41.67,
			1801,
			"UBC 554"
		],
		[
			256.582,
			-41.582,
			1667,
			"UBC 555"
		],
		[
			254.724,
			-42.06,
			2446,
			"UBC 552"
		],
		[
			253.545,
			-41.812,
			1475,
			"NGC 6231"
		],
		[
			255.535,
			-41.113,
			1903,
			"BH 211"
		],
		[
			255.524,
			-39.721,
			1684,
			"NGC 6268"
		],
		[
			256.181,
			-38.983,
			1617,
			"UBC 557"
		],
		[
			251.906,
			-44.536,
			2404,
			"UBC 321"
		],
		[
			251.403,
			-44.448,
			3099,
			"UBC 320"
		],
		[
			250.077,
			-43.355,
			1737,
			"NGC 6192"
		],
		[
			250.26,
			-39.494,
			174,
			"UPK 640"
		],
		[
			253.128,
			-41.525,
			1595,
			"UBC 672"
		],
		[
			253.51,
			-41.271,
			1583,
			"UBC 553"
		],
		[
			253.779,
			-40.947,
			1752,
			"BH 202"
		],
		[
			253.94,
			-40.729,
			1496,
			"UBC 323"
		],
		[
			254.053,
			-40.636,
			1604,
			"BH 205"
		],
		[
			253.878,
			-39.474,
			1246,
			"NGC 6242"
		],
		[
			259.071,
			-40.815,
			3106,
			"BH 217"
		],
		[
			259.353,
			-40.276,
			2833,
			"UBC 558"
		],
		[
			259.123,
			-39.699,
			2144,
			"UBC 559"
		],
		[
			259.044,
			-39.424,
			2213,
			"NGC 6318"
		],
		[
			261.125,
			-39.006,
			2130,
			"Trumpler 25"
		],
		[
			261.208,
			-37.497,
			1602,
			"UBC 561"
		],
		[
			262.781,
			-36.813,
			1591,
			"Harvard 16"
		],
		[
			259.928,
			-36.785,
			1247,
			"Gulliver 14"
		],
		[
			259.333,
			-35.529,
			1666,
			"Bochum 13"
		],
		[
			255.954,
			-38.465,
			1815,
			"UBC 324"
		],
		[
			256.179,
			-37.948,
			539,
			"NGC 6281"
		],
		[
			258.155,
			-36.056,
			1566,
			"UBC 326"
		],
		[
			256.886,
			-35.564,
			931,
			"ASCC 88"
		],
		[
			256.745,
			-35.205,
			1180,
			"Gulliver 29"
		],
		[
			254.821,
			-36.071,
			1445,
			"UBC 560"
		],
		[
			259.641,
			-32.334,
			1213,
			"BH 221"
		],
		[
			240.218,
			-53.539,
			2590,
			"Trumpler 23"
		],
		[
			241.218,
			-51.96,
			2422,
			"Lynga 6"
		],
		[
			242.167,
			-51.407,
			1992,
			"UBC 665"
		],
		[
			239.788,
			-50.381,
			507,
			"UPK 626"
		],
		[
			243.015,
			-50.188,
			2309,
			"UBC 541"
		],
		[
			242.631,
			-49.014,
			1871,
			"DBSB 101"
		],
		[
			238.548,
			-47.74,
			551,
			"UBC 5"
		],
		[
			238.769,
			-46.014,
			1496,
			"FSR 1723"
		],
		[
			246.332,
			-40.661,
			654,
			"NGC 6124"
		],
		[
			256.749,
			-30.673,
			1081,
			"UBC 563"
		],
		[
			255.658,
			-28.421,
			774,
			"ASCC 87"
		],
		[
			249.155,
			-31.418,
			743,
			"UPK 644"
		],
		[
			251.76,
			-25.81,
			1631,
			"ESO 518 03"
		],
		[
			187.576,
			-64.16,
			2594,
			"UBC 521"
		],
		[
			186.72,
			-64.058,
			2541,
			"BH 132"
		],
		[
			180.431,
			-64.099,
			3390,
			"Juchert 13"
		],
		[
			182.482,
			-63.791,
			2348,
			"UBC 517"
		],
		[
			184.283,
			-62.952,
			1865,
			"UBC 284"
		],
		[
			184.56,
			-62.969,
			3404,
			"UBC 518"
		],
		[
			182.398,
			-62.995,
			2809,
			"Ruprecht 101"
		],
		[
			183.393,
			-62.719,
			3126,
			"Ruprecht 102"
		],
		[
			187.364,
			-62.447,
			2291,
			"UBC 286"
		],
		[
			188.694,
			-61.592,
			2050,
			"Ruprecht 105"
		],
		[
			186.234,
			-61.973,
			4587,
			"Gulliver 46"
		],
		[
			186.048,
			-61.866,
			1920,
			"NGC 4349"
		],
		[
			190.906,
			-63.101,
			3020,
			"Hogg 15"
		],
		[
			190.582,
			-62.995,
			1419,
			"NGC 4609"
		],
		[
			191.515,
			-61.965,
			2478,
			"Gulliver 58"
		],
		[
			190.822,
			-61.627,
			2435,
			"UBC 522"
		],
		[
			192.623,
			-60.996,
			3046,
			"UBC 524"
		],
		[
			191.193,
			-61.154,
			2007,
			"UBC 289"
		],
		[
			189.765,
			-61.272,
			2352,
			"UBC 287"
		],
		[
			193.415,
			-60.371,
			1992,
			"NGC 4755"
		],
		[
			189.882,
			-60.637,
			3392,
			"Trumpler 20"
		],
		[
			191.949,
			-59.381,
			1605,
			"UBC 290"
		],
		[
			195.046,
			-59.607,
			1261,
			"NGC 4852"
		],
		[
			180.446,
			-63.23,
			2603,
			"NGC 4052"
		],
		[
			181.362,
			-62.678,
			1731,
			"Gulliver 50"
		],
		[
			181.52,
			-62.624,
			3373,
			"Ruprecht 100"
		],
		[
			182.541,
			-62.33,
			3186,
			"UBC 516"
		],
		[
			186.798,
			-60.767,
			1284,
			"Collinder 258"
		],
		[
			185.454,
			-60.4,
			2746,
			"UBC 519"
		],
		[
			187.119,
			-60.097,
			2011,
			"NGC 4439"
		],
		[
			181.628,
			-61.245,
			2060,
			"NGC 4103"
		],
		[
			181.174,
			-61.308,
			1722,
			"Gulliver 12"
		],
		[
			180.649,
			-60.935,
			989,
			"Alessi Teutsch 8"
		],
		[
			180.169,
			-60.504,
			3072,
			"UBC 282"
		],
		[
			185.782,
			-59.644,
			2420,
			"ESO 130 13"
		],
		[
			191.005,
			-58.096,
			1905,
			"LP 1994"
		],
		[
			192.965,
			-57.367,
			956,
			"UPK 578"
		],
		[
			181.97,
			-59.31,
			808,
			"ESO 130 06"
		],
		[
			182.619,
			-59.479,
			1342,
			"ESO 130 08"
		],
		[
			186.022,
			-58.125,
			2450,
			"NGC 4337"
		],
		[
			192.917,
			-50.541,
			702,
			"UPK 579"
		],
		[
			200.909,
			-49.907,
			900,
			"UPK 587"
		],
		[
			211.847,
			-48.285,
			725,
			"NGC 5460"
		],
		[
			205.84,
			-38.576,
			652,
			"UPK 599"
		],
		[
			276.635,
			-50.772,
			461,
			"Mamajek 4"
		],
		[
			270.167,
			-42.783,
			696,
			"UPK 645"
		],
		[
			277.329,
			-34.528,
			519,
			"UPK 654"
		],
		[
			314.073,
			-6.588,
			581,
			"UPK 51"
		]
	];
	CLUSTERS.forEach((c) => {
		c.oclu = true;
		c.ct = 0;
		c._dir = dirOf(c[0], c[1]);
		c.n = c[3];
		c.d = c[2];
	});
	const GLOBS = [
		[
			6.024,
			-72.081,
			4520,
			"NGC 104",
			1
		],
		[
			13.188,
			-26.583,
			8990,
			"NGC 288",
			1
		],
		[
			15.809,
			-70.849,
			8830,
			"NGC 362",
			1
		],
		[
			30.737,
			-3.253,
			30590,
			"Whiting 1",
			1
		],
		[
			48.068,
			-55.216,
			16400,
			"NGC 1261",
			1
		],
		[
			53.334,
			79.581,
			11180,
			"Pal 1",
			1
		],
		[
			58.76,
			-49.615,
			118910,
			"AM 1",
			1
		],
		[
			66.186,
			-21.187,
			84680,
			"Eridanus",
			1
		],
		[
			71.525,
			31.381,
			26170,
			"Pal 2",
			1
		],
		[
			78.528,
			-40.047,
			11950,
			"NGC 1851",
			1
		],
		[
			81.046,
			-24.524,
			13080,
			"NGC 1904",
			1
		],
		[
			102.248,
			-36.005,
			9830,
			"NGC 2298",
			1
		],
		[
			114.535,
			38.882,
			88470,
			"NGC 2419",
			1
		],
		[
			136.987,
			-37.227,
			36530,
			"Pyxis",
			1
		],
		[
			138.013,
			-64.863,
			10060,
			"NGC 2808",
			1
		],
		[
			140.238,
			-77.282,
			7880,
			"E 3",
			1
		],
		[
			151.382,
			.072,
			94840,
			"Pal 3",
			1
		],
		[
			154.403,
			-46.412,
			4740,
			"NGC 3201",
			1
		],
		[
			172.318,
			28.973,
			101390,
			"Pal 4",
			1
		],
		[
			174.069,
			-10.877,
			147230,
			"Crater",
			1
		],
		[
			182.526,
			18.543,
			18540,
			"NGC 4147",
			1
		],
		[
			186.439,
			-72.659,
			5710,
			"NGC 4372",
			1
		],
		[
			189.667,
			-51.15,
			20710,
			"Rup 106",
			1
		],
		[
			189.867,
			-26.744,
			10400,
			"NGC 4590",
			1
		],
		[
			193.473,
			-67.177,
			4810,
			"BH 140",
			1
		],
		[
			194.891,
			-70.877,
			6480,
			"NGC 4833",
			1
		],
		[
			198.23,
			18.168,
			18500,
			"NGC 5024",
			1
		],
		[
			199.113,
			17.7,
			17540,
			"NGC 5053",
			1
		],
		[
			201.697,
			-47.479,
			5430,
			"NGC 5139",
			1
		],
		[
			205.548,
			28.377,
			10180,
			"NGC 5272",
			1
		],
		[
			206.612,
			-51.374,
			11100,
			"NGC 5286",
			1
		],
		[
			209.089,
			-27.165,
			29010,
			"AM 4",
			1
		],
		[
			211.364,
			28.534,
			16120,
			"NGC 5466",
			1
		],
		[
			217.405,
			-5.976,
			25960,
			"NGC 5634",
			1
		],
		[
			219.901,
			-26.539,
			34840,
			"NGC 5694",
			1
		],
		[
			225.077,
			-82.214,
			18890,
			"IC 4499",
			1
		],
		[
			225.994,
			-33.068,
			31710,
			"NGC 5824",
			1
		],
		[
			229.019,
			-.121,
			21940,
			"Pal 5",
			1
		],
		[
			229.352,
			-21.01,
			12550,
			"NGC 5897",
			1
		],
		[
			229.638,
			2.081,
			7480,
			"NGC 5904",
			1
		],
		[
			232.003,
			-50.673,
			8270,
			"NGC 5927",
			1
		],
		[
			233.869,
			-50.66,
			9640,
			"NGC 5946",
			1
		],
		[
			236.512,
			-37.786,
			10540,
			"NGC 5986",
			1
		],
		[
			242.625,
			-53.749,
			7430,
			"FSR 1716",
			1
		],
		[
			242.752,
			14.958,
			73580,
			"Pal 14",
			1
		],
		[
			242.765,
			-55.318,
			7900,
			"Lynga 7",
			1
		],
		[
			244.26,
			-22.976,
			10340,
			"NGC 6093",
			1
		],
		[
			245.897,
			-26.526,
			1850,
			"NGC 6121",
			1
		],
		[
			246.45,
			-72.202,
			14450,
			"NGC 6101",
			1
		],
		[
			246.808,
			-26.023,
			8150,
			"NGC 6144",
			1
		],
		[
			246.918,
			-38.849,
			10040,
			"NGC 6139",
			1
		],
		[
			247.162,
			-35.34,
			7640,
			"Ter 3",
			1
		],
		[
			248.133,
			-13.054,
			5630,
			"NGC 6171",
			1
		],
		[
			249.854,
			-28.399,
			7390,
			"ESO 452-SC11",
			1
		],
		[
			250.422,
			36.46,
			7420,
			"NGC 6205",
			1
		],
		[
			251.745,
			47.528,
			30110,
			"NGC 6229",
			1
		],
		[
			251.809,
			-1.949,
			5110,
			"NGC 6218",
			1
		],
		[
			253.044,
			-47.058,
			9080,
			"FSR 1735",
			1
		],
		[
			253.356,
			-22.177,
			11940,
			"NGC 6235",
			1
		],
		[
			254.288,
			-4.1,
			5070,
			"NGC 6254",
			1
		],
		[
			254.886,
			-37.121,
			7240,
			"NGC 6256",
			1
		],
		[
			254.963,
			-.539,
			44100,
			"Pal 15",
			1
		],
		[
			255.304,
			-30.113,
			6030,
			"NGC 6266",
			1
		],
		[
			255.657,
			-26.268,
			8340,
			"NGC 6273",
			1
		],
		[
			256.12,
			-24.765,
			14210,
			"NGC 6284",
			1
		],
		[
			256.256,
			-35.496,
			11470,
			"Gran 3",
			1
		],
		[
			256.289,
			-22.708,
			7930,
			"NGC 6287",
			1
		],
		[
			256.411,
			-47.342,
			8e3,
			"Patchick 126",
			1
		],
		[
			257.543,
			-26.582,
			9190,
			"NGC 6293",
			1
		],
		[
			257.89,
			-24.849,
			15840,
			"Gran 2",
			1
		],
		[
			258.634,
			-29.462,
			6150,
			"NGC 6304",
			1
		],
		[
			259.155,
			-28.14,
			11150,
			"NGC 6316",
			1
		],
		[
			259.281,
			43.136,
			8500,
			"NGC 6341",
			1
		],
		[
			259.496,
			-23.768,
			7530,
			"NGC 6325",
			1
		],
		[
			259.799,
			-18.516,
			8300,
			"NGC 6333",
			1
		],
		[
			260.292,
			-19.588,
			8010,
			"NGC 6342",
			1
		],
		[
			260.896,
			-17.813,
			15660,
			"NGC 6356",
			1
		],
		[
			260.994,
			-26.353,
			8650,
			"NGC 6355",
			1
		],
		[
			261.371,
			-48.422,
			5540,
			"NGC 6352",
			1
		],
		[
			261.785,
			-7.093,
			26590,
			"IC 1257",
			1
		],
		[
			261.888,
			-30.802,
			7750,
			"Ter 2",
			1
		],
		[
			261.934,
			-5.08,
			3440,
			"NGC 6366",
			1
		],
		[
			262.663,
			-31.596,
			7590,
			"Ter 4",
			1
		],
		[
			262.772,
			-29.982,
			7e3,
			"HP 1",
			1
		],
		[
			262.8,
			-39.808,
			11090,
			"FSR 1758",
			1
		],
		[
			262.979,
			-67.048,
			7650,
			"NGC 6362",
			1
		],
		[
			263.352,
			-33.39,
			8060,
			"Liller 1",
			1
		],
		[
			263.619,
			-39.07,
			9610,
			"NGC 6380",
			1
		],
		[
			263.947,
			-30.482,
			5670,
			"Ter 1",
			1
		],
		[
			264.042,
			-38.556,
			6990,
			"Ton 2",
			1
		],
		[
			264.072,
			-44.736,
			11170,
			"NGC 6388",
			1
		],
		[
			264.401,
			-3.246,
			9140,
			"NGC 6402",
			1
		],
		[
			264.652,
			-23.91,
			7440,
			"NGC 6401",
			1
		],
		[
			265.175,
			-53.674,
			2480,
			"NGC 6397",
			1
		],
		[
			265.926,
			-26.225,
			7050,
			"Pal 6",
			1
		],
		[
			266.228,
			3.17,
			20710,
			"NGC 6426",
			1
		],
		[
			266.87,
			-33.066,
			9880,
			"Djor 1",
			1
		],
		[
			267.02,
			-24.779,
			6620,
			"Ter 5",
			1
		],
		[
			267.22,
			-20.36,
			8250,
			"NGC 6440",
			1
		],
		[
			267.228,
			-24.17,
			4910,
			"Gran 5",
			1
		],
		[
			267.554,
			-37.051,
			12730,
			"NGC 6441",
			1
		],
		[
			267.693,
			-31.275,
			7270,
			"Ter 6",
			1
		],
		[
			267.716,
			-34.598,
			10070,
			"NGC 6453",
			1
		],
		[
			268.613,
			-24.145,
			15580,
			"UKS 1",
			1
		],
		[
			268.677,
			-24.015,
			8080,
			"VVV-CL001",
			1
		],
		[
			269.651,
			-32.02,
			8270,
			"Gran 1",
			1
		],
		[
			269.765,
			-44.266,
			9640,
			"NGC 6496",
			1
		],
		[
			270.412,
			-26.84,
			5770,
			"Ter 9",
			1
		],
		[
			270.454,
			-27.826,
			8760,
			"Djor 2",
			1
		],
		[
			270.461,
			-8.959,
			9230,
			"NGC 6517",
			1
		],
		[
			270.741,
			-26.067,
			10210,
			"Ter 10",
			1
		],
		[
			270.892,
			-30.034,
			7290,
			"NGC 6522",
			1
		],
		[
			270.96,
			-.298,
			6360,
			"NGC 6535",
			1
		],
		[
			271.207,
			-30.056,
			7830,
			"NGC 6528",
			1
		],
		[
			271.207,
			-7.586,
			8160,
			"NGC 6539",
			1
		],
		[
			271.536,
			-27.765,
			5910,
			"NGC 6540",
			1
		],
		[
			271.738,
			-20.011,
			6800,
			"VVV-CL160",
			1
		],
		[
			271.834,
			-24.998,
			2580,
			"NGC 6544",
			1
		],
		[
			272.01,
			-43.715,
			7610,
			"NGC 6541",
			1
		],
		[
			272.091,
			-19.83,
			3370,
			"2MASS-GC01",
			1
		],
		[
			272.275,
			-46.423,
			20950,
			"ESO 280-SC06",
			1
		],
		[
			272.323,
			-25.908,
			5330,
			"NGC 6553",
			1
		],
		[
			272.402,
			-20.779,
			5500,
			"2MASS-GC02",
			1
		],
		[
			272.574,
			-31.765,
			7790,
			"NGC 6558",
			1
		],
		[
			272.684,
			-7.208,
			4550,
			"IC 1276",
			1
		],
		[
			273.066,
			-22.742,
			5170,
			"Ter 12",
			1
		],
		[
			273.412,
			-31.827,
			10530,
			"NGC 6569",
			1
		],
		[
			273.527,
			-28.635,
			6120,
			"BH 261",
			1
		],
		[
			274.657,
			-52.216,
			13610,
			"NGC 6584",
			1
		],
		[
			275.919,
			-30.361,
			8020,
			"NGC 6624",
			1
		],
		[
			276.137,
			-24.87,
			5370,
			"NGC 6626",
			1
		],
		[
			277.734,
			-25.497,
			9780,
			"NGC 6638",
			1
		],
		[
			277.846,
			-32.348,
			8900,
			"NGC 6637",
			1
		],
		[
			277.976,
			-23.476,
			8050,
			"NGC 6642",
			1
		],
		[
			278.94,
			-32.991,
			9460,
			"NGC 6652",
			1
		],
		[
			279.1,
			-23.905,
			3300,
			"NGC 6656",
			1
		],
		[
			280.377,
			-19.829,
			11320,
			"Pal 8",
			1
		],
		[
			280.803,
			-32.292,
			9360,
			"NGC 6681",
			1
		],
		[
			283.268,
			-8.706,
			7380,
			"NGC 6712",
			1
		],
		[
			283.764,
			-30.48,
			26280,
			"NGC 6715",
			1
		],
		[
			283.775,
			-22.701,
			7520,
			"NGC 6717",
			1
		],
		[
			284.888,
			-36.632,
			8270,
			"NGC 6723",
			1
		],
		[
			286.314,
			1.9,
			7590,
			"NGC 6749",
			1
		],
		[
			287.717,
			-59.985,
			4120,
			"NGC 6752",
			1
		],
		[
			287.8,
			1.03,
			8410,
			"NGC 6760",
			1
		],
		[
			289.148,
			30.183,
			10430,
			"NGC 6779",
			1
		],
		[
			289.433,
			-34.658,
			24280,
			"Ter 7",
			1
		],
		[
			289.509,
			18.572,
			8940,
			"Pal 10",
			1
		],
		[
			292.184,
			-30.356,
			28730,
			"Arp 2",
			1
		],
		[
			294.999,
			-30.965,
			5350,
			"NGC 6809",
			1
		],
		[
			295.435,
			-33.999,
			27540,
			"Ter 8",
			1
		],
		[
			296.31,
			-8.007,
			14020,
			"Pal 11",
			1
		],
		[
			298.165,
			-22.065,
			66530,
			"Sagittarius II",
			1
		],
		[
			298.444,
			18.779,
			4e3,
			"NGC 6838",
			1
		],
		[
			301.52,
			-21.921,
			20520,
			"NGC 6864",
			1
		],
		[
			308.547,
			7.404,
			15720,
			"NGC 6934",
			1
		],
		[
			313.365,
			-12.537,
			16660,
			"NGC 6981",
			1
		],
		[
			315.373,
			16.187,
			39320,
			"NGC 7006",
			1
		],
		[
			316.727,
			14.98,
			61770,
			"Laevens 3",
			1
		],
		[
			322.493,
			12.167,
			10710,
			"NGC 7078",
			1
		],
		[
			323.363,
			-.823,
			11690,
			"NGC 7089",
			1
		],
		[
			325.092,
			-23.18,
			8460,
			"NGC 7099",
			1
		],
		[
			326.662,
			-21.253,
			18490,
			"Pal 12",
			1
		],
		[
			346.685,
			12.772,
			23480,
			"Pal 13",
			1
		],
		[
			347.111,
			-15.611,
			24390,
			"NGC 7492",
			1
		]
	];
	const FRBS = [
		[
			57.46,
			22.75,
			304088410,
			"FRB20190131D",
			2
		],
		[
			53.21,
			25.73,
			308073204,
			"FRB20181117C",
			2
		],
		[
			39.71,
			23.57,
			207002941,
			"FRB20190118B",
			2
		],
		[
			31.72,
			20.08,
			191315168,
			"FRB20190213A",
			2
		],
		[
			31.72,
			20.08,
			200283006,
			"FRB20190515C",
			2
		],
		[
			29.71,
			20.96,
			194006470,
			"FRB20181231A",
			2
		],
		[
			33.6,
			23.57,
			210584821,
			"FRB20181203A",
			2
		],
		[
			45.06,
			21.42,
			208794062,
			"FRB20190129A",
			2
		],
		[
			47.31,
			24.02,
			248106836,
			"FRB20181203B",
			2
		],
		[
			45.73,
			27.81,
			264583458,
			"FRB20190125A",
			2
		],
		[
			43.34,
			33.14,
			313383376,
			"FRB20190403F",
			2
		],
		[
			48.56,
			35.15,
			359706371,
			"FRB20190422A",
			2
		],
		[
			58.83,
			31.93,
			402274436,
			"FRB20190226A",
			2
		],
		[
			70.5,
			35.59,
			663265411,
			"FRB20190104A",
			2
		],
		[
			67.15,
			37.57,
			636957611,
			"FRB20181018C",
			2
		],
		[
			68.06,
			40.32,
			723178306,
			"FRB20190529A",
			2
		],
		[
			74.81,
			34.8,
			732837852,
			"FRB20190415C",
			2
		],
		[
			87.44,
			44.66,
			607146843,
			"FRB20190317A",
			2
		],
		[
			70,
			43.07,
			802600636,
			"FRB20181214A",
			2
		],
		[
			65.75,
			42.67,
			745837523,
			"FRB20190613B",
			2
		],
		[
			64.26,
			45,
			772603909,
			"FRB20190213C",
			2
		],
		[
			56.88,
			46.93,
			699185752,
			"FRB20190323D",
			2
		],
		[
			64.95,
			47.44,
			814648096,
			"FRB20190110A",
			2
		],
		[
			77.39,
			49.3,
			674270842,
			"FRB20190604C",
			2
		],
		[
			89.93,
			56.5,
			426750853,
			"FRB20180729B",
			2
		],
		[
			79.12,
			61.01,
			467238666,
			"FRB20190612C",
			2
		],
		[
			82.49,
			62.31,
			435038858,
			"FRB20190421B",
			2
		],
		[
			21.66,
			21.39,
			186378999,
			"FRB20190102B",
			2
		],
		[
			26.23,
			23.66,
			186827854,
			"FRB20190607A",
			2
		],
		[
			21.8,
			24.67,
			194903390,
			"FRB20190128A",
			2
		],
		[
			17.88,
			23.82,
			196696957,
			"FRB20190601B",
			2
		],
		[
			22.58,
			26.95,
			213717776,
			"FRB20190217B",
			2
		],
		[
			26.72,
			28.62,
			205659362,
			"FRB20190605D",
			2
		],
		[
			17.46,
			26.76,
			195800219,
			"FRB20190226C",
			2
		],
		[
			38.29,
			36.33,
			305859659,
			"FRB20190619C",
			2
		],
		[
			35.46,
			37.52,
			302759733,
			"FRB20180924A",
			2
		],
		[
			11.52,
			48.59,
			406650545,
			"FRB20190628C",
			2
		],
		[
			22.19,
			46.12,
			403587511,
			"FRB20190106A",
			2
		],
		[
			17.03,
			51.55,
			549330547,
			"FRB20181018A",
			2
		],
		[
			19.36,
			52.32,
			563931851,
			"FRB20190116E",
			2
		],
		[
			21.26,
			53.88,
			622918280,
			"FRB20181101A",
			2
		],
		[
			8.86,
			54.85,
			636532552,
			"FRB20190415B",
			2
		],
		[
			16.36,
			60.53,
			952377135,
			"FRB20181119E",
			2
		],
		[
			45.36,
			46.14,
			532979489,
			"FRB20181224B",
			2
		],
		[
			42.02,
			49.62,
			612265420,
			"FRB20190607B",
			2
		],
		[
			50.46,
			51.58,
			768010309,
			"FRB20190124A",
			2
		],
		[
			45.61,
			54.28,
			809665348,
			"FRB20190115A",
			2
		],
		[
			53.85,
			60.17,
			827504465,
			"FRB20190325C",
			2
		],
		[
			46.01,
			63.33,
			802600636,
			"FRB20181014A",
			2
		],
		[
			60.04,
			55.48,
			849432153,
			"FRB20181122A",
			2
		],
		[
			68.74,
			60.59,
			613118188,
			"FRB20190530A",
			2
		],
		[
			61.6,
			63.36,
			631004652,
			"FRB20190320A",
			2
		],
		[
			73.92,
			63.22,
			483290885,
			"FRB20181128A",
			2
		],
		[
			73.92,
			63.22,
			491521546,
			"FRB20181219A",
			2
		],
		[
			73.92,
			63.22,
			500176324,
			"FRB20190527B",
			2
		],
		[
			85.1,
			68.68,
			341207576,
			"FRB20190116D",
			2
		],
		[
			67.06,
			68.64,
			466370072,
			"FRB20190211A",
			2
		],
		[
			65.54,
			73.63,
			400523345,
			"FRB20180814A",
			2
		],
		[
			65.54,
			73.63,
			398333962,
			"FRB20180911C",
			2
		],
		[
			65.54,
			73.63,
			411898823,
			"FRB20180917A",
			2
		],
		[
			65.54,
			73.63,
			402712151,
			"FRB20180919A",
			2
		],
		[
			65.54,
			73.63,
			358826396,
			"FRB20181028A",
			2
		],
		[
			65.54,
			73.63,
			382114581,
			"FRB20181118C",
			2
		],
		[
			65.54,
			73.63,
			390009039,
			"FRB20181120C",
			2
		],
		[
			65.54,
			73.63,
			396144001,
			"FRB20190329A",
			2
		],
		[
			65.54,
			73.63,
			375530155,
			"FRB20190517B",
			2
		],
		[
			65.54,
			73.63,
			381236957,
			"FRB20190611A",
			2
		],
		[
			65.54,
			73.63,
			389570654,
			"FRB20190625E",
			2
		],
		[
			65.54,
			73.63,
			414521713,
			"FRB20190626A",
			2
		],
		[
			69.5,
			74.08,
			363665116,
			"FRB20190301B",
			2
		],
		[
			87.9,
			76.27,
			296999751,
			"FRB20190329B",
			2
		],
		[
			24.81,
			60.93,
			827918809,
			"FRB20190221D",
			2
		],
		[
			34.8,
			61.34,
			853149134,
			"FRB20190302A",
			2
		],
		[
			37.87,
			68.18,
			693703058,
			"FRB20181019B",
			2
		],
		[
			29.503,
			65.717,
			859752377,
			"FRB20180916B",
			2
		],
		[
			29.503,
			65.717,
			855213297,
			"FRB20181019A",
			2
		],
		[
			29.503,
			65.717,
			859339852,
			"FRB20181104A",
			2
		],
		[
			29.503,
			65.717,
			836200728,
			"FRB20181104B",
			2
		],
		[
			29.503,
			65.717,
			871293503,
			"FRB20181120B",
			2
		],
		[
			29.503,
			65.717,
			868821964,
			"FRB20181222A",
			2
		],
		[
			29.503,
			65.717,
			877880117,
			"FRB20181223A",
			2
		],
		[
			29.503,
			65.717,
			851497379,
			"FRB20181225A",
			2
		],
		[
			29.503,
			65.717,
			860989812,
			"FRB20181226A",
			2
		],
		[
			29.503,
			65.717,
			870057839,
			"FRB20190126A",
			2
		],
		[
			29.503,
			65.717,
			871705343,
			"FRB20190518A",
			2
		],
		[
			29.503,
			65.717,
			870057839,
			"FRB20190518E",
			2
		],
		[
			29.503,
			65.717,
			855213297,
			"FRB20190519A",
			2
		],
		[
			29.503,
			65.717,
			866761698,
			"FRB20190519B",
			2
		],
		[
			29.503,
			65.717,
			853974870,
			"FRB20190519C",
			2
		],
		[
			29.503,
			65.717,
			858927303,
			"FRB20190603A",
			2
		],
		[
			29.503,
			65.717,
			881993679,
			"FRB20190604F",
			2
		],
		[
			29.503,
			65.717,
			877468631,
			"FRB20190605A",
			2
		],
		[
			29.503,
			65.717,
			868821964,
			"FRB20190605B",
			2
		],
		[
			18.04,
			69.39,
			738711475,
			"FRB20181218B",
			2
		],
		[
			5.06,
			71.35,
			644180021,
			"FRB20181218A",
			2
		],
		[
			45.68,
			71.26,
			535132870,
			"FRB20190417C",
			2
		],
		[
			48.87,
			74.28,
			442447350,
			"FRB20190603B",
			2
		],
		[
			41.72,
			77.07,
			412336029,
			"FRB20180907C",
			2
		],
		[
			74.93,
			77.99,
			311171205,
			"FRB20180925A",
			2
		],
		[
			85.86,
			79.35,
			293009805,
			"FRB20190601D",
			2
		],
		[
			81.09,
			79.99,
			301873834,
			"FRB20181117B",
			2
		],
		[
			69.8,
			78.94,
			292122899,
			"FRB20190128C",
			2
		],
		[
			68.38,
			80.95,
			303202648,
			"FRB20190630C",
			2
		],
		[
			76.82,
			82.06,
			290348812,
			"FRB20190115B",
			2
		],
		[
			73.83,
			81.96,
			281916902,
			"FRB20190328C",
			2
		],
		[
			31.79,
			78.38,
			397896016,
			"FRB20181227A",
			2
		],
		[
			20.83,
			79.7,
			372894932,
			"FRB20181230B",
			2
		],
		[
			19.33,
			80.78,
			331501543,
			"FRB20180812A",
			2
		],
		[
			49.76,
			79.5,
			367182435,
			"FRB20190206B",
			2
		],
		[
			50.01,
			81.94,
			367621996,
			"FRB20190228B",
			2
		],
		[
			60.53,
			83.39,
			309843628,
			"FRB20190224A",
			2
		],
		[
			80,
			83.89,
			276142946,
			"FRB20190411A",
			2
		],
		[
			64.03,
			84.84,
			277031498,
			"FRB20190201A",
			2
		],
		[
			33.45,
			83.4,
			317363838,
			"FRB20190107B",
			2
		],
		[
			38.59,
			83.62,
			306302414,
			"FRB20190308B",
			2
		],
		[
			29.69,
			84.8,
			305859659,
			"FRB20190423D",
			2
		],
		[
			77.7,
			87.01,
			306302414,
			"FRB20190430A",
			2
		],
		[
			50.64,
			86.97,
			272143331,
			"FRB20181222E",
			2
		],
		[
			57.39,
			87.19,
			268586565,
			"FRB20180730A",
			2
		],
		[
			64.72,
			87.65,
			265028339,
			"FRB20190223A",
			2
		],
		[
			36.77,
			88.2,
			262803706,
			"FRB20181225B",
			2
		],
		[
			76.64,
			89.16,
			252563053,
			"FRB20190320E",
			2
		],
		[
			135.47,
			1.46,
			238295144,
			"FRB20190403B",
			2
		],
		[
			135.67,
			8.89,
			220427507,
			"FRB20181030E",
			2
		],
		[
			143.36,
			8.9,
			190866538,
			"FRB20190630D",
			2
		],
		[
			132.6,
			9.9,
			243648341,
			"FRB20190221A",
			2
		],
		[
			141.48,
			14.29,
			196248599,
			"FRB20180906A",
			2
		],
		[
			145.45,
			20.99,
			180541817,
			"FRB20180925B",
			2
		],
		[
			120.22,
			22.16,
			298329321,
			"FRB20181226D",
			2
		],
		[
			124.05,
			19.78,
			259688262,
			"FRB20190224C",
			2
		],
		[
			127.44,
			23.29,
			255235690,
			"FRB20190128B",
			2
		],
		[
			134.37,
			35.7,
			192660921,
			"FRB20190617C",
			2
		],
		[
			154.03,
			29.23,
			151749305,
			"FRB20190411B",
			2
		],
		[
			157.22,
			38.28,
			143183761,
			"FRB20181128B",
			2
		],
		[
			171.83,
			34.93,
			136415754,
			"FRB20190301C",
			2
		],
		[
			172.19,
			35.95,
			136415754,
			"FRB20190416B",
			2
		],
		[
			178.57,
			46.71,
			136415754,
			"FRB20181214D",
			2
		],
		[
			178.61,
			47.1,
			136415754,
			"FRB20190402A",
			2
		],
		[
			168.28,
			41.65,
			136415754,
			"FRB20190519E",
			2
		],
		[
			164.57,
			42.99,
			136415754,
			"FRB20190519D",
			2
		],
		[
			167.88,
			47.09,
			136415754,
			"FRB20180907E",
			2
		],
		[
			169.08,
			48.75,
			136415754,
			"FRB20180923D",
			2
		],
		[
			147.94,
			33.93,
			199386630,
			"FRB20181125A",
			2
		],
		[
			144.99,
			33.3,
			176947808,
			"FRB20190416A",
			2
		],
		[
			146.07,
			34.1,
			169305739,
			"FRB20181013C",
			2
		],
		[
			143.1,
			36.9,
			182338280,
			"FRB20190404A",
			2
		],
		[
			138.79,
			42.15,
			191315168,
			"FRB20181214B",
			2
		],
		[
			137.18,
			42.01,
			196248599,
			"FRB20181229A",
			2
		],
		[
			147.73,
			52.51,
			179643451,
			"FRB20181117A",
			2
		],
		[
			158.27,
			45.67,
			145889547,
			"FRB20190422B",
			2
		],
		[
			179.68,
			55.25,
			150848051,
			"FRB20190423A",
			2
		],
		[
			175.93,
			60.02,
			149496002,
			"FRB20181214C",
			2
		],
		[
			165.01,
			59.95,
			159856534,
			"FRB20190502A",
			2
		],
		[
			175.98,
			63.52,
			154002045,
			"FRB20181124A",
			2
		],
		[
			174.87,
			64.72,
			136415754,
			"FRB20190417B",
			2
		],
		[
			114.32,
			32.45,
			312498576,
			"FRB20190202B",
			2
		],
		[
			112.37,
			34.46,
			319574403,
			"FRB20190323A",
			2
		],
		[
			125.82,
			32.07,
			257462261,
			"FRB20190317C",
			2
		],
		[
			117.87,
			41.59,
			269920524,
			"FRB20181014C",
			2
		],
		[
			114.79,
			41.59,
			274365568,
			"FRB20190619D",
			2
		],
		[
			101.47,
			34.86,
			470712112,
			"FRB20180810A",
			2
		],
		[
			105.78,
			43.13,
			344734284,
			"FRB20190219A",
			2
		],
		[
			107.15,
			45.08,
			312056142,
			"FRB20180916C",
			2
		],
		[
			93.38,
			39.34,
			569507561,
			"FRB20181215A",
			2
		],
		[
			94.88,
			43.11,
			490222526,
			"FRB20190217A",
			2
		],
		[
			115.94,
			51.69,
			249889596,
			"FRB20190609D",
			2
		],
		[
			110.75,
			51.3,
			262358711,
			"FRB20190322A",
			2
		],
		[
			108.41,
			56.34,
			281916902,
			"FRB20190227A",
			2
		],
		[
			106.55,
			55.96,
			299215587,
			"FRB20190420A",
			2
		],
		[
			101.01,
			49.73,
			366742851,
			"FRB20190317B",
			2
		],
		[
			97.18,
			52.04,
			416269844,
			"FRB20181013B",
			2
		],
		[
			100.22,
			57,
			331942968,
			"FRB20190527C",
			2
		],
		[
			131.68,
			50.16,
			209689487,
			"FRB20190110B",
			2
		],
		[
			139.99,
			52.11,
			186378999,
			"FRB20190212B",
			2
		],
		[
			142.98,
			56.4,
			182338280,
			"FRB20181115A",
			2
		],
		[
			123.63,
			56.76,
			220874641,
			"FRB20180909A",
			2
		],
		[
			128.77,
			55.99,
			220427507,
			"FRB20181231B",
			2
		],
		[
			138.57,
			61.71,
			180990967,
			"FRB20190701E",
			2
		],
		[
			130.64,
			61.89,
			200731161,
			"FRB20190203B",
			2
		],
		[
			161.33,
			61.53,
			156704590,
			"FRB20190204A",
			2
		],
		[
			168.3,
			63.78,
			160756887,
			"FRB20190424A",
			2
		],
		[
			178.83,
			66.72,
			185032296,
			"FRB20190212D",
			2
		],
		[
			165.18,
			68.37,
			160756887,
			"FRB20190619A",
			2
		],
		[
			179.57,
			70.84,
			163457404,
			"FRB20190303D",
			2
		],
		[
			148.16,
			70.42,
			165257297,
			"FRB20190612A",
			2
		],
		[
			168.32,
			69.78,
			171104460,
			"FRB20190624A",
			2
		],
		[
			161.9,
			74.22,
			183685390,
			"FRB20190326A",
			2
		],
		[
			158.35,
			73.79,
			179643451,
			"FRB20181030A",
			2
		],
		[
			158.35,
			73.79,
			178744993,
			"FRB20181030B",
			2
		],
		[
			118.2,
			55.58,
			243648341,
			"FRB20190201B",
			2
		],
		[
			120.35,
			59.1,
			234724525,
			"FRB20190328A",
			2
		],
		[
			120.81,
			59.5,
			224897824,
			"FRB20190604G",
			2
		],
		[
			115.04,
			59.12,
			255235690,
			"FRB20190426A",
			2
		],
		[
			115.29,
			60.28,
			302759733,
			"FRB20181224C",
			2
		],
		[
			126.65,
			63.47,
			269920524,
			"FRB20190409B",
			2
		],
		[
			128.74,
			66.03,
			208794062,
			"FRB20190303B",
			2
		],
		[
			131.05,
			68.33,
			209689487,
			"FRB20181222C",
			2
		],
		[
			105.78,
			64.25,
			268586565,
			"FRB20181025A",
			2
		],
		[
			104.98,
			64.88,
			273476742,
			"FRB20190419A",
			2
		],
		[
			96.09,
			66.24,
			316479451,
			"FRB20190214A",
			2
		],
		[
			93.42,
			67.07,
			325760935,
			"FRB20180725A",
			2
		],
		[
			98.16,
			68.69,
			294783344,
			"FRB20181209A",
			2
		],
		[
			94.73,
			70.12,
			292566364,
			"FRB20190420B",
			2
		],
		[
			112.1,
			66.7,
			259688262,
			"FRB20190701D",
			2
		],
		[
			101.98,
			74.13,
			273921166,
			"FRB20190313B",
			2
		],
		[
			94.79,
			75.52,
			287686995,
			"FRB20190518G",
			2
		],
		[
			133.68,
			70.82,
			200283006,
			"FRB20190203A",
			2
		],
		[
			132.03,
			73.34,
			214612702,
			"FRB20190322B",
			2
		],
		[
			127.66,
			73.87,
			215507537,
			"FRB20181213A",
			2
		],
		[
			124.51,
			74.61,
			224897824,
			"FRB20190304A",
			2
		],
		[
			156.96,
			77.95,
			194903390,
			"FRB20190218C",
			2
		],
		[
			165.63,
			77.23,
			196248599,
			"FRB20190519F",
			2
		],
		[
			144.32,
			77.67,
			202523551,
			"FRB20190209A",
			2
		],
		[
			144.32,
			77.67,
			181889198,
			"FRB20190210A",
			2
		],
		[
			175.76,
			83.58,
			205659362,
			"FRB20181015A",
			2
		],
		[
			178.6,
			83.87,
			211032454,
			"FRB20190617A",
			2
		],
		[
			115.13,
			74.59,
			238741369,
			"FRB20190117C",
			2
		],
		[
			91,
			80.88,
			269475894,
			"FRB20190208B",
			2
		],
		[
			96.36,
			81.63,
			254344902,
			"FRB20190701C",
			2
		],
		[
			130.41,
			83.07,
			222662950,
			"FRB20190325A",
			2
		],
		[
			155.6,
			82.97,
			212375217,
			"FRB20190502C",
			2
		],
		[
			141.55,
			83.56,
			222215906,
			"FRB20190208C",
			2
		],
		[
			150.92,
			83.56,
			234278096,
			"FRB20190127B",
			2
		],
		[
			141.56,
			83.81,
			227578924,
			"FRB20181022C",
			2
		],
		[
			99.55,
			84.62,
			257016993,
			"FRB20180911A",
			2
		],
		[
			179.79,
			88.33,
			230705841,
			"FRB20190614A",
			2
		],
		[
			116.33,
			86.36,
			246769526,
			"FRB20190403A",
			2
		],
		[
			113.26,
			86.85,
			246323711,
			"FRB20181230E",
			2
		],
		[
			108.79,
			86.85,
			237848896,
			"FRB20190606B",
			2
		],
		[
			174.72,
			89.31,
			242756369,
			"FRB20190518D",
			2
		],
		[
			222.21,
			4.31,
			136415754,
			"FRB20190612B",
			2
		],
		[
			238.37,
			19.78,
			136415754,
			"FRB20181229B",
			2
		],
		[
			239.14,
			22.85,
			136415754,
			"FRB20180923C",
			2
		],
		[
			218.87,
			19.36,
			136415754,
			"FRB20190214C",
			2
		],
		[
			217,
			26.78,
			136415754,
			"FRB20190111A",
			2
		],
		[
			214.69,
			28.8,
			136415754,
			"FRB20190124B",
			2
		],
		[
			225.23,
			25.02,
			136415754,
			"FRB20180915B",
			2
		],
		[
			223.01,
			26.72,
			136415754,
			"FRB20190304C",
			2
		],
		[
			230.58,
			25.86,
			136415754,
			"FRB20181221A",
			2
		],
		[
			227.91,
			32.88,
			136415754,
			"FRB20190625A",
			2
		],
		[
			221.18,
			27.13,
			136415754,
			"FRB20181022E",
			2
		],
		[
			217.17,
			28.38,
			136415754,
			"FRB20190124C",
			2
		],
		[
			243.8,
			25.43,
			145438639,
			"FRB20181127A",
			2
		],
		[
			252.62,
			32.44,
			183685390,
			"FRB20181214F",
			2
		],
		[
			248.1,
			37.25,
			151749305,
			"FRB20190420C",
			2
		],
		[
			259.79,
			40,
			207002941,
			"FRB20190404B",
			2
		],
		[
			262.83,
			38.41,
			215954920,
			"FRB20181013A",
			2
		],
		[
			256.4,
			40.79,
			182787339,
			"FRB20190627B",
			2
		],
		[
			250.4,
			39.63,
			173801864,
			"FRB20190320B",
			2
		],
		[
			262.89,
			45.84,
			205659362,
			"FRB20190103E",
			2
		],
		[
			268.77,
			49.71,
			205659362,
			"FRB20181128C",
			2
		],
		[
			259.91,
			49.32,
			189071794,
			"FRB20190531B",
			2
		],
		[
			269.41,
			52.81,
			220874641,
			"FRB20190330B",
			2
		],
		[
			235.59,
			32.06,
			136415754,
			"FRB20190604E",
			2
		],
		[
			234.03,
			34.48,
			136415754,
			"FRB20190616A",
			2
		],
		[
			246.98,
			41.42,
			160306722,
			"FRB20190110C",
			2
		],
		[
			239.18,
			40.03,
			136415754,
			"FRB20190222C",
			2
		],
		[
			233.38,
			40.03,
			136415754,
			"FRB20181129C",
			2
		],
		[
			233.2,
			42.2,
			136415754,
			"FRB20180817A",
			2
		],
		[
			236.25,
			47.05,
			185930120,
			"FRB20190317F",
			2
		],
		[
			254.81,
			47.56,
			180990967,
			"FRB20181215B",
			2
		],
		[
			255.3,
			50.51,
			187725498,
			"FRB20181230D",
			2
		],
		[
			265.19,
			54.36,
			201179292,
			"FRB20181228C",
			2
		],
		[
			261.45,
			54.36,
			199386630,
			"FRB20190501B",
			2
		],
		[
			245.75,
			50.52,
			165707214,
			"FRB20181230C",
			2
		],
		[
			246.9,
			57.53,
			192212359,
			"FRB20190414B",
			2
		],
		[
			249.83,
			58.7,
			168856002,
			"FRB20190403C",
			2
		],
		[
			262.22,
			59.07,
			244986129,
			"FRB20190320D",
			2
		],
		[
			257.98,
			61.2,
			166606981,
			"FRB20190112A",
			2
		],
		[
			264.43,
			62.62,
			198041896,
			"FRB20181208A",
			2
		],
		[
			266.3,
			63.82,
			216402281,
			"FRB20190105A",
			2
		],
		[
			204.86,
			24.19,
			136415754,
			"FRB20190304B",
			2
		],
		[
			208.87,
			31.68,
			136415754,
			"FRB20190117D",
			2
		],
		[
			197.72,
			26.42,
			136415754,
			"FRB20180727A",
			2
		],
		[
			204.09,
			38.36,
			136415754,
			"FRB20190330A",
			2
		],
		[
			214.96,
			39.27,
			136415754,
			"FRB20181201A",
			2
		],
		[
			220.54,
			39.8,
			136415754,
			"FRB20190227B",
			2
		],
		[
			216.4,
			47.46,
			136415754,
			"FRB20181213C",
			2
		],
		[
			208.03,
			48.24,
			142732718,
			"FRB20190303A",
			2
		],
		[
			208.03,
			48.24,
			148143750,
			"FRB20190421A",
			2
		],
		[
			199.5,
			40.07,
			136415754,
			"FRB20190323C",
			2
		],
		[
			188.36,
			44.39,
			136415754,
			"FRB20190308C",
			2
		],
		[
			199.06,
			51.75,
			136415754,
			"FRB20190628A",
			2
		],
		[
			199.4,
			55.58,
			136415754,
			"FRB20180729A",
			2
		],
		[
			188.2,
			56.16,
			136415754,
			"FRB20181222D",
			2
		],
		[
			183.52,
			53.7,
			136415754,
			"FRB20181213B",
			2
		],
		[
			182.45,
			54.85,
			144987708,
			"FRB20181224D",
			2
		],
		[
			184.05,
			56.42,
			136415754,
			"FRB20190218A",
			2
		],
		[
			185.75,
			56.42,
			140928320,
			"FRB20180906B",
			2
		],
		[
			193.14,
			55.64,
			136415754,
			"FRB20190621B",
			2
		],
		[
			190.11,
			62.72,
			154452526,
			"FRB20190601A",
			2
		],
		[
			183.04,
			61.54,
			146791296,
			"FRB20190224E",
			2
		],
		[
			231.45,
			50.54,
			149496002,
			"FRB20190125B",
			2
		],
		[
			218.78,
			53.28,
			146791296,
			"FRB20190604A",
			2
		],
		[
			218.78,
			53.28,
			139123563,
			"FRB20190606A",
			2
		],
		[
			215.62,
			59.93,
			151749305,
			"FRB20181128D",
			2
		],
		[
			221.84,
			59.91,
			143634781,
			"FRB20190103D",
			2
		],
		[
			246.3,
			57.92,
			146791296,
			"FRB20190219B",
			2
		],
		[
			237.72,
			62.27,
			154902984,
			"FRB20190430B",
			2
		],
		[
			243.45,
			61.87,
			166606981,
			"FRB20190412A",
			2
		],
		[
			250.43,
			63.85,
			169755453,
			"FRB20181228B",
			2
		],
		[
			256.33,
			68.28,
			136415754,
			"FRB20181017A",
			2
		],
		[
			256.33,
			68.28,
			136415754,
			"FRB20190216A",
			2
		],
		[
			267.88,
			71.58,
			218638745,
			"FRB20190627C",
			2
		],
		[
			244.7,
			66.27,
			184134381,
			"FRB20181019C",
			2
		],
		[
			232.66,
			64.94,
			162107247,
			"FRB20181116B",
			2
		],
		[
			252.6,
			71.62,
			194454941,
			"FRB20190409C",
			2
		],
		[
			262.2,
			71.6,
			202523551,
			"FRB20190408A",
			2
		],
		[
			249.32,
			70.96,
			189520514,
			"FRB20190116C",
			2
		],
		[
			261.67,
			75,
			205211457,
			"FRB20190116F",
			2
		],
		[
			255.92,
			75.87,
			201179292,
			"FRB20190204B",
			2
		],
		[
			206.33,
			64.15,
			143634781,
			"FRB20181012B",
			2
		],
		[
			202.83,
			64.72,
			155803832,
			"FRB20181202B",
			2
		],
		[
			212.04,
			64.44,
			146791296,
			"FRB20190502B",
			2
		],
		[
			191.09,
			63.52,
			136415754,
			"FRB20180920B",
			2
		],
		[
			190.53,
			65.13,
			174700818,
			"FRB20181119A",
			2
		],
		[
			190.53,
			65.13,
			158505836,
			"FRB20190103A",
			2
		],
		[
			190.53,
			65.13,
			158505836,
			"FRB20190313A",
			2
		],
		[
			182.38,
			71.28,
			162107247,
			"FRB20190415A",
			2
		],
		[
			180.79,
			71.55,
			162557322,
			"FRB20181219B",
			2
		],
		[
			197.09,
			69.18,
			155353419,
			"FRB20181231C",
			2
		],
		[
			198.48,
			72.94,
			160306722,
			"FRB20181203C",
			2
		],
		[
			200.45,
			74.39,
			182338280,
			"FRB20190206C",
			2
		],
		[
			188.22,
			74.19,
			182787339,
			"FRB20180908B",
			2
		],
		[
			188.22,
			74.19,
			173352353,
			"FRB20190621A",
			2
		],
		[
			228.56,
			75.62,
			180990967,
			"FRB20180806A",
			2
		],
		[
			238.26,
			74.02,
			184134381,
			"FRB20180814B",
			2
		],
		[
			237.21,
			74.16,
			180990967,
			"FRB20190220A",
			2
		],
		[
			238.8,
			77.53,
			211032454,
			"FRB20180917B",
			2
		],
		[
			237.76,
			78.5,
			183236376,
			"FRB20181017B",
			2
		],
		[
			248.48,
			80.14,
			201627401,
			"FRB20190628B",
			2
		],
		[
			262.05,
			81.17,
			220427507,
			"FRB20181126A",
			2
		],
		[
			268.24,
			82.57,
			232938671,
			"FRB20190224B",
			2
		],
		[
			193.22,
			77.24,
			174251352,
			"FRB20190323B",
			2
		],
		[
			196.8,
			79.91,
			176049079,
			"FRB20190401A",
			2
		],
		[
			195.65,
			80.92,
			196248599,
			"FRB20190131E",
			2
		],
		[
			203.96,
			81.72,
			201179292,
			"FRB20190531A",
			2
		],
		[
			190.1,
			82.16,
			194006470,
			"FRB20181119C",
			2
		],
		[
			180.41,
			83.14,
			210584821,
			"FRB20180810B",
			2
		],
		[
			237.26,
			81.23,
			211927652,
			"FRB20190124D",
			2
		],
		[
			231.74,
			82.15,
			205659362,
			"FRB20190619B",
			2
		],
		[
			192.31,
			86.03,
			220874641,
			"FRB20190623C",
			2
		],
		[
			220.22,
			86.54,
			198041896,
			"FRB20190403E",
			2
		],
		[
			255.27,
			86.74,
			243202367,
			"FRB20190419B",
			2
		],
		[
			199.47,
			86.85,
			224450895,
			"FRB20190328B",
			2
		],
		[
			210.49,
			88.35,
			239187571,
			"FRB20190609B",
			2
		],
		[
			210.12,
			88.6,
			232045607,
			"FRB20190425B",
			2
		],
		[
			236.48,
			89.16,
			234724525,
			"FRB20190405B",
			2
		],
		[
			331.71,
			17.37,
			216849619,
			"FRB20190117A",
			2
		],
		[
			331.71,
			17.37,
			256571701,
			"FRB20190630A",
			2
		],
		[
			297.75,
			20.57,
			1606222952,
			"FRB20190124E",
			2
		],
		[
			313.9,
			26.57,
			510981697,
			"FRB20190222D",
			2
		],
		[
			321.25,
			25.44,
			343411941,
			"FRB20190618A",
			2
		],
		[
			320.87,
			29.46,
			402712151,
			"FRB20180907A",
			2
		],
		[
			318.56,
			29.88,
			464198181,
			"FRB20181124B",
			2
		],
		[
			312.95,
			30.85,
			686949670,
			"FRB20180928A",
			2
		],
		[
			307.77,
			29.89,
			999450347,
			"FRB20190101B",
			2
		],
		[
			337.02,
			20.96,
			209241786,
			"FRB20190405A",
			2
		],
		[
			332.86,
			24.69,
			242756369,
			"FRB20190614B",
			2
		],
		[
			336.64,
			26.95,
			241864306,
			"FRB20190409D",
			2
		],
		[
			349.56,
			37.5,
			282804860,
			"FRB20190122A",
			2
		],
		[
			355.11,
			44.56,
			375530155,
			"FRB20181224A",
			2
		],
		[
			355.12,
			44.95,
			391762347,
			"FRB20181129A",
			2
		],
		[
			339.95,
			41.84,
			434602855,
			"FRB20190517D",
			2
		],
		[
			349.05,
			44.94,
			421512015,
			"FRB20181226C",
			2
		],
		[
			355.19,
			46.49,
			418017605,
			"FRB20181130A",
			2
		],
		[
			349.67,
			49.21,
			545891021,
			"FRB20190219C",
			2
		],
		[
			331.14,
			43,
			582359499,
			"FRB20190531C",
			2
		],
		[
			328.21,
			43.01,
			669616637,
			"FRB20190630B",
			2
		],
		[
			335.04,
			45.34,
			597754021,
			"FRB20190215B",
			2
		],
		[
			335.22,
			46.12,
			625047094,
			"FRB20190623B",
			2
		],
		[
			346.11,
			48.43,
			555346120,
			"FRB20181220A",
			2
		],
		[
			335.63,
			46.13,
			621214807,
			"FRB20190106B",
			2
		],
		[
			336.45,
			52.71,
			1000259166,
			"FRB20190213D",
			2
		],
		[
			298.58,
			26.19,
			1943306796,
			"FRB20190423B",
			2
		],
		[
			299.38,
			31.12,
			1796512648,
			"FRB20181119B",
			2
		],
		[
			286.77,
			27.86,
			733677224,
			"FRB20190221B",
			2
		],
		[
			295.33,
			43.84,
			572079633,
			"FRB20190627D",
			2
		],
		[
			281.31,
			34.28,
			403149843,
			"FRB20190327A",
			2
		],
		[
			283.52,
			46.96,
			318248133,
			"FRB20190208A",
			2
		],
		[
			283.52,
			46.96,
			323551976,
			"FRB20190406A",
			2
		],
		[
			279.79,
			51.63,
			274365568,
			"FRB20190329C",
			2
		],
		[
			278.96,
			52.41,
			267252401,
			"FRB20190309A",
			2
		],
		[
			273.38,
			56.31,
			225344731,
			"FRB20181201B",
			2
		],
		[
			281.09,
			59.42,
			259243108,
			"FRB20190429A",
			2
		],
		[
			285.98,
			58.24,
			293896620,
			"FRB20181218C",
			2
		],
		[
			277.47,
			59.04,
			239187571,
			"FRB20190701A",
			2
		],
		[
			273.57,
			61.81,
			225791615,
			"FRB20190226B",
			2
		],
		[
			316.15,
			54.67,
			937295522,
			"FRB20190221C",
			2
		],
		[
			310.15,
			55.46,
			702979134,
			"FRB20190515A",
			2
		],
		[
			306.28,
			53.53,
			644180021,
			"FRB20181216A",
			2
		],
		[
			307.8,
			55.46,
			617380622,
			"FRB20190210D",
			2
		],
		[
			307.13,
			57.03,
			564789909,
			"FRB20181202C",
			2
		],
		[
			311.62,
			60.56,
			548900688,
			"FRB20190223B",
			2
		],
		[
			342.29,
			69.67,
			655212936,
			"FRB20180922A",
			2
		],
		[
			336.82,
			71.91,
			499311265,
			"FRB20181018B",
			2
		],
		[
			300.76,
			55.87,
			457679024,
			"FRB20181123A",
			2
		],
		[
			299.62,
			61.37,
			377725540,
			"FRB20190211B",
			2
		],
		[
			294.85,
			59.4,
			342530264,
			"FRB20190417A",
			2
		],
		[
			290.5,
			59.8,
			308515845,
			"FRB20181217A",
			2
		],
		[
			301.27,
			64.96,
			359706371,
			"FRB20180918A",
			2
		],
		[
			307.28,
			69.02,
			359266395,
			"FRB20181013E",
			2
		],
		[
			296.36,
			70.7,
			296556515,
			"FRB20190322C",
			2
		],
		[
			278.72,
			74.68,
			235617316,
			"FRB20190301D",
			2
		],
		[
			313.06,
			69.83,
			401398937,
			"FRB20190222A",
			2
		],
		[
			313.06,
			69.83,
			397020055,
			"FRB20190301A",
			2
		],
		[
			327.61,
			71.92,
			442447350,
			"FRB20180923A",
			2
		],
		[
			322.53,
			72.72,
			407962927,
			"FRB20180801A",
			2
		],
		[
			324.11,
			74.46,
			388255361,
			"FRB20190318A",
			2
		],
		[
			306.68,
			72.34,
			345615731,
			"FRB20190519G",
			2
		],
		[
			304.65,
			73.61,
			319132336,
			"FRB20190624B",
			2
		],
		[
			303.56,
			73.64,
			310728703,
			"FRB20181226E",
			2
		],
		[
			354.74,
			78.6,
			384746897,
			"FRB20190121A",
			2
		],
		[
			322.62,
			78.83,
			319132336,
			"FRB20181020A",
			2
		],
		[
			348.97,
			80.33,
			352223652,
			"FRB20180916A",
			2
		],
		[
			302.93,
			80.18,
			276587234,
			"FRB20190701B",
			2
		],
		[
			270.63,
			78.89,
			219980351,
			"FRB20190621D",
			2
		],
		[
			286.58,
			81.22,
			248552560,
			"FRB20180904A",
			2
		],
		[
			276.14,
			81.43,
			235170932,
			"FRB20190212A",
			2
		],
		[
			276.14,
			81.43,
			244094293,
			"FRB20190213B",
			2
		],
		[
			306.31,
			80.98,
			269031241,
			"FRB20181221B",
			2
		],
		[
			307.56,
			81.32,
			280584793,
			"FRB20181129B",
			2
		],
		[
			346.69,
			83.37,
			281028852,
			"FRB20181230A",
			2
		],
		[
			342.22,
			83.37,
			298329321,
			"FRB20190205A",
			2
		],
		[
			326.53,
			84.29,
			281916902,
			"FRB20190403D",
			2
		],
		[
			277.37,
			84.87,
			239633750,
			"FRB20181220B",
			2
		],
		[
			281.08,
			85.02,
			241418240,
			"FRB20181122B",
			2
		],
		[
			313.65,
			86.67,
			261913693,
			"FRB20190210E",
			2
		],
		[
			349.08,
			86.97,
			273476742,
			"FRB20190423C",
			2
		],
		[
			342.99,
			87.37,
			261913693,
			"FRB20190519H",
			2
		],
		[
			345.3,
			87.94,
			258352730,
			"FRB20190609A",
			2
		],
		[
			352.77,
			88.21,
			261468653,
			"FRB20180910A",
			2
		],
		[
			298.98,
			85.81,
			248106836,
			"FRB20190622A",
			2
		],
		[
			296.21,
			86.93,
			250335229,
			"FRB20190519J",
			2
		],
		[
			331.89,
			89.05,
			250335229,
			"FRB20190224D",
			2
		],
		[
			328.95,
			89.22,
			240972152,
			"FRB20180907D",
			2
		],
		[
			295.75,
			89.1,
			244094293,
			"FRB20190210C",
			2
		],
		[
			20.65,
			-6.41,
			145889547,
			"FRB20181118A",
			2
		],
		[
			36.05,
			4.52,
			163007374,
			"FRB20181116A",
			2
		],
		[
			28.92,
			5.05,
			154002045,
			"FRB20180921A",
			2
		],
		[
			15.2,
			.54,
			146340433,
			"FRB20190531E",
			2
		],
		[
			12.45,
			7.99,
			142732718,
			"FRB20190527A",
			2
		],
		[
			25.64,
			13.16,
			159406324,
			"FRB20190130A",
			2
		],
		[
			17.77,
			14.11,
			167506657,
			"FRB20181219C",
			2
		],
		[
			329.93,
			3.96,
			199834830,
			"FRB20190429B",
			2
		],
		[
			338.92,
			5.3,
			166606981,
			"FRB20190124F",
			2
		],
		[
			.83,
			3.41,
			138221050,
			"FRB20190515B",
			2
		],
		[
			5.34,
			5.94,
			139123563,
			"FRB20180919B",
			2
		],
		[
			7.26,
			10.22,
			156254222,
			"FRB20181228A",
			2
		],
		[
			6.34,
			12.67,
			155803832,
			"FRB20190629A",
			2
		],
		[
			354.72,
			11.71,
			144536755,
			"FRB20190131B",
			2
		],
		[
			8.95,
			19.17,
			182787339,
			"FRB20190114A",
			2
		],
		[
			9.33,
			20.5,
			180092645,
			"FRB20190411C",
			2
		],
		[
			4.49,
			19.17,
			173352353,
			"FRB20180907B",
			2
		],
		[
			5.23,
			20.51,
			176947808,
			"FRB20190316A",
			2
		],
		[
			9.26,
			26.72,
			188174286,
			"FRB20190102A",
			2
		],
		[
			351.01,
			17.36,
			183236376,
			"FRB20181202A",
			2
		],
		[
			359.23,
			19.17,
			163457404,
			"FRB20190608A",
			2
		],
		[
			344.2,
			17.1,
			177397138,
			"FRB20190202A",
			2
		],
		[
			.86,
			21.81,
			144536755,
			"FRB20190107A",
			2
		],
		[
			2.53,
			35.12,
			236956332,
			"FRB20190122B",
			2
		],
		[
			356.5,
			35.91,
			243202367,
			"FRB20190614C",
			2
		],
		[
			108.14,
			-2.99,
			788867316,
			"FRB20190113A",
			2
		],
		[
			115.02,
			4.87,
			447237510,
			"FRB20190625D",
			2
		],
		[
			107.96,
			5.16,
			653940718,
			"FRB20190109A",
			2
		],
		[
			113.43,
			5.72,
			485890948,
			"FRB20190319A",
			2
		],
		[
			104.19,
			11.07,
			684415597,
			"FRB20190103C",
			2
		],
		[
			67.13,
			-5.01,
			213270279,
			"FRB20190515D",
			2
		],
		[
			79.52,
			6.72,
			365863613,
			"FRB20190409A",
			2
		],
		[
			78.93,
			7.77,
			375530155,
			"FRB20190427A",
			2
		],
		[
			56.43,
			1.16,
			205211457,
			"FRB20190617B",
			2
		],
		[
			73.2,
			11.1,
			339443670,
			"FRB20190625C",
			2
		],
		[
			58.28,
			10.79,
			239633750,
			"FRB20181118B",
			2
		],
		[
			65.79,
			16.04,
			308073204,
			"FRB20190418A",
			2
		],
		[
			87.22,
			15.63,
			690749192,
			"FRB20181102A",
			2
		],
		[
			93.57,
			19.73,
			773021368,
			"FRB20190103B",
			2
		],
		[
			104.18,
			23.7,
			511845498,
			"FRB20190210B",
			2
		],
		[
			81.79,
			16.07,
			548900688,
			"FRB20181030D",
			2
		],
		[
			78.56,
			14.66,
			458113797,
			"FRB20181014B",
			2
		],
		[
			77.05,
			17.44,
			469409744,
			"FRB20181104C",
			2
		],
		[
			73.17,
			24.06,
			502338563,
			"FRB20190609C",
			2
		],
		[
			81.74,
			25.78,
			726539562,
			"FRB20190403G",
			2
		],
		[
			78.89,
			28.29,
			737453230,
			"FRB20180920A",
			2
		],
		[
			87.5,
			26.62,
			817553130,
			"FRB20190517C",
			2
		],
		[
			88.52,
			28.47,
			812987558,
			"FRB20190601C",
			2
		],
		[
			82.995,
			33.148,
			949526338,
			"FRB20181119D",
			2
		],
		[
			90.04,
			38.55,
			655212936,
			"FRB20181222B",
			2
		],
		[
			216.04,
			-2.93,
			136415754,
			"FRB20181014D",
			2
		],
		[
			195.89,
			.75,
			136415754,
			"FRB20190627A",
			2
		],
		[
			196.01,
			2.48,
			136415754,
			"FRB20190203C",
			2
		],
		[
			206.57,
			5.23,
			136415754,
			"FRB20190621C",
			2
		],
		[
			199.93,
			15.73,
			136415754,
			"FRB20190604D",
			2
		],
		[
			200.6,
			17.57,
			136415754,
			"FRB20190122C",
			2
		],
		[
			168.32,
			-5.19,
			164357396,
			"FRB20190605C",
			2
		],
		[
			167.34,
			7.37,
			153101017,
			"FRB20190516B",
			2
		],
		[
			166.45,
			10.43,
			143183761,
			"FRB20190131C",
			2
		],
		[
			182.66,
			12.43,
			136415754,
			"FRB20181226B",
			2
		],
		[
			192.33,
			27.15,
			136415754,
			"FRB20190116A",
			2
		],
		[
			192.33,
			27.15,
			136415754,
			"FRB20190116B",
			2
		],
		[
			172.11,
			16.05,
			136415754,
			"FRB20190130B",
			2
		],
		[
			175.11,
			20.28,
			136415754,
			"FRB20190518B",
			2
		],
		[
			174.89,
			21.59,
			136415754,
			"FRB20181223B",
			2
		],
		[
			160.69,
			19.62,
			153551542,
			"FRB20190222B",
			2
		],
		[
			170.73,
			23.33,
			136415754,
			"FRB20190428A",
			2
		],
		[
			183.48,
			22.9,
			185930120,
			"FRB20190228A",
			2
		],
		[
			181.05,
			27.58,
			136415754,
			"FRB20181223C",
			2
		],
		[
			183.92,
			30.32,
			136415754,
			"FRB20190325B",
			2
		],
		[
			173.24,
			26.32,
			136415754,
			"FRB20190303C",
			2
		],
		[
			172.57,
			28.14,
			136415754,
			"FRB20190212C",
			2
		],
		[
			171.01,
			27.99,
			166606981,
			"FRB20190101A",
			2
		],
		[
			179.18,
			36.53,
			136415754,
			"FRB20181022D",
			2
		],
		[
			181.44,
			38.9,
			136415754,
			"FRB20190414A",
			2
		],
		[
			309.83,
			3.99,
			325319189,
			"FRB20181030C",
			2
		],
		[
			263.47,
			-2.37,
			545030906,
			"FRB20190410A",
			2
		],
		[
			253.47,
			1.25,
			312498576,
			"FRB20190109B",
			2
		],
		[
			234.72,
			-6.25,
			212822759,
			"FRB20190104B",
			2
		],
		[
			242.01,
			4.64,
			192212359,
			"FRB20190518C",
			2
		],
		[
			254.55,
			9.85,
			249889596,
			"FRB20190307A",
			2
		],
		[
			253.31,
			11.55,
			240079907,
			"FRB20190118A",
			2
		],
		[
			239.32,
			7.32,
			160756887,
			"FRB20181224E",
			2
		],
		[
			244.85,
			9.36,
			184583350,
			"FRB20190206A",
			2
		],
		[
			274.37,
			13.25,
			593908236,
			"FRB20190317E",
			2
		],
		[
			265.76,
			15.17,
			351783285,
			"FRB20190410B",
			2
		],
		[
			268.7,
			17.93,
			375091009,
			"FRB20190218B",
			2
		],
		[
			283.32,
			17.44,
			997832425,
			"FRB20190128D",
			2
		],
		[
			280.55,
			17.91,
			751282259,
			"FRB20180915A",
			2
		],
		[
			285.65,
			19.25,
			1130834505,
			"FRB20190412B",
			2
		],
		[
			277.22,
			24.92,
			438090225,
			"FRB20190430C",
			2
		],
		[
			260.02,
			13.53,
			282360892,
			"FRB20190111B",
			2
		],
		[
			257.4,
			18.85,
			241418240,
			"FRB20190613A",
			2
		],
		[
			255.72,
			21.52,
			219085969,
			"FRB20190425A",
			2
		],
		[
			254.73,
			22.38,
			206107244,
			"FRB20190320C",
			2
		],
		[
			270.48,
			24.52,
			333267103,
			"FRB20190623A",
			2
		],
		[
			273.52,
			26.32,
			355305577,
			"FRB20190520A",
			2
		],
		[
			269.2,
			38.4,
			235170932,
			"FRB20190307B",
			2
		],
		[
			131.9,
			-4.24,
			282360892,
			"FRB20181027A",
			2
		]
	];
	const CLU_T = [
		{
			c: [
				150,
				190,
				255
			],
			l: "Open cluster · Cantat-Gaudin 2020 (Gaia)"
		},
		{
			c: [
				255,
				215,
				140
			],
			l: "Globular cluster · Baumgardt (Gaia)"
		},
		{
			c: [
				170,
				255,
				190
			],
			l: "Fast radio burst · CHIME (distance estimated from DM)"
		}
	];
	GLOBS.concat(FRBS).forEach((c) => {
		c.oclu = true;
		c.ct = c[4] || 0;
		c._dir = dirOf(c[0], c[1]);
		c.n = c[3];
		c.d = c[2];
		CLUSTERS.push(c);
	});
	const CONS = DATA.constellations || [];
	CONS.forEach((k) => {
		k._L = k.L.map((pl) => {
			const a = [];
			for (let i = 0; i < pl.length; i += 2) a.push(dirOf(pl[i], pl[i + 1]));
			return a;
		});
	});
	const CON_NAME = {
		Ori: "Orion",
		UMa: "Ursa Major",
		UMi: "Ursa Minor",
		Cas: "Cassiopeia",
		Cyg: "Cygnus",
		Lyr: "Lyra",
		Aql: "Aquila",
		Sco: "Scorpius",
		Sgr: "Sagittarius",
		Leo: "Leo",
		Tau: "Taurus",
		Gem: "Gemini",
		Cnc: "Cancer",
		Vir: "Virgo",
		And: "Andromeda",
		Per: "Perseus",
		Aur: "Auriga",
		Boo: "Bootes",
		Cru: "Crux",
		Cen: "Centaurus",
		CMa: "Canis Major",
		CMi: "Canis Minor",
		Peg: "Pegasus",
		Ari: "Aries",
		Psc: "Pisces",
		Aqr: "Aquarius",
		Cap: "Capricornus",
		Dra: "Draco",
		Her: "Hercules",
		Oph: "Ophiuchus",
		Car: "Carina",
		Vel: "Vela",
		Cae: "Caelum",
		Del: "Delphinus",
		Crv: "Corvus",
		Cvn: "Canes Venatici"
	};
	let tgtYaw = S.yaw, tgtPitch = S.pitch, tgtCamZ = S.camZ;
	const ctr = {
		x: 0,
		y: 0,
		z: 0
	}, tgtCtr = {
		x: 0,
		y: 0,
		z: 0
	};
	let camRight = [
		1,
		0,
		0
	], camUp = [
		0,
		1,
		0
	], camFwd = [
		0,
		0,
		1
	], camDist = 0, camPos = [
		0,
		0,
		0
	];
	const keys = /* @__PURE__ */ new Set();
	function camBasis() {
		const c = Math.cos(S.yaw), s = Math.sin(S.yaw), cp = Math.cos(S.pitch), sp = Math.sin(S.pitch);
		camRight = [
			c,
			sp * s,
			-cp * s
		];
		camUp = [
			0,
			cp,
			sp
		];
		camFwd = [
			s,
			-sp * c,
			cp * c
		];
		camPos = [
			ctr.x - camFwd[0] * S.camZ,
			ctr.y - camFwd[1] * S.camZ,
			ctr.z - camFwd[2] * S.camZ
		];
		camDist = Math.hypot(camPos[0], camPos[1], camPos[2]);
	}
	if (matchMedia("(prefers-reduced-motion: reduce)").matches) S.autorot = false, syncToggle("t-rot", false);
	let glOK = false, GL = null, glcv = null;
	let progF = null, progU = null, progT = null;
	let hdrOK = false, hdrFB = null, hdrTex = null, glMaxPt = 64;
	let glBuf = null, glBufH = null, glBufP = null, glBufC = null;
	const CL = {
		G: null,
		B: null,
		W: null,
		Q: null,
		O: null,
		V: null
	};
	let gaiaRaw = null, gaiaRange = 100, webRaw = null, qsoRaw = null, beltRaw = null, obRaw = null, varRaw = null, beltEpoch = 0;
	let exactPx = null;
	function resize() {
		const raw = devicePixelRatio || 1;
		W = innerWidth;
		H = innerHeight;
		const px2 = exactPx && raw <= 3.02 ? exactPx : null;
		cv.width = px2 ? px2[0] : Math.round(W * Math.min(raw, 3));
		cv.height = px2 ? px2[1] : Math.round(H * Math.min(raw, 3));
		cv.style.width = W + "px";
		cv.style.height = H + "px";
		DPR = cv.width / W;
		ctx.setTransform(DPR, 0, 0, cv.height / H, 0, 0);
		glResize();
		dirty = true;
	}
	addEventListener("resize", resize);
	if (window.ResizeObserver) try {
		new ResizeObserver((es) => {
			const s = es[es.length - 1].devicePixelContentBoxSize;
			if (s && s[0]) exactPx = [s[0].inlineSize, s[0].blockSize];
			resize();
		}).observe(cv, { box: "device-pixel-content-box" });
	} catch (_) {}
	resize();
	function tempColor(t) {
		if (!t) return [
			150,
			160,
			190
		];
		if (t >= 3e4) return [
			155,
			176,
			255
		];
		if (t >= 1e4) return [
			170,
			191,
			255
		];
		if (t >= 7500) return [
			202,
			215,
			255
		];
		if (t >= 6e3) return [
			248,
			247,
			255
		];
		if (t >= 5200) return [
			255,
			244,
			232
		];
		if (t >= 3700) return [
			255,
			210,
			161
		];
		return [
			255,
			181,
			108
		];
	}
	function compress(r) {
		return scale(r);
	}
	function radiusScale(re) {
		if (!S.size || !re) return 1;
		return Math.max(.55, Math.min(4.2, Math.pow(re / 1.4, .5)));
	}
	let cy, cx, foc;
	function project(px, py, pz) {
		px -= ctr.x;
		py -= ctr.y;
		pz -= ctr.z;
		const cyaw = Math.cos(S.yaw), syaw = Math.sin(S.yaw);
		const x1 = px * cyaw + pz * syaw, z1 = -px * syaw + pz * cyaw, y1 = py;
		const cp = Math.cos(S.pitch), sp = Math.sin(S.pitch);
		const y2 = y1 * cp - z1 * sp, z2 = y1 * sp + z1 * cp;
		const depth = S.camZ - z2;
		return {
			x: cx + foc * x1 / depth,
			y: cy - foc * y2 / depth,
			depth,
			z2
		};
	}
	let visSys = 0, visPl = 0, nearD = Infinity, farD = 0;
	const order = [];
	let _vig = null, _vigW = 0, _vigH = 0;
	const _sprites = {};
	function blobSprite(r, g, b, a0, a1) {
		const k = r + "," + g + "," + b + "," + a0 + "," + a1;
		let sp = _sprites[k];
		if (!sp) {
			sp = document.createElement("canvas");
			sp.width = sp.height = 64;
			const c2 = sp.getContext("2d");
			const gr = c2.createRadialGradient(32, 32, 0, 32, 32, 32);
			gr.addColorStop(0, `rgba(${r},${g},${b},${a0})`);
			gr.addColorStop(.5, `rgba(${r},${g},${b},${a1})`);
			gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
			c2.fillStyle = gr;
			c2.fillRect(0, 0, 64, 64);
			_sprites[k] = sp;
		}
		return sp;
	}
	const PLIM = 32768;
	function offscr(p) {
		return p.depth <= NEAR || Math.abs(p.x - cx) > PLIM || Math.abs(p.y - cy) > PLIM;
	}
	function render() {
		cx = W / 2;
		cy = H / 2;
		foc = Math.min(W, H) * .62;
		gwOnScreen = false;
		ctx.clearRect(0, 0, W, H);
		if (!_vig || _vigW !== W || _vigH !== H) {
			_vig = ctx.createRadialGradient(cx, cy * .9, 0, cx, cy, Math.max(W, H) * .75);
			_vig.addColorStop(0, "rgba(20,26,48,.55)");
			_vig.addColorStop(1, "rgba(5,7,15,0)");
			_vigW = W;
			_vigH = H;
		}
		ctx.fillStyle = _vig;
		ctx.fillRect(0, 0, W, H);
		if (surfUpdate()) {
			drawSurface();
			updateHUD();
			return;
		}
		camBasis();
		NEAR = S.realScale ? Math.max(1e-13, S.camZ * .02) : Math.min(.05, Math.max(.001, S.camZ * .35));
		solarA = lodA(camDist, .001, .1);
		sysA = 0;
		if (focusSys && focusSysW) sysA = lodA(Math.hypot(camPos[0] - focusSysW[0], camPos[1] - focusSysW[1], camPos[2] - focusSysW[2]), 8e-6, 8e-4);
		calcLens();
		if (S.rings) drawRings();
		if (S.veil) drawVeilSphere();
		projectGalaxies();
		const backG = [], frontG = [];
		for (const g of galProj) (g._z2 < 0 ? backG : frontG).push(g);
		drawGalaxies(backG);
		order.length = 0;
		visSys = 0;
		visPl = 0;
		nearD = Infinity;
		farD = 0;
		for (let i = 0; i < STARS.length; i++) {
			const s = STARS[i];
			if (s.fy > S.year && s.fy !== 0) continue;
			if (S.facHidden.has(s.fac)) continue;
			const dr = compress(s._r);
			const p = project(s._dx * dr, s._dy * dr, s._dz * dr);
			if (p.depth <= NEAR) continue;
			if (p.x < -90 || p.x > W + 90 || p.y < -90 || p.y > H + 90) continue;
			s._sx = p.x;
			s._sy = p.y;
			s._depth = p.depth;
			s._z2 = p.z2;
			order.push(s);
			visSys++;
			let pc = 0, rmax = 0;
			for (let k = 0; k < s.p.length; k++) {
				const pp = s.p[k];
				if (pp.y <= S.year || pp.y === 0) {
					pc++;
					if (pp.r && pp.r > rmax) rmax = pp.r;
				}
			}
			s._pc = pc;
			s._rmax = rmax;
			visPl += pc;
			if (s._r < nearD) nearD = s._r;
			if (s._r > farD) farD = s._r;
		}
		order.sort((a, b) => a._z2 - b._z2);
		projectHyg();
		if (glStars()) glRender();
		else {
			glClearCanvas();
			drawHyg();
		}
		const sp = project(0, 0, 0);
		const gpuH = glStars() && glBufH;
		for (const s of order) {
			const size = Math.max(.7, foc * .0075 / s._depth * radiusScale(s._rmax));
			const fade = Math.max(.12, Math.min(1, 1.9 - s._depth * .55));
			const isNew = s.fy === S.year && s.fy !== 0;
			const isSel = s === S.hover || s === S.pinned || s === S.focusStar;
			let col = S.facColor ? (FAC[s.fac] || FAC.other).c : s._col, a = fade;
			let veil = 0;
			if (S.veil && s._r > BND) {
				veil = Math.min(1, (s._r - BND) / (BND * 1.6));
				col = [
					col[0] + (232 - col[0]) * veil * .85,
					col[1] + (58 - col[1]) * veil * .85,
					col[2] + (50 - col[2]) * veil * .85
				];
				a *= 1 - veil * .4;
			}
			if (isNew) {
				col = [
					79,
					214,
					200
				];
				a = 1;
				veil = 0;
			}
			const cr = col[0] | 0, cg = col[1] | 0, cb = col[2] | 0;
			if (!gpuH) {
				ctx.beginPath();
				ctx.arc(s._sx, s._sy, isSel ? size + 1.6 : size, 0, 6.2832);
				ctx.fillStyle = `rgba(${cr},${cg},${cb},${a})`;
				ctx.fill();
				if (size > 1.6 || isNew || isSel || veil > .35) {
					ctx.beginPath();
					ctx.arc(s._sx, s._sy, (isSel ? size + 1.6 : size) * (veil > .35 ? 3 : 2.4), 0, 6.2832);
					ctx.fillStyle = `rgba(${cr},${cg},${cb},${a * (veil > .35 ? .16 : .1)})`;
					ctx.fill();
				}
			}
			if (isSel) {
				ctx.beginPath();
				ctx.arc(s._sx, s._sy, size + 7, 0, 6.2832);
				ctx.strokeStyle = "rgba(79,214,200,.9)";
				ctx.lineWidth = 1.2;
				ctx.stroke();
			}
		}
		const sm = 1 - solarA;
		if (sm > .02) {
			ctx.globalAlpha = sm;
			ctx.beginPath();
			ctx.arc(sp.x, sp.y, 4.2, 0, 6.2832);
			ctx.fillStyle = "#eafffb";
			ctx.fill();
			ctx.beginPath();
			ctx.arc(sp.x, sp.y, 9, 0, 6.2832);
			ctx.strokeStyle = "rgba(255,255,255,.5)";
			ctx.lineWidth = 1;
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(sp.x, sp.y, 15, 0, 6.2832);
			ctx.fillStyle = "rgba(255,255,255,.05)";
			ctx.fill();
			ctx.globalAlpha = 1;
		}
		drawGalaxies(frontG);
		if (solarA < .5 && sysA < .5) {
			drawConstellations();
			if (S.met) drawShowers();
			drawDSO();
			drawPulsars();
			drawClusters();
			if (S.mw3d) drawGalaxyModel();
			drawMW();
			drawS2();
			if (S.edge) drawEdge();
		}
		if (lensPar && lensPar.e > 12) {
			ctx.beginPath();
			ctx.arc(lensPar.x, lensPar.y, lensPar.e, 0, 6.2832);
			ctx.setLineDash([2, 6]);
			ctx.strokeStyle = "rgba(255,215,150,0.35)";
			ctx.lineWidth = 1;
			ctx.stroke();
			ctx.setLineDash([]);
			ctx.font = "9px ui-monospace,monospace";
			ctx.fillStyle = "rgba(255,215,150,0.6)";
			ctx.fillText("Einstein ring · lensing exaggerated ×" + LENS_EXAG, lensPar.x + lensPar.e * .72, lensPar.y - lensPar.e * .72);
		}
		if (S.galaxies && sp.depth > NEAR && solarA < .5) {
			ctx.globalAlpha = 1 - solarA * 2;
			ctx.font = "10px ui-monospace,monospace";
			ctx.fillStyle = "rgba(233,237,250,.55)";
			ctx.fillText("Milky Way · all exoplanets", sp.x + 14, sp.y - 10);
			if (solarA < .15) {
				ctx.fillStyle = "rgba(255,238,178,.7)";
				ctx.font = "9px ui-monospace,monospace";
				ctx.fillText("☉ click → into the solar system", sp.x + 14, sp.y + 4);
			}
			ctx.globalAlpha = 1;
		}
		lastSun.x = sp.x;
		lastSun.y = sp.y;
		lastSun.depth = sp.depth;
		if (solarA > .01) drawSolar(solarA);
		if (sysA > .01) drawSystem(sysA);
		else sysProj.length = 0;
		if (measureMode) drawMeasure();
		if (ROUTE) drawRoute();
		drawNav();
		updateHUD();
	}
	const lastSun = {
		x: 0,
		y: 0,
		depth: 0
	};
	let galProj = [];
	function projectGalaxies() {
		galProj.length = 0;
		if (!S.galaxies) return;
		for (const g of GAL) {
			const R = scale(g.mpc * 1e6);
			g._x = g.dx * R;
			g._y = g.dy * R;
			g._z = g.dz * R;
			const p = project(g._x, g._y, g._z);
			if (p.depth <= NEAR) continue;
			if (p.x < -90 || p.x > W + 90 || p.y < -90 || p.y > H + 90) continue;
			g._sx = p.x;
			g._sy = p.y;
			g._depth = p.depth;
			g._z2 = p.z2;
			galProj.push(g);
		}
		galProj.sort((a, b) => a._z2 - b._z2);
	}
	function drawGalaxies(list) {
		for (const g of list) {
			const s = Math.max(1.4, foc * .011 / g._depth * g._gs);
			const c = g.c, a = Math.max(.25, Math.min(.95, 1.7 - g._depth * .045));
			if (s > 3) {
				const ba = g.ba && g.ba > .05 ? g.ba : 1;
				let th = 0;
				if (g.pa !== void 0) {
					const dx3 = g.dx, dy3 = g.dy, dz3 = g.dz, cd3 = Math.max(1e-6, Math.hypot(dx3, dy3));
					const e2 = camDir2([
						-dy3 / cd3,
						dx3 / cd3,
						0
					]);
					const n2 = camDir2([
						-dz3 * dx3 / cd3,
						-dz3 * dy3 / cd3,
						cd3
					]);
					const pa = g.pa * .0174533;
					th = Math.atan2(n2[1] * Math.cos(pa) + e2[1] * Math.sin(pa), n2[0] * Math.cos(pa) + e2[0] * Math.sin(pa));
				}
				ctx.save();
				ctx.translate(g._sx, g._sy);
				ctx.rotate(th);
				ctx.scale(1, ba);
				ctx.globalAlpha = a;
				ctx.drawImage(blobSprite(c[0], c[1], c[2], .85, .3), -s, -s, s * 2, s * 2);
				ctx.restore();
				ctx.globalAlpha = 1;
			} else {
				ctx.beginPath();
				ctx.arc(g._sx, g._sy, s, 0, 6.2832);
				ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a * .55})`;
				ctx.fill();
			}
			ctx.beginPath();
			ctx.arc(g._sx, g._sy, Math.max(.8, s * .26), 0, 6.2832);
			ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${Math.min(1, a + .25)})`;
			ctx.fill();
			const sel = g === S.hover || g === S.pinned;
			if (sel) {
				ctx.beginPath();
				ctx.arc(g._sx, g._sy, s + 6, 0, 6.2832);
				ctx.strokeStyle = "rgba(79,214,200,.9)";
				ctx.lineWidth = 1.2;
				ctx.stroke();
			}
			if (g.f || sel) {
				ctx.font = (sel ? "11px" : "10px") + " ui-monospace,monospace";
				ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${sel ? 1 : .72})`;
				ctx.fillText(g.n, g._sx + s + 4, g._sy + 3);
			}
		}
	}
	const LY_PC = 1 / PC2LY;
	const RINGS = [
		{
			pc: 1 * AU_PC,
			l: "1 AU"
		},
		{
			pc: 30 * AU_PC,
			l: "30 AU"
		},
		{
			pc: 1 * LY_PC,
			l: "1 ly"
		},
		{
			pc: 100 * LY_PC,
			l: "100 ly"
		},
		{
			pc: 1e4 * LY_PC,
			l: "10,000 ly"
		},
		{
			pc: 1e6 * LY_PC,
			l: "1 Mly"
		},
		{
			pc: 1e7 * LY_PC,
			l: "10 Mly"
		}
	];
	function drawRings() {
		ctx.save();
		for (const R of RINGS) {
			const dr = scale(R.pc);
			ctx.beginPath();
			let first = true, drew = false;
			for (let a = 0; a <= 72; a++) {
				const th = a / 72 * 6.2832;
				const p = project(Math.cos(th) * dr, 0, Math.sin(th) * dr);
				if (offscr(p)) {
					first = true;
					continue;
				}
				if (first) {
					ctx.moveTo(p.x, p.y);
					first = false;
				} else ctx.lineTo(p.x, p.y);
				drew = true;
			}
			ctx.strokeStyle = "rgba(120,140,190,.11)";
			ctx.lineWidth = 1;
			ctx.stroke();
			const lp = project(dr, 0, 0);
			if (lp.depth > NEAR && drew) {
				ctx.font = "9px ui-monospace,monospace";
				ctx.fillStyle = "rgba(120,140,190,.42)";
				ctx.fillText(R.l, lp.x + 4, lp.y - 3);
			}
		}
		ctx.restore();
	}
	function drawVeilSphere() {
		const dr = compress(BND);
		const planes = [
			[0, 1],
			[0, 2],
			[1, 2]
		];
		ctx.save();
		for (const [ax, ay] of planes) {
			ctx.beginPath();
			let first = true;
			for (let a = 0; a <= 72; a++) {
				const th = a / 72 * 6.2832, co = Math.cos(th) * dr, si = Math.sin(th) * dr;
				const v = [
					0,
					0,
					0
				];
				v[ax] = co;
				v[ay] = si;
				const p = project(v[0], v[1], v[2]);
				if (offscr(p)) {
					first = true;
					continue;
				}
				if (first) {
					ctx.moveTo(p.x, p.y);
					first = false;
				} else ctx.lineTo(p.x, p.y);
			}
			ctx.strokeStyle = "rgba(230,71,60,.20)";
			ctx.lineWidth = 1;
			ctx.stroke();
		}
		const lp = project(0, dr, 0);
		if (lp.depth > NEAR) {
			ctx.font = "9px ui-monospace,monospace";
			ctx.fillStyle = "rgba(230,71,60,.55)";
			ctx.fillText("charted neighbourhood · " + fmt(BND * PC2LY) + " ly", lp.x + 5, lp.y);
		}
		ctx.restore();
	}
	let hygProj = [];
	const MAS2RAD = Math.PI / (180 * 3600 * 1e3);
	function projectHyg() {
		hygProj.length = 0;
		if (!S.hyg) return;
		const pm = S.pm && S.pmYears !== 0, ty = S.pmYears;
		for (const s of HYG) {
			let dx = s.dx, dy = s.dy, dz = s.dz;
			if (pm && s.pr !== void 0) {
				const ox = dx, oy = dy, oz = dz, cd = Math.hypot(ox, oy) || 1e-6;
				const tE = (s.pr || 0) * ty * MAS2RAD, tN = (s.pd || 0) * ty * MAS2RAD;
				dx = ox + -oy / cd * tE + -oz * ox / cd * tN;
				dy = oy + ox / cd * tE + -oz * oy / cd * tN;
				dz = oz + cd * tN;
				const L = Math.hypot(dx, dy, dz) || 1;
				dx /= L;
				dy /= L;
				dz /= L;
			}
			const dr = compress(s.d);
			const p = project(dx * dr, dy * dr, dz * dr);
			if (p.depth <= NEAR) continue;
			if (p.x < -90 || p.x > W + 90 || p.y < -90 || p.y > H + 90) continue;
			let bright = 6.8 - s.m;
			if (bright < 0) bright = 0;
			const size = (.4 + bright * .34) * foc * .0032 / p.depth;
			if (size < .34 && s !== S.hover && s !== S.pinned) continue;
			s._sx = p.x;
			s._sy = p.y;
			s._depth = p.depth;
			s._z2 = p.z2;
			s._bright = bright;
			s._size = size;
			hygProj.push(s);
		}
		hygProj.sort((a, b) => a._z2 - b._z2);
	}
	function drawHyg() {
		for (const s of hygProj) {
			const bright = s._bright, size = Math.max(.35, Math.min(3.6, s._size));
			const c = s.c, a = Math.max(.22, Math.min(1, (.28 + bright * .12) * Math.min(1, 1.9 - s._depth * .4)));
			const sel = s === S.hover || s === S.pinned;
			ctx.beginPath();
			ctx.arc(s._sx, s._sy, sel ? size + 1.4 : size, 0, 6.2832);
			ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a})`;
			ctx.fill();
			if (bright > 5.2 || sel) {
				ctx.beginPath();
				ctx.arc(s._sx, s._sy, size * 2.6, 0, 6.2832);
				ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a * .12})`;
				ctx.fill();
			}
			if (sel) {
				ctx.beginPath();
				ctx.arc(s._sx, s._sy, size + 7, 0, 6.2832);
				ctx.strokeStyle = "rgba(79,214,200,.9)";
				ctx.lineWidth = 1.2;
				ctx.stroke();
			}
			if (s.n && (sel || s.m < 1.7 && S.camZ < 3.2)) {
				ctx.font = (sel ? "11px" : "9.5px") + " ui-monospace,monospace";
				ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${sel ? 1 : .6})`;
				ctx.fillText(s.n, s._sx + size + 4, s._sy + 3);
			}
		}
	}
	let solarProj = [];
	function orbitR(a) {
		return scale(a * AU_PC);
	}
	function bodyPx(rk, depth) {
		const ratio = rk / 6371;
		const de = S.realScale ? depth / S.camZ * 3.2 : depth;
		const sym = Math.max(2, Math.min(Math.min(W, H) * 4, (.28 + Math.pow(ratio, .42) * .62) * foc * .02 / de));
		if (!S.realScale) return sym;
		const truePx = foc * (rk * 32408e-18) / depth;
		return Math.min(Math.max(sym, truePx), Math.min(W, H) * .75);
	}
	function saturnRings(x, y, px, A, near) {
		const R = px * 2.35 + Math.max(1, px * .11);
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(-.42);
		ctx.beginPath();
		ctx.rect(-R, near ? 0 : -R, 2 * R, R);
		ctx.clip();
		for (const rr of [
			2.35,
			1.98,
			1.55
		]) {
			ctx.beginPath();
			ctx.ellipse(0, 0, px * rr, px * rr * .34, 0, 0, 6.2832);
			ctx.strokeStyle = `rgba(226,208,160,${A * (rr > 2 ? .7 : .4)})`;
			ctx.lineWidth = Math.max(1, px * .11);
			ctx.stroke();
		}
		ctx.restore();
	}
	let _ballSun = null;
	function ballFill(x, y, r, c, A) {
		ctx.beginPath();
		ctx.arc(x, y, r, 0, 6.2832);
		if (r < 5) {
			ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${A})`;
			ctx.fill();
			return;
		}
		let lx = -.5, ly = -.5;
		if (_ballSun) {
			const dx = _ballSun.x - x, dy = _ballSun.y - y, l = Math.hypot(dx, dy);
			if (l > 1) {
				lx = dx / l;
				ly = dy / l;
			} else {
				lx = 0;
				ly = 0;
			}
		}
		const hi = c.map((v) => Math.min(255, Math.round(v * .62 + 255 * .38)));
		const lo = c.map((v) => Math.round(v * .16));
		const g = ctx.createRadialGradient(x + lx * r * .48, y + ly * r * .48, r * .08, x + lx * r * .14, y + ly * r * .14, r * 1.12);
		g.addColorStop(0, `rgba(${hi[0]},${hi[1]},${hi[2]},${A})`);
		g.addColorStop(.45, `rgba(${c[0]},${c[1]},${c[2]},${A})`);
		g.addColorStop(.8, `rgba(${Math.round(c[0] * .55)},${Math.round(c[1] * .55)},${Math.round(c[2] * .55)},${A})`);
		g.addColorStop(1, `rgba(${lo[0]},${lo[1]},${lo[2]},${A})`);
		ctx.fillStyle = g;
		ctx.fill();
	}
	function orbitRing(r, style, dash) {
		ctx.beginPath();
		let first = true;
		for (let k = 0; k <= 96; k++) {
			const th = k / 96 * 6.2832;
			const p = project(Math.cos(th) * r, 0, Math.sin(th) * r);
			if (offscr(p)) {
				first = true;
				continue;
			}
			if (first) {
				ctx.moveTo(p.x, p.y);
				first = false;
			} else ctx.lineTo(p.x, p.y);
		}
		ctx.strokeStyle = style;
		ctx.lineWidth = 1;
		if (dash) ctx.setLineDash(dash);
		ctx.stroke();
		ctx.setLineDash([]);
	}
	function drawOrbitEllipse(el, style) {
		ctx.beginPath();
		let first = true;
		for (let j = 0; j <= 120; j++) {
			const q = orbPoint(el, j / 120 * 6.2832), w = eclToWorld(q[0], q[1], q[2]);
			const p = project(w[0], w[1], w[2]);
			if (offscr(p)) {
				first = true;
				continue;
			}
			if (first) {
				ctx.moveTo(p.x, p.y);
				first = false;
			} else ctx.lineTo(p.x, p.y);
		}
		ctx.strokeStyle = style;
		ctx.lineWidth = 1;
		ctx.stroke();
	}
	function drawSolar(alpha) {
		ctx.globalAlpha = alpha;
		solarProj.length = 0;
		const A = alpha;
		updateSolarPositions(solarJD());
		orbitRing(orbitR(2.7), `rgba(150,140,120,${A * .16})`, [2, 4]);
		orbitRing(orbitR(43), `rgba(120,150,190,${A * .13})`, [2, 5]);
		if (S.hz) {
			orbitRing(orbitR(.95), `rgba(110,230,150,${A * .3})`);
			orbitRing(orbitR(1.67), `rgba(110,230,150,${A * .3})`);
			const hp = project(orbitR(1.28), 0, 0);
			if (hp.depth > NEAR) {
				ctx.font = "9px ui-monospace,monospace";
				ctx.fillStyle = `rgba(120,230,150,${A * .72})`;
				ctx.fillText("habitable zone", hp.x + 4, hp.y - 3);
			}
		}
		for (const b of SOLAR_BODIES) {
			if (outerHidden(b)) continue;
			const faint = b.kind !== "Planet";
			if (b._el) drawOrbitEllipse(b._el, faint ? `rgba(150,160,195,${A * .18})` : `rgba(150,170,210,${A * .3})`);
		}
		const sp = project(0, 0, 0);
		_ballSun = sp.depth > NEAR ? {
			x: sp.x,
			y: sp.y
		} : null;
		if (sp.depth > NEAR) {
			const spx = bodyPx(SUN.rk, sp.depth);
			const gr = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, spx * 3.2);
			gr.addColorStop(0, `rgba(255,240,190,${A * .9})`);
			gr.addColorStop(.4, `rgba(255,210,120,${A * .35})`);
			gr.addColorStop(1, "rgba(255,180,80,0)");
			ctx.fillStyle = gr;
			ctx.beginPath();
			ctx.arc(sp.x, sp.y, spx * 3.2, 0, 6.2832);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(sp.x, sp.y, spx, 0, 6.2832);
			ctx.fillStyle = `rgba(255,240,190,${A})`;
			ctx.fill();
			solarProj.push({
				o: SUN,
				x: sp.x,
				y: sp.y,
				px: spx
			});
			ctx.font = "11px ui-monospace,monospace";
			ctx.fillStyle = `rgba(255,238,178,${A * .9})`;
			ctx.fillText("Sun", sp.x + spx + 4, sp.y + 3);
			ctx.font = "9px ui-monospace,monospace";
			ctx.fillStyle = `rgba(200,208,225,${A * .6})`;
			ctx.fillText("Orbital positions · " + dateStr(solarJD()), sp.x + spx + 4, sp.y + 16);
			if (S.sunAR) drawSunspots(A, sp, spx);
		}
		const drawn = [];
		SOLAR_BODIES.forEach((b) => {
			if (!b._e || outerHidden(b)) return;
			const w = eclToWorld(b._e[0], b._e[1], b._e[2]);
			const p = project(w[0], w[1], w[2]);
			if (p.depth <= NEAR) return;
			b._p = p;
			drawn.push(b);
		});
		drawn.sort((a, b) => a._p.z2 - b._p.z2);
		for (const b of drawn) {
			const p = b._p, px = bodyPx(b.rk, p.depth), c = b.c;
			const sel = b === S.hover || b === S.pinned;
			if (b.ring) saturnRings(p.x, p.y, px, A, false);
			if (b.uring) for (const rr of [1.95, 1.55]) {
				ctx.beginPath();
				ctx.ellipse(p.x, p.y, px * rr * .32, px * rr, .36, 0, 6.2832);
				ctx.strokeStyle = `rgba(190,214,220,${A * (rr > 1.8 ? .5 : .32)})`;
				ctx.lineWidth = Math.max(1, px * .09);
				ctx.stroke();
			}
			ballFill(p.x, p.y, px, c, A);
			if (b.n === "Earth") _earthScr = px > Math.min(W, H) * .5 ? {
				x: p.x,
				y: p.y,
				r: px
			} : null;
			if (b.n === "Earth" && px >= 16) {
				let credit = null;
				_globeOn = false;
				if (px >= 26) {
					const gcv = earthGlobe(px, solarJD());
					if (gcv) {
						ctx.drawImage(gcv, p.x - px, p.y - px, px * 2, px * 2);
						_globeOn = true;
						credit = `3D · GIBS VIIRS ${_gbl.texDate} · drag to rotate — the terminator is real`;
					}
				}
				if (!_globeOn) {
					const { im, live } = earthImage(px);
					if (im) {
						ctx.save();
						ctx.beginPath();
						ctx.arc(p.x, p.y, px, 0, 6.2832);
						ctx.clip();
						ctx.drawImage(im, p.x - px, p.y - px, px * 2, px * 2);
						ctx.restore();
						credit = (live ? "GOES-East GEOCOLOR · live (~10 min)" : "NASA EPIC (DSCOVR) · daily") + (_gbl && _gbl.gl && !_gbl.texReady ? " — 3D globe loading…" : _gbl && !_gbl.gl ? " — fixed view (3D globe unavailable: WebGL)" : "");
					}
				}
				if (credit && px > 70) {
					ctx.font = "9px ui-monospace,monospace";
					ctx.fillStyle = `rgba(160,200,240,${A * .7})`;
					if (p.x + px + 8 < W) ctx.fillText(credit, p.x + px + 4, p.y + 16);
					else ctx.fillText(credit, 16, H - 64);
				}
			} else if (px >= 26 && PTEX[b.n]) {
				const gcv = bodyGlobe(b, px, solarJD());
				if (gcv) {
					ctx.drawImage(gcv, p.x - px, p.y - px, px * 2, px * 2);
					if (px > 70) {
						ctx.font = "9px ui-monospace,monospace";
						ctx.fillStyle = `rgba(160,200,240,${A * .7})`;
						const cr = "texture · Solar System Scope (CC-BY)";
						if (p.x + px + 8 < W) ctx.fillText(cr, p.x + px + 4, p.y + 16);
						else ctx.fillText(cr, 16, H - 64);
					}
				}
			}
			if (b.ring) saturnRings(p.x, p.y, px, A, true);
			if (sel) {
				ctx.beginPath();
				ctx.arc(p.x, p.y, px + 7, 0, 6.2832);
				ctx.strokeStyle = "rgba(79,214,200,.9)";
				ctx.lineWidth = 1.2;
				ctx.stroke();
			}
			solarProj.push({
				o: b,
				x: p.x,
				y: p.y,
				px
			});
			const faint = b.kind !== "Planet";
			ctx.font = (sel ? "11px" : "10px") + " ui-monospace,monospace";
			ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${A * (faint ? .72 : .95)})`;
			ctx.fillText(b.n, p.x + px + 4, p.y + 3);
			if (S.moons && b.moons.length) {
				const amMax = Math.max.apply(null, b.moons.map((m) => m.am));
				const ms = b.moons.slice().sort((x, y) => x.am - y.am);
				const jdM = solarJD();
				ms.forEach((m, mi) => {
					const msel0 = m === S.hover || m === S.pinned;
					if (m.minor && px < 13 && !msel0) return;
					const t = Math.log10(m.am + 1) / Math.log10(amMax + 1);
					const rr = px + 12 + t * Math.min(130, px * 3.2 + 80);
					const sepPx = Math.min(S.realScale ? foc * (m.am * 32408e-15) / p.depth : rr, 8 * Math.max(W, H));
					const eph = MOON_EPH[m.n];
					let mx, my;
					if (eph) {
						const d2 = camDir2(moonDirAt(eph, eph.w * (jdM - eph.ep)));
						mx = p.x + d2[0] * sepPx;
						my = p.y + d2[1] * sepPx;
						ctx.beginPath();
						for (let k = 0; k <= 24; k++) {
							const rp = camDir2(moonDirAt(eph, k / 24 * 6.2832));
							const qx = p.x + rp[0] * sepPx, qy = p.y + rp[1] * sepPx;
							if (k === 0) ctx.moveTo(qx, qy);
							else ctx.lineTo(qx, qy);
						}
						ctx.strokeStyle = `rgba(160,175,205,${A * .15})`;
						ctx.lineWidth = .6;
						ctx.stroke();
					} else {
						const ang = mi * 2.24 + .7;
						mx = p.x + Math.cos(ang) * sepPx;
						my = p.y + Math.sin(ang) * sepPx * .9;
						ctx.beginPath();
						ctx.ellipse(p.x, p.y, sepPx, sepPx * .9, -.3, 0, 6.2832);
						ctx.strokeStyle = `rgba(160,175,205,${A * .13})`;
						ctx.lineWidth = .6;
						ctx.stroke();
					}
					const mde = S.realScale ? p.depth / S.camZ * 3.2 : p.depth;
					let mpx = Math.max(1.1, Math.min(10, Math.pow(m.rk / 6371, .42) * .62 * foc * .02 / mde));
					if (S.realScale) mpx = Math.min(Math.max(mpx, foc * (m.rk * 32408e-18) / p.depth), Math.min(W, H) * .5);
					ballFill(mx, my, mpx, m.c, A);
					const msel = m === S.hover || m === S.pinned;
					if (msel) {
						ctx.beginPath();
						ctx.arc(mx, my, mpx + 5, 0, 6.2832);
						ctx.strokeStyle = "rgba(79,214,200,.9)";
						ctx.lineWidth = 1;
						ctx.stroke();
					}
					solarProj.push({
						o: m,
						x: mx,
						y: my,
						px: Math.max(4, mpx)
					});
					if ((px > 9 || msel) && (!m.minor || msel)) {
						ctx.font = "9px ui-monospace,monospace";
						ctx.fillStyle = `rgba(${m.c[0]},${m.c[1]},${m.c[2]},${A * .8})`;
						ctx.fillText(m.n, mx + mpx + 3, my + 3);
					}
				});
			}
		}
		if (S.lag) drawLagrange(A);
		const bl = project(orbitR(2.7), 0, 0);
		if (bl.depth > NEAR) {
			ctx.font = "9px ui-monospace,monospace";
			ctx.fillStyle = `rgba(170,158,130,${A * .6})`;
			ctx.fillText("Asteroid belt", bl.x + 4, bl.y - 3);
		}
		if (S.ast) drawSmall(A, solarJD());
		if (S.helio) {
			const rTS = orbitR(90), rHP = orbitR(122), sunp = project(0, 0, 0);
			if (sunp.depth > NEAR) {
				const rr = Math.abs(project(rHP, 0, 0).x - sunp.x) || 0;
				if (rr < PLIM) {
					const g = ctx.createRadialGradient(sunp.x, sunp.y, 0, sunp.x, sunp.y, rr);
					g.addColorStop(0, "rgba(90,140,220,0)");
					g.addColorStop(.72, `rgba(90,150,225,${A * .05})`);
					g.addColorStop(1, `rgba(120,170,235,${A * .11})`);
					ctx.fillStyle = g;
					ctx.beginPath();
					ctx.arc(sunp.x, sunp.y, rr, 0, 6.2832);
					ctx.fill();
				}
			}
			orbitRing(rTS, `rgba(135,195,238,${A * .5})`, [3, 5]);
			orbitRing(rHP, `rgba(165,180,242,${A * .62})`, [2, 5]);
			const ts = project(rTS, 0, 0), hp2 = project(rHP, 0, 0);
			ctx.font = "9px ui-monospace,monospace";
			if (ts.depth > NEAR) {
				ctx.fillStyle = `rgba(145,200,238,${A * .8})`;
				ctx.fillText("termination shock ~90 AU", ts.x + 4, ts.y + 11);
			}
			if (hp2.depth > NEAR) {
				ctx.fillStyle = `rgba(172,190,244,${A * .85})`;
				ctx.fillText("heliopause ~120 AU", hp2.x + 4, hp2.y - 3);
			}
		}
		if (S.probes) drawProbes(A);
		if (S.iso) drawISO(A);
		if (S.cme) drawCME(A);
		if (S.neo) {
			drawLiveNeo(A);
			drawFireballs(A);
		}
		if (S.sat) drawSats(A);
		if (TRANSFER) drawTransfer(A);
		ctx.globalAlpha = 1;
	}
	function outerHidden(b) {
		return (b.kind === "Trans-Neptunian object" || b.kind === "Centaur") && !S.tno;
	}
	function drawProbes(A) {
		const sun = project(0, 0, 0);
		const drawn = PROBES.map((p) => {
			const w = eclToWorld(p._e[0], p._e[1], p._e[2]);
			return {
				p,
				pr: project(w[0], w[1], w[2])
			};
		}).filter((d) => d.pr.depth > NEAR).sort((a, b) => a.pr.z2 - b.pr.z2);
		for (const { p, pr } of drawn) {
			const c = p.c, sel = p === S.hover || p === S.pinned;
			if (!offscr(sun) && !offscr(pr)) {
				ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${A * .16})`;
				ctx.lineWidth = .7;
				ctx.setLineDash([2, 4]);
				ctx.beginPath();
				ctx.moveTo(sun.x, sun.y);
				ctx.lineTo(pr.x, pr.y);
				ctx.stroke();
				ctx.setLineDash([]);
			}
			const sz = 4.5;
			ctx.beginPath();
			ctx.moveTo(pr.x, pr.y - sz);
			ctx.lineTo(pr.x + sz, pr.y);
			ctx.lineTo(pr.x, pr.y + sz);
			ctx.lineTo(pr.x - sz, pr.y);
			ctx.closePath();
			ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${A})`;
			ctx.fill();
			if (sel) {
				ctx.beginPath();
				ctx.arc(pr.x, pr.y, 10.5, 0, 6.2832);
				ctx.strokeStyle = "rgba(79,214,200,.9)";
				ctx.lineWidth = 1.2;
				ctx.stroke();
			}
			solarProj.push({
				o: p,
				x: pr.x,
				y: pr.y,
				px: Math.max(7, 7.5)
			});
			ctx.font = (sel ? "10px" : "9px") + " ui-monospace,monospace";
			ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${A * .92})`;
			ctx.fillText(p.n, pr.x + sz + 4, pr.y + 3);
		}
	}
	const ISO = [
		{
			n: "1I/ʻOumuamua",
			q: .255343,
			e: 1.20113,
			i: 122.7417,
			om: 24.5997,
			w: 241.8105,
			tp: 2458005.99,
			rk: .11,
			note: "first interstellar visitor (2017) — elongated, tumbling, origin still debated"
		},
		{
			n: "2I/Borisov",
			q: 2.00664,
			e: 3.3565,
			i: 44.0526,
			om: 308.149,
			w: 209.1246,
			tp: 2458826.05,
			rk: .4,
			note: "first clearly cometary interstellar visitor (2019)"
		},
		{
			n: "3I/ATLAS",
			q: 1.35638,
			e: 6.1395,
			i: 175.1131,
			om: 322.1577,
			w: 127.9889,
			tp: 2460978.03,
			rk: 1.4,
			note: "third interstellar visitor (2025) — fastest yet, ~58 km/s hyperbolic excess"
		}
	];
	ISO.forEach((o) => {
		o.kind = "Interstellar object";
		o.c = [
			110,
			255,
			180
		];
		o.iso = true;
	});
	function isoEcl(o, jd) {
		const a = o.q / (1 - o.e), M = .01720209895 / Math.sqrt(-a * a * a) * (jd - o.tp);
		let H = Math.sign(M || 1) * Math.log(2 * Math.abs(M) / o.e + 1.8);
		for (let k = 0; k < 40; k++) {
			const d = (o.e * Math.sinh(H) - H - M) / (o.e * Math.cosh(H) - 1);
			H -= d;
			if (Math.abs(d) < 1e-12) break;
		}
		const nu = 2 * Math.atan(Math.sqrt((o.e + 1) / (o.e - 1)) * Math.tanh(H / 2)), r = a * (1 - o.e * Math.cosh(H));
		const xw = r * Math.cos(nu), yw = r * Math.sin(nu);
		const cw = Math.cos(o.w * D2R), sw = Math.sin(o.w * D2R), ci = Math.cos(o.i * D2R), si = Math.sin(o.i * D2R), cO = Math.cos(o.om * D2R), sO = Math.sin(o.om * D2R);
		return [
			(cO * cw - sO * sw * ci) * xw + (-cO * sw - sO * cw * ci) * yw,
			(sO * cw + cO * sw * ci) * xw + (-sO * sw + cO * cw * ci) * yw,
			sw * si * xw + cw * si * yw
		];
	}
	function drawISO(A) {
		const jd = solarJD();
		for (const o of ISO) {
			o._e = isoEcl(o, jd);
			o._r = Math.hypot(o._e[0], o._e[1], o._e[2]);
			if (!o._path) {
				o._path = [];
				for (let k = 0; k <= 120; k++) {
					const e2 = isoEcl(o, o.tp - 1460 + k / 120 * 2920);
					o._path.push(Math.hypot(e2[0], e2[1], e2[2]) <= 35 ? e2 : null);
				}
			}
			ctx.setLineDash([4, 4]);
			ctx.beginPath();
			let first = true;
			for (const e2 of o._path) {
				if (!e2) {
					first = true;
					continue;
				}
				const w = eclToWorld(e2[0], e2[1], e2[2]), p = project(w[0], w[1], w[2]);
				if (p.depth <= NEAR || offscr(p)) {
					first = true;
					continue;
				}
				if (first) {
					ctx.moveTo(p.x, p.y);
					first = false;
				} else ctx.lineTo(p.x, p.y);
			}
			ctx.strokeStyle = `rgba(110,255,180,${A * .42})`;
			ctx.lineWidth = 1;
			ctx.stroke();
			ctx.setLineDash([]);
			const w = eclToWorld(o._e[0], o._e[1], o._e[2]), p = project(w[0], w[1], w[2]);
			if (p.depth <= NEAR || offscr(p)) continue;
			const sel = o === S.hover || o === S.pinned, sz = sel ? 6 : 5;
			ctx.beginPath();
			ctx.moveTo(p.x, p.y - sz);
			ctx.lineTo(p.x + sz, p.y);
			ctx.lineTo(p.x, p.y + sz);
			ctx.lineTo(p.x - sz, p.y);
			ctx.closePath();
			ctx.fillStyle = `rgba(110,255,180,${A})`;
			ctx.fill();
			ctx.beginPath();
			ctx.arc(p.x, p.y, sz + 4, 0, 6.2832);
			ctx.strokeStyle = `rgba(110,255,180,${A * (sel ? .9 : .45)})`;
			ctx.lineWidth = 1.1;
			ctx.stroke();
			solarProj.push({
				o,
				x: p.x,
				y: p.y,
				px: sz + 5
			});
			ctx.font = (sel ? "10px" : "9px") + " ui-monospace,monospace";
			ctx.fillStyle = `rgba(150,255,200,${A * .95})`;
			ctx.fillText(o.n + " · interstellar", p.x + sz + 4, p.y + 3);
		}
	}
	function drawSmall(A, jd) {
		const sun = project(0, 0, 0);
		for (const o of SMALL) {
			o._el = keplerSB(o.kd, jd);
			o._e = orbPoint(o._el, o._el.E);
			o._r = Math.hypot(o._e[0], o._e[1], o._e[2]);
			const com = o.t === "COM", bulk = o.t === "COM2";
			if (!bulk || o === S.hover || o === S.pinned) drawOrbitEllipse(o._el, com || bulk ? `rgba(120,210,228,${A * (bulk ? .3 : .26)})` : `rgba(172,166,150,${A * .18})`);
		}
		const drawn = SMALL.map((o) => {
			const w = eclToWorld(o._e[0], o._e[1], o._e[2]);
			return {
				o,
				p: project(w[0], w[1], w[2])
			};
		}).filter((d) => d.p.depth > NEAR).sort((a, b) => a.p.z2 - b.p.z2);
		for (const { o, p } of drawn) {
			const com = o.t === "COM", bulk = o.t === "COM2";
			const c = com ? [
				135,
				222,
				234
			] : bulk ? [
				110,
				190,
				205
			] : [
				190,
				180,
				158
			];
			const px = bulk ? 1.8 : Math.max(2.2, Math.min(6, 3 * A + (com ? 1 : 0)));
			if (com && sun.depth > NEAR) {
				let tx = p.x - sun.x, ty = p.y - sun.y, tl = Math.hypot(tx, ty) || 1;
				tx /= tl;
				ty /= tl;
				const g = ctx.createLinearGradient(p.x, p.y, p.x + tx * 22, p.y + ty * 22);
				g.addColorStop(0, `rgba(150,230,240,${A * .6})`);
				g.addColorStop(1, "rgba(150,230,240,0)");
				ctx.strokeStyle = g;
				ctx.lineWidth = 2.4;
				ctx.beginPath();
				ctx.moveTo(p.x, p.y);
				ctx.lineTo(p.x + tx * 22, p.y + ty * 22);
				ctx.stroke();
			}
			const sel = o === S.hover || o === S.pinned;
			ctx.beginPath();
			ctx.arc(p.x, p.y, px, 0, 6.2832);
			ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${A})`;
			ctx.fill();
			if (sel) {
				ctx.beginPath();
				ctx.arc(p.x, p.y, px + 5, 0, 6.2832);
				ctx.strokeStyle = "rgba(79,214,200,.9)";
				ctx.lineWidth = 1.1;
				ctx.stroke();
			}
			solarProj.push({
				o,
				x: p.x,
				y: p.y,
				px: Math.max(6, px)
			});
			if ((A > .5 || sel) && (!bulk || sel)) {
				ctx.font = (sel ? "10px" : "8.5px") + " ui-monospace,monospace";
				ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${sel ? 1 : .72})`;
				ctx.fillText(o.n, p.x + px + 3, p.y + 3);
			}
		}
	}
	function cmeSolarMs() {
		return (solarJD() - 2440587.5) * 864e5;
	}
	function drawCME(A) {
		if (!LIVE.cmes.length) return;
		const earth = PLANETS.find((p) => p.n === "Earth");
		if (!earth || !earth._e) return;
		const nowMs = cmeSolarMs(), lamE = Math.atan2(earth._e[1], earth._e[0]);
		const cE = Math.cos(lamE), sE = Math.sin(lamE);
		for (const c of LIVE.cmes) {
			const dt = (nowMs - c.t) / 1e3;
			if (dt <= 0) continue;
			const rAU = .1 + c.v * dt / 1496e5;
			if (rAU > 2.6) continue;
			const fade = Math.max(0, Math.min(1, (2.6 - rAU) / .7));
			const la = c.lat * D2R, lo = c.lon * D2R, cb = Math.cos(la);
			const hx = cb * Math.cos(lo), hy = cb * Math.sin(lo), hz = Math.sin(la);
			const d = [
				hx * cE - hy * sE,
				hx * sE + hy * cE,
				hz
			];
			let u = [
				-d[1],
				d[0],
				0
			];
			const ul = Math.hypot(u[0], u[1], u[2]) || 1;
			u = [
				u[0] / ul,
				u[1] / ul,
				u[2] / ul
			];
			const v = [
				d[1] * u[2] - d[2] * u[1],
				d[2] * u[0] - d[0] * u[2],
				d[0] * u[1] - d[1] * u[0]
			];
			const col = c.v >= 800 ? [
				255,
				96,
				80
			] : c.v >= 500 ? [
				255,
				150,
				80
			] : [
				255,
				200,
				110
			];
			const H = Math.min(1.2, c.half * D2R), cH = Math.cos(H), sH = Math.sin(H);
			if (rAU < .11) continue;
			const sunp = project(0, 0, 0);
			const fw = eclToWorld(rAU * d[0], rAU * d[1], rAU * d[2]), fp = project(fw[0], fw[1], fw[2]);
			const rim = [];
			let rimVis = 0;
			for (let k = 0; k <= 48; k++) {
				const th = k / 48 * 6.2832, ct = Math.cos(th), st = Math.sin(th);
				const w = eclToWorld(rAU * (cH * d[0] + sH * (ct * u[0] + st * v[0])), rAU * (cH * d[1] + sH * (ct * u[1] + st * v[1])), rAU * (cH * d[2] + sH * (ct * u[2] + st * v[2]))), p = project(w[0], w[1], w[2]);
				if (p.depth <= NEAR || offscr(p)) {
					rim.push(null);
					continue;
				}
				rim.push(p);
				rimVis++;
			}
			if (sunp.depth > NEAR && !offscr(sunp) && fp.depth > NEAR && !offscr(fp) && rimVis === 49) {
				const g = ctx.createLinearGradient(sunp.x, sunp.y, fp.x, fp.y);
				g.addColorStop(0, `rgba(${col[0]},${col[1]},${col[2]},0)`);
				g.addColorStop(.6, `rgba(${col[0]},${col[1]},${col[2]},${A * fade * .09})`);
				g.addColorStop(.93, `rgba(${col[0]},${col[1]},${col[2]},${A * fade * .26})`);
				g.addColorStop(1, `rgba(${col[0]},${col[1]},${col[2]},0)`);
				ctx.beginPath();
				ctx.moveTo(sunp.x, sunp.y);
				for (const p of rim) ctx.lineTo(p.x, p.y);
				ctx.closePath();
				ctx.fillStyle = g;
				ctx.fill();
			}
			if (sunp.depth > NEAR) {
				ctx.lineWidth = 1.1;
				ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${A * fade * .38})`;
				ctx.beginPath();
				for (let i = 0; i < 12; i++) {
					const th = i / 12 * 6.2832 + .35, ct = Math.cos(th), st = Math.sin(th);
					const mH = H * (.25 + i * 17 % 13 / 13 * .72), cM = Math.cos(mH), sM = Math.sin(mH);
					const dx = cM * d[0] + sM * (ct * u[0] + st * v[0]), dy = cM * d[1] + sM * (ct * u[1] + st * v[1]), dz = cM * d[2] + sM * (ct * u[2] + st * v[2]);
					const r2 = rAU * (.72 + i * 37 % 23 / 23 * .2), r1 = r2 * .42;
					const w1 = eclToWorld(r1 * dx, r1 * dy, r1 * dz), p1 = project(w1[0], w1[1], w1[2]);
					const w2 = eclToWorld(r2 * dx, r2 * dy, r2 * dz), p2 = project(w2[0], w2[1], w2[2]);
					if (p1.depth > NEAR && p2.depth > NEAR && !offscr(p1) && !offscr(p2)) {
						ctx.moveTo(p1.x, p1.y);
						ctx.lineTo(p2.x, p2.y);
					}
				}
				ctx.stroke();
			}
			ctx.beginPath();
			let first = true;
			for (const p of rim) {
				if (!p) {
					first = true;
					continue;
				}
				if (first) {
					ctx.moveTo(p.x, p.y);
					first = false;
				} else ctx.lineTo(p.x, p.y);
			}
			ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${A * fade * .14})`;
			ctx.lineWidth = 5.5;
			ctx.stroke();
			ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${A * fade * .75})`;
			ctx.lineWidth = 1.7;
			ctx.stroke();
			const tw = eclToWorld(rAU * d[0], rAU * d[1], rAU * d[2]), tp = project(tw[0], tw[1], tw[2]);
			if (tp.depth > NEAR) {
				if (!c._o) c._o = {
					cme: c,
					n: "Coronal mass ejection",
					c: col
				};
				const sel = c._o === S.hover || c._o === S.pinned;
				ctx.font = (sel ? "10px" : "9px") + " ui-monospace,monospace";
				ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${A * fade * (sel ? 1 : .85)})`;
				ctx.fillText(`CME · ${Math.round(c.v)} km/s${c.earthDir ? " · → Earth" : ""}`, tp.x + 6, tp.y - 4);
				if (sel) {
					ctx.beginPath();
					ctx.arc(tp.x, tp.y, 9, 0, 6.2832);
					ctx.strokeStyle = "rgba(79,214,200,.9)";
					ctx.lineWidth = 1.1;
					ctx.stroke();
				}
				solarProj.push({
					o: c._o,
					x: tp.x,
					y: tp.y,
					px: 12
				});
			}
		}
	}
	function drawLiveNeo(A) {
		if (!LIVE.neos.length) return;
		const jd = solarJD(), nowMs = cmeSolarMs();
		const earth = PLANETS.find((p) => p.n === "Earth");
		let ep = null;
		if (earth && earth._e) {
			const w = eclToWorld(earth._e[0], earth._e[1], earth._e[2]);
			const p = project(w[0], w[1], w[2]);
			if (p.depth > NEAR) ep = p;
		}
		for (const o of LIVE.neos) {
			if (!o.kd) continue;
			o._el = keplerSB(o.kd, jd);
			o._e = orbPoint(o._el, o._el.E);
			o._r = Math.hypot(o._e[0], o._e[1], o._e[2]);
			const sel = o === S.hover || o === S.pinned;
			drawOrbitEllipse(o._el, `rgba(255,168,88,${A * (sel ? .55 : .2)})`);
			const w = eclToWorld(o._e[0], o._e[1], o._e[2]), p = project(w[0], w[1], w[2]);
			if (p.depth <= NEAR) continue;
			const dtd = (o.t - nowMs) / 864e5;
			if (ep && Math.abs(dtd) < 5 && !offscr(ep) && !offscr(p)) {
				ctx.setLineDash([3, 4]);
				ctx.strokeStyle = `rgba(255,168,88,${A * .3})`;
				ctx.lineWidth = .8;
				ctx.beginPath();
				ctx.moveTo(ep.x, ep.y);
				ctx.lineTo(p.x, p.y);
				ctx.stroke();
				ctx.setLineDash([]);
			}
			const px = sel ? 6 : 4.5;
			ctx.beginPath();
			ctx.moveTo(p.x, p.y - px);
			ctx.lineTo(p.x + px, p.y);
			ctx.lineTo(p.x, p.y + px);
			ctx.lineTo(p.x - px, p.y);
			ctx.closePath();
			ctx.strokeStyle = `rgba(255,178,96,${A * (sel ? 1 : .9)})`;
			ctx.lineWidth = 1.3;
			ctx.stroke();
			if (o.pha || o.sentry) {
				ctx.beginPath();
				ctx.arc(p.x, p.y, px + 3.5, 0, 6.2832);
				ctx.strokeStyle = `rgba(255,110,90,${A * .7})`;
				ctx.lineWidth = .9;
				ctx.stroke();
			}
			if (sel) {
				ctx.beginPath();
				ctx.arc(p.x, p.y, px + 7, 0, 6.2832);
				ctx.strokeStyle = "rgba(79,214,200,.9)";
				ctx.lineWidth = 1.2;
				ctx.stroke();
			}
			const rel = Math.abs(dtd) < .04 ? "now" : dtd > 0 ? `in ${dtd >= 1 ? Math.floor(dtd) + "d " : ""}${Math.round(dtd % 1 * 24)}h` : `${Math.abs(dtd).toFixed(1)}d ago`;
			const ldStr = o.ld < 10 ? o.ld.toFixed(1) : Math.round(o.ld);
			ctx.font = (sel ? "10px" : "9px") + " ui-monospace,monospace";
			ctx.fillStyle = `rgba(255,190,120,${A * (sel ? 1 : .8)})`;
			ctx.fillText(`${o.n} · ${rel} · ${ldStr} LD`, p.x + px + 4, p.y + 3);
			solarProj.push({
				o,
				x: p.x,
				y: p.y,
				px: Math.max(8, px + 3)
			});
		}
	}
	let _epicImg = null, _epicState = 0;
	function epicImage() {
		if (_epicState === 0 && LIVE.epic) {
			_epicState = 1;
			const im = new Image();
			im.crossOrigin = "anonymous";
			im.onload = () => {
				_epicImg = im;
				dirty = true;
			};
			im.onerror = () => {
				_epicState = 2;
			};
			im.src = LIVE.epic.url;
		}
		return _epicImg;
	}
	let _goesImg = null, _goesLoading = false, _goesTs = 0, _goesHi = false, _goesFail = 0;
	function loadGoes(res) {
		if (_goesLoading) return;
		_goesLoading = true;
		const im = new Image();
		im.crossOrigin = "anonymous";
		im.onload = () => {
			_goesImg = im;
			_goesTs = Date.now();
			_goesHi = res > 2e3;
			_goesLoading = false;
			dirty = true;
		};
		im.onerror = () => {
			_goesLoading = false;
			_goesFail++;
		};
		im.src = `https://cdn.star.nesdis.noaa.gov/GOES19/ABI/FD/GEOCOLOR/${res}x${res}.jpg?t=` + Math.floor(Date.now() / 6e5);
	}
	function earthImage(px) {
		if (_goesFail > 1) return {
			im: epicImage(),
			live: false
		};
		const wantHi = px > 420;
		if (!_goesImg || Date.now() - _goesTs > 600 * 1e3 || wantHi && !_goesHi) loadGoes(wantHi ? 5424 : 1808);
		return _goesImg ? {
			im: _goesImg,
			live: true
		} : {
			im: epicImage(),
			live: false
		};
	}
	let _gbl = null, _globeOn = false;
	function gmstRad(jd) {
		let g = (280.46061837 + 360.98564736629 * (jd - 2451545)) % 360;
		if (g < 0) g += 360;
		return g * D2R;
	}
	const OBLQ = 23.439 * Math.PI / 180;
	function globeViewRows() {
		const cy = Math.cos(S.yaw), sy = Math.sin(S.yaw), cp = Math.cos(S.pitch), sp = Math.sin(S.pitch);
		return [
			[
				cy,
				0,
				sy
			],
			[
				sy * sp,
				cp,
				-cy * sp
			],
			[
				-sy * cp,
				sp,
				cy * cp
			]
		];
	}
	function globeModelRows(t, eps) {
		const ct = Math.cos(t), st = Math.sin(t), ce = Math.cos(eps), se = Math.sin(eps);
		return [
			[
				ct,
				-st,
				0
			],
			[
				-se * st,
				-se * ct,
				ce
			],
			[
				ce * st,
				ce * ct,
				se
			]
		];
	}
	const rows2col = (r) => [
		r[0][0],
		r[1][0],
		r[2][0],
		r[0][1],
		r[1][1],
		r[2][1],
		r[0][2],
		r[1][2],
		r[2][2]
	];
	let _gblFails = 0, _gblNextTry = 0;
	function globeInit() {
		if (_gbl !== null) {
			if (_gbl.gl) return _gbl;
			if (_gblFails >= 5 || performance.now() < _gblNextTry) return null;
			_gbl = null;
		}
		const fail = (msg) => {
			_gbl = { gl: null };
			_gblFails++;
			_gblNextTry = performance.now() + 4e3;
			try {
				console.warn(msg);
			} catch (e) {}
			return null;
		};
		const cv2 = document.createElement("canvas");
		const gl = cv2.getContext("webgl", {
			alpha: true,
			antialias: true
		});
		if (!gl) return fail("globe: no WebGL context");
		const mk = (t, src) => {
			const sh = gl.createShader(t);
			gl.shaderSource(sh, src);
			gl.compileShader(sh);
			if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
				console.warn(gl.getShaderInfoLog(sh));
				return null;
			}
			return sh;
		};
		const vsh = mk(gl.VERTEX_SHADER, `attribute vec3 aP; uniform mat3 uV,uM; varying vec3 vS;
    void main(){ vS=aP; vec3 q=uV*(uM*aP); gl_Position=vec4(q.x,q.y,-q.z*0.5,1.0); }`);
		const fsh = mk(gl.FRAGMENT_SHADER, `precision mediump float; varying vec3 vS;
    uniform highp mat3 uV,uM; uniform vec3 uSun; uniform sampler2D uT;
    void main(){
      vec3 n=normalize(vS);
      vec2 uv=vec2(0.5+atan(n.y,n.x)/6.2831853, 0.5-asin(clamp(n.z,-1.0,1.0))/3.14159265);
      vec3 tex=texture2D(uT,uv).rgb;
      vec3 wn=normalize(uM*n);
      float d=dot(wn,uSun);
      float day=smoothstep(-0.08,0.12,d);
      vec3 lit=tex*(0.16+0.92*max(d,0.0));
      vec3 night=tex*0.05+vec3(0.008,0.012,0.028);
      vec3 col=mix(night,lit,day);
      vec3 vn=uV*wn;                                        // subtle atmosphere at the limb
      col+=vec3(0.10,0.22,0.45)*pow(1.0-clamp(vn.z,0.0,1.0),3.0)*(0.25+0.75*day)*0.35;
      gl_FragColor=vec4(col,1.0);
    }`);
		if (!vsh || !fsh) return fail("globe: shader compile failed");
		const pr = gl.createProgram();
		gl.attachShader(pr, vsh);
		gl.attachShader(pr, fsh);
		gl.linkProgram(pr);
		if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return fail("globe: link failed");
		_gblFails = 0;
		const ST = 48, SL = 96, pos = [], idx = [];
		for (let i = 0; i <= ST; i++) {
			const ph = Math.PI * (i / ST - .5), cp2 = Math.cos(ph);
			for (let j = 0; j <= SL; j++) {
				const la = 2 * Math.PI * j / SL;
				pos.push(cp2 * Math.cos(la), cp2 * Math.sin(la), Math.sin(ph));
			}
		}
		for (let i = 0; i < ST; i++) for (let j = 0; j < SL; j++) {
			const a = i * 97 + j, b = a + SL + 1;
			idx.push(a, b, a + 1, a + 1, b, b + 1);
		}
		const vb = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vb);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
		const ib = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
		const tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([
			30,
			50,
			90,
			255
		]));
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.enable(gl.DEPTH_TEST);
		const aP = gl.getAttribLocation(pr, "aP");
		_gbl = {
			cv: cv2,
			gl,
			pr,
			vb,
			ib,
			nIdx: idx.length,
			tex,
			aP,
			uV: gl.getUniformLocation(pr, "uV"),
			uM: gl.getUniformLocation(pr, "uM"),
			uSun: gl.getUniformLocation(pr, "uSun"),
			uT: gl.getUniformLocation(pr, "uT"),
			texReady: false,
			loading: false,
			texDate: ""
		};
		return _gbl;
	}
	function mosaicGaps(cnv) {
		const c = document.createElement("canvas");
		c.width = 128;
		c.height = 64;
		const g2 = c.getContext("2d");
		g2.drawImage(cnv, 0, 0, 128, 64);
		const d = g2.getImageData(0, 12, 128, 40).data;
		let black = 0, n = 0;
		for (let i = 0; i < d.length; i += 4) {
			n++;
			if (d[i] + d[i + 1] + d[i + 2] < 24) black++;
		}
		return black / n;
	}
	function globeTexture() {
		const g = _gbl;
		if (!g || g.loading || g.texReady) return;
		if (g.nextTexTry && performance.now() < g.nextTexTry) return;
		g.loading = true;
		const finish = () => {
			const b = g.best;
			if (!b) {
				g.loading = false;
				g.nextTexTry = performance.now() + 3e4;
				try {
					console.warn("globe: mosaic unavailable, retrying in 30 s");
				} catch (e) {}
				return;
			}
			const sc = document.createElement("canvas");
			sc.width = 4096;
			sc.height = 2048;
			sc.getContext("2d").drawImage(b.cnv, 0, 0, 4096, 2048);
			const gl = g.gl;
			gl.bindTexture(gl.TEXTURE_2D, g.tex);
			try {
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sc);
				g.texReady = true;
				g.texDate = b.date;
				SURF.dayOff = Math.max(SURF.dayOff, b.off);
				try {
					console.log("globe: mosaic ready ·", b.date, "·", (b.frac * 100).toFixed(1) + "% gaps");
				} catch (e) {}
			} catch (e) {
				try {
					console.warn("globe: texture upload failed", e);
				} catch (e2) {}
			}
			g.best = null;
			g.loading = false;
			dirty = true;
		};
		const tryDay = (off) => {
			if (off > 5) {
				finish();
				return;
			}
			const date = (/* @__PURE__ */ new Date(Date.now() - off * 864e5)).toISOString().slice(0, 10);
			const cnv = document.createElement("canvas");
			cnv.width = 5120;
			cnv.height = 2560;
			const c2 = cnv.getContext("2d");
			let n = 0, failed = false;
			for (let r = 0; r < 5; r++) for (let c = 0; c < 10; c++) {
				const im = new Image();
				im.crossOrigin = "anonymous";
				im.onload = () => {
					if (failed) return;
					c2.drawImage(im, c * 512, r * 512);
					if (++n === 50) {
						let frac = 0;
						try {
							frac = mosaicGaps(cnv);
						} catch (e) {}
						if (!g.best || frac < g.best.frac) g.best = {
							cnv,
							frac,
							date,
							off
						};
						if (frac > .06) {
							try {
								console.log("globe: mosaic", date, "is", (frac * 100).toFixed(0) + "% black — trying an earlier day");
							} catch (e) {}
							tryDay(off + 1);
							return;
						}
						finish();
					}
				};
				im.onerror = () => {
					if (!failed) {
						failed = true;
						tryDay(off + 1);
					}
				};
				im.src = `https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/${date}/250m/3/${r}/${c}.jpg`;
			}
		};
		tryDay(SURF.dayOff || 1);
	}
	function renderGlobe(px, tex, Mrows, body) {
		const g = globeInit();
		if (!g) return null;
		const dpr = Math.min(2, window.devicePixelRatio || 1);
		const size = Math.max(64, Math.min(2048, Math.ceil(px * 2 * dpr)));
		if (g.cv.width !== size) g.cv.width = g.cv.height = size;
		const gl = g.gl;
		gl.viewport(0, 0, size, size);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.useProgram(g.pr);
		gl.bindBuffer(gl.ARRAY_BUFFER, g.vb);
		gl.enableVertexAttribArray(g.aP);
		gl.vertexAttribPointer(g.aP, 3, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, g.ib);
		gl.uniformMatrix3fv(g.uV, false, rows2col(globeViewRows()));
		gl.uniformMatrix3fv(g.uM, false, rows2col(Mrows));
		let sun = [
			0,
			0,
			1
		];
		if (body && body._e) {
			const w = [
				-body._e[0],
				-body._e[2],
				-body._e[1]
			];
			const l = Math.hypot(w[0], w[1], w[2]) || 1;
			sun = [
				w[0] / l,
				w[1] / l,
				w[2] / l
			];
		}
		gl.uniform3fv(g.uSun, sun);
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.uniform1i(g.uT, 0);
		gl.drawElements(gl.TRIANGLES, g.nIdx, gl.UNSIGNED_SHORT, 0);
		return g.cv;
	}
	function earthGlobe(px, jd) {
		const g = globeInit();
		if (!g) return null;
		if (!g.texReady) {
			globeTexture();
			return null;
		}
		const earth = PLANETS.find((p) => p.n === "Earth");
		return renderGlobe(px, g.tex, globeModelRows(gmstRad(jd), OBLQ), earth);
	}
	const PTEX = {
		Mercury: [
			"mercury",
			58.646,
			.001
		],
		Venus: [
			"venus",
			-243.02,
			3.096
		],
		Mars: [
			"mars",
			1.02596,
			.4396
		],
		Jupiter: [
			"jupiter",
			.41354,
			.0546
		],
		Saturn: [
			"saturn",
			.44401,
			.4665
		],
		Uranus: [
			"uranus",
			-.71833,
			1.706
		],
		Neptune: [
			"neptune",
			.67125,
			.4943
		]
	};
	function bodyGlobe(b, px, jd) {
		const cfg = PTEX[b.n];
		if (!cfg) return null;
		const g = globeInit();
		if (!g) return null;
		if (!g.pt) g.pt = {};
		let t = g.pt[cfg[0]];
		if (!t) {
			t = g.pt[cfg[0]] = {
				tex: null,
				ready: false
			};
			const im = new Image();
			im.onload = () => {
				try {
					const gl = g.gl, tx = gl.createTexture();
					gl.bindTexture(gl.TEXTURE_2D, tx);
					gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
					t.tex = tx;
					t.ready = true;
					dirty = true;
				} catch (e) {}
			};
			im.src = "data/tex/" + cfg[0] + ".jpg";
		}
		if (!t.ready) return null;
		const rot = jd / cfg[1] % 1 * 6.283185307;
		return renderGlobe(px, t.tex, globeModelRows(rot, cfg[2]), b);
	}
	function globeInverse(u, v) {
		const rho = Math.hypot(u, v);
		if (rho >= 1) return null;
		const nv = [
			u,
			-v,
			Math.sqrt(1 - rho * rho)
		];
		const V = globeViewRows(), M = globeModelRows(gmstRad(solarJD()), OBLQ);
		const wrl = [
			V[0][0] * nv[0] + V[1][0] * nv[1] + V[2][0] * nv[2],
			V[0][1] * nv[0] + V[1][1] * nv[1] + V[2][1] * nv[2],
			V[0][2] * nv[0] + V[1][2] * nv[1] + V[2][2] * nv[2]
		];
		const geo = [
			M[0][0] * wrl[0] + M[1][0] * wrl[1] + M[2][0] * wrl[2],
			M[0][1] * wrl[0] + M[1][1] * wrl[1] + M[2][1] * wrl[2],
			M[0][2] * wrl[0] + M[1][2] * wrl[1] + M[2][2] * wrl[2]
		];
		return [Math.asin(Math.max(-1, Math.min(1, geo[2]))) / D2R, Math.atan2(geo[1], geo[0]) / D2R];
	}
	const SURF = {
		on: false,
		lat: 20,
		lon: -75,
		cache: /* @__PURE__ */ new Map(),
		order: [],
		dayOff: 2
	};
	const SURF_ENTER = .003, SURF_EXIT = .0033, GOES_LON = -75.2, RE_PC = 20646e-14;
	let _earthScr = null;
	function surfEnterZ() {
		return S.realScale ? 2 * foc * RE_PC / (Math.min(W, H) * 1.2) : SURF_ENTER;
	}
	function surfDate() {
		return (/* @__PURE__ */ new Date(Date.now() - SURF.dayOff * 864e5)).toISOString().slice(0, 10);
	}
	function surfMpp() {
		if (S.realScale) return 12742e3 * S.camZ / (2 * foc * RE_PC);
		return 12742e3 / (8 * Math.min(W, H)) * (S.camZ / SURF_ENTER);
	}
	function surfUpdate() {
		const enterZ = surfEnterZ();
		if (!SURF.on) {
			if (S.camZ < enterZ && _earthScr) {
				const u = (cx - _earthScr.x) / _earthScr.r, v = (cy - _earthScr.y) / _earthScr.r;
				const rho = Math.hypot(u, v);
				if (rho < .985) {
					const gi = _globeOn ? globeInverse(u, v) : null;
					if (gi) {
						SURF.lat = gi[0];
						SURF.lon = gi[1];
					} else {
						const c = Math.asin(Math.min(1, rho));
						SURF.lat = rho < 1e-6 ? 0 : Math.asin(-v * Math.sin(c) / rho) / D2R;
						SURF.lon = GOES_LON + (rho < 1e-6 ? 0 : Math.atan2(u * Math.sin(c), rho * Math.cos(c)) / D2R);
					}
					SURF.on = true;
				} else S.camZ = tgtCamZ = enterZ;
			}
		} else if (S.camZ > (S.realScale ? enterZ * 1.1 : SURF_EXIT)) SURF.on = false;
		return SURF.on;
	}
	function surfTile(z, x, y) {
		const n = 1 << z;
		x = (x % n + n) % n;
		if (y < 0 || y >= n) return null;
		const url = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/${surfDate()}/GoogleMapsCompatible_Level9/${z}/${y}/${x}.jpg`;
		let t = SURF.cache.get(url);
		if (!t) {
			t = {
				im: new Image(),
				ok: false
			};
			t.im.crossOrigin = "anonymous";
			t.im.onload = () => {
				t.ok = true;
				dirty = true;
			};
			const day = SURF.dayOff;
			t.im.onerror = () => {
				if (day === SURF.dayOff && SURF.dayOff < 4) {
					SURF.dayOff++;
					SURF.cache.clear();
					SURF.order.length = 0;
					dirty = true;
				}
			};
			t.im.src = url;
			SURF.cache.set(url, t);
			SURF.order.push(url);
			if (SURF.order.length > 260) SURF.cache.delete(SURF.order.shift());
		}
		return t.ok ? t.im : null;
	}
	function drawSurface() {
		const mpp = surfMpp(), latR = SURF.lat * D2R;
		const zf = Math.log2(156543.034 * Math.cos(latR) / mpp);
		const zt = Math.max(2, Math.min(9, Math.round(zf)));
		const ts = 256 * Math.pow(2, zf - zt);
		const n = 1 << zt;
		const wx = (SURF.lon + 180) / 360 * n;
		const sy = Math.sin(latR);
		const wy = (.5 - Math.log((1 + sy) / (1 - sy)) / (4 * Math.PI)) * n;
		ctx.fillStyle = "#04070f";
		ctx.fillRect(0, 0, W, H);
		const x0 = Math.floor(wx - cx / ts), x1 = Math.ceil(wx + (W - cx) / ts);
		const y0 = Math.floor(wy - cy / ts), y1 = Math.ceil(wy + (H - cy) / ts);
		for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
			const im = surfTile(zt, tx, ty);
			if (!im) continue;
			ctx.drawImage(im, cx + (tx - wx) * ts, cy + (ty - wy) * ts, ts + .6, ts + .6);
		}
		ctx.font = "10px ui-monospace,monospace";
		ctx.fillStyle = "rgba(200,214,240,0.85)";
		ctx.fillText(`Earth surface · ${SURF.lat.toFixed(2)}°, ${SURF.lon.toFixed(2)}° · ${mpp < 1e3 ? Math.round(mpp) + " m" : (mpp / 1e3).toFixed(1) + " km"}/px`, 16, H - 46);
		ctx.fillStyle = "rgba(150,165,195,0.6)";
		ctx.fillText(`NASA GIBS · VIIRS true color · ${surfDate()} — drag to pan · scroll out to leave`, 16, H - 32);
		dirty = SURF.cache.size < 4 ? true : dirty;
	}
	function surfPan(dx, dy) {
		const mpp = surfMpp(), latR = SURF.lat * D2R;
		SURF.lon -= dx * mpp / (111320 * Math.cos(latR));
		SURF.lat += dy * mpp / 110540;
		SURF.lat = Math.max(-84, Math.min(84, SURF.lat));
		SURF.lon = (SURF.lon + 540) % 360 - 180;
		dirty = true;
	}
	function dirScreen(u) {
		const cyw = Math.cos(S.yaw), syw = Math.sin(S.yaw), cp2 = Math.cos(S.pitch), sp2 = Math.sin(S.pitch);
		const x1 = u[0] * cyw + u[2] * syw, z1 = -u[0] * syw + u[2] * cyw;
		return [
			x1,
			-(u[1] * cp2 - z1 * sp2),
			u[1] * sp2 + z1 * cp2
		];
	}
	function stonyhurstEcl(latDeg, lonDeg, lamE) {
		const la = latDeg * D2R, lo = lonDeg * D2R, cb = Math.cos(la);
		const hx = cb * Math.cos(lo), hy = cb * Math.sin(lo), hz = Math.sin(la);
		const cE = Math.cos(lamE), sE = Math.sin(lamE);
		return [
			hx * cE - hy * sE,
			hx * sE + hy * cE,
			hz
		];
	}
	function drawSunspots(A, sp, spx) {
		if (!LIVE.regions.length || spx < 10) return;
		const earth = PLANETS.find((p) => p.n === "Earth");
		if (!earth || !earth._e) return;
		const lamE = Math.atan2(earth._e[1], earth._e[0]);
		for (const r of LIVE.regions) {
			const e = stonyhurstEcl(r.lat, r.lon, lamE);
			const d = dirScreen([
				e[0],
				e[2],
				e[1]
			]);
			if (d[2] <= .05) continue;
			const x = sp.x + d[0] * spx * .94, y = sp.y + d[1] * spx * .94;
			const rr = Math.max(1.2, Math.sqrt(r.area || 20) * spx / 280);
			const hot = r.xp >= 5 || r.mp >= 40 || r.xx > 0;
			ctx.beginPath();
			ctx.arc(x, y, rr, 0, 6.2832);
			ctx.fillStyle = `rgba(96,48,22,${A * .92})`;
			ctx.fill();
			if (hot) {
				ctx.beginPath();
				ctx.arc(x, y, rr + 1.6, 0, 6.2832);
				ctx.strokeStyle = `rgba(255,90,60,${A * .85})`;
				ctx.lineWidth = 1;
				ctx.stroke();
			}
			if (!r._o) r._o = {
				spot: r,
				n: "AR " + r.no
			};
			const sel = r._o === S.hover || r._o === S.pinned;
			if (sel) {
				ctx.beginPath();
				ctx.arc(x, y, rr + 5, 0, 6.2832);
				ctx.strokeStyle = "rgba(79,214,200,.9)";
				ctx.lineWidth = 1.1;
				ctx.stroke();
			}
			if (spx > 34 || sel) {
				ctx.font = "8.5px ui-monospace,monospace";
				ctx.fillStyle = `rgba(70,35,15,${A * .95})`;
				ctx.fillText("AR" + r.no, x + rr + 2, y + 3);
			}
			solarProj.push({
				o: r._o,
				x,
				y,
				px: Math.max(7, rr + 3)
			});
		}
	}
	let SATCUR = 0;
	function drawSats(A) {
		if (!LIVE.sats.length) return;
		const earth = PLANETS.find((p) => p.n === "Earth");
		if (!earth || !earth._e || !earth._p) return;
		const ep = earth._p, px = bodyPx(earth.rk, ep.depth);
		if (px < 10) return;
		const jd = solarJD();
		let drawn = 0, nSl = 0;
		const LOG_LO = Math.log10(6600), LOG_HI = Math.log10(5e4);
		const N = LIVE.sats.length, BUD = Math.min(N, 1500);
		const cNamed = `rgba(150,235,255,${A})`, cDef = `rgba(140,215,250,${A * .7})`, cSl = `rgba(168,196,232,${A * .5})`, cOw = `rgba(196,176,232,${A * .55})`;
		for (let k = 0; k < N; k++) {
			const s = LIVE.sats[k];
			let e;
			if ((k - SATCUR + N) % N < BUD) {
				e = satEcl(s, jd);
				s._e3 = e || null;
			} else e = s._e3;
			if (!e) continue;
			const l = Math.hypot(e[0], e[1], e[2]);
			if (!isFinite(l) || l < 6400) continue;
			let x, y;
			if (S.realScale) {
				const K = 1496e5;
				const w = eclToWorld(earth._e[0] + e[0] / K, earth._e[1] + e[1] / K, earth._e[2] + e[2] / K);
				const p = project(w[0], w[1], w[2]);
				if (p.depth <= NEAR) continue;
				x = p.x;
				y = p.y;
			} else {
				const d2 = camDir2([
					e[0] / l,
					e[2] / l,
					e[1] / l
				]);
				const t = Math.min(1.25, Math.max(0, (Math.log10(l) - LOG_LO) / (LOG_HI - LOG_LO)));
				const sep = px + 5 + t * (px * 2 + 36);
				x = ep.x + d2[0] * sep;
				y = ep.y + d2[1] * sep;
			}
			const named = s.iss || s.hst || s.css, sel = s === S.hover || s === S.pinned;
			s.alt = l - 6371;
			s.sat = true;
			s.kind = "Satellite";
			if (s.sl) nSl++;
			if (named) {
				ctx.beginPath();
				ctx.arc(x, y, 2.4, 0, 6.2832);
				ctx.fillStyle = cNamed;
				ctx.fill();
			} else {
				ctx.fillStyle = s.sl ? cSl : s.ow ? cOw : cDef;
				ctx.fillRect(x - .9, y - .9, 1.8, 1.8);
			}
			if (sel) {
				ctx.beginPath();
				ctx.arc(x, y, 7, 0, 6.2832);
				ctx.strokeStyle = "rgba(79,214,200,.9)";
				ctx.lineWidth = 1.1;
				ctx.stroke();
			}
			if (named || sel) {
				ctx.font = "8.5px ui-monospace,monospace";
				ctx.fillStyle = `rgba(160,230,255,${A * .9})`;
				ctx.fillText(s.iss ? "ISS" : s.css ? "CSS" : s.hst ? "Hubble" : s.n, x + 4, y - 3);
			}
			solarProj.push({
				o: s,
				x,
				y,
				px: named ? 7 : 4
			});
			drawn++;
		}
		SATCUR = N ? (SATCUR + BUD) % N : 0;
		if (drawn) {
			if (px > 13) {
				ctx.font = "8.5px ui-monospace,monospace";
				ctx.fillStyle = `rgba(140,215,250,${A * .55})`;
				ctx.fillText(drawn.toLocaleString("en-US") + " satellites · live" + (nSl ? " · " + nSl.toLocaleString("en-US") + " Starlink" : ""), ep.x + px + 4, ep.y + 16);
			}
			dirty = true;
		}
	}
	function drawFireballs(A) {
		const fb = LIVE.extra && LIVE.extra.fireballs;
		if (!fb || !fb.length) return;
		const earth = PLANETS.find((p) => p.n === "Earth");
		if (!earth || !earth._p) return;
		const ep = earth._p, px = bodyPx(earth.rk, ep.depth);
		if (px < 12) return;
		const nowMs = cmeSolarMs();
		for (const f of fb) {
			if (f.lat == null || f.lon == null) continue;
			const age = (nowMs - f.t) / 864e5;
			if (age < 0 || age > 30) continue;
			const e = groundEcl(f.lat, f.lon, f.t);
			const d = dirScreen([
				e[0],
				e[2],
				e[1]
			]);
			if (d[2] <= .05) continue;
			const x = ep.x + d[0] * px * .97, y = ep.y + d[1] * px * .97;
			const rr = Math.max(1.6, 2.2 + Math.log10(f.kt || .1));
			ctx.beginPath();
			ctx.arc(x, y, rr, 0, 6.2832);
			ctx.fillStyle = `rgba(255,150,60,${A * (age < 7 ? .95 : .55)})`;
			ctx.fill();
			ctx.beginPath();
			ctx.arc(x, y, rr + 1.8, 0, 6.2832);
			ctx.strokeStyle = `rgba(255,110,50,${A * .4})`;
			ctx.lineWidth = .8;
			ctx.stroke();
			if (!f._o) f._o = {
				fb: f,
				n: "Fireball"
			};
			if (f._o === S.hover || f._o === S.pinned) {
				ctx.beginPath();
				ctx.arc(x, y, rr + 5, 0, 6.2832);
				ctx.strokeStyle = "rgba(79,214,200,.9)";
				ctx.lineWidth = 1.1;
				ctx.stroke();
			}
			solarProj.push({
				o: f._o,
				x,
				y,
				px: Math.max(6, rr + 3)
			});
		}
	}
	const MU_S = .00029591220828559093, AUD2KMS = 1731.456;
	let TRANSFER = null;
	function stC(z) {
		if (z > 1e-6) return (1 - Math.cos(Math.sqrt(z))) / z;
		if (z < -1e-6) return (Math.cosh(Math.sqrt(-z)) - 1) / -z;
		return .5 - z / 24;
	}
	function stS(z) {
		if (z > 1e-6) {
			const s = Math.sqrt(z);
			return (s - Math.sin(s)) / (s * s * s);
		}
		if (z < -1e-6) {
			const s = Math.sqrt(-z);
			return (Math.sinh(s) - s) / (s * s * s);
		}
		return 1 / 6 - z / 120;
	}
	function lambert(r1v, r2v, tof) {
		const r1 = Math.hypot(r1v[0], r1v[1], r1v[2]), r2 = Math.hypot(r2v[0], r2v[1], r2v[2]);
		let cosD = (r1v[0] * r2v[0] + r1v[1] * r2v[1] + r1v[2] * r2v[2]) / (r1 * r2);
		cosD = Math.max(-1, Math.min(1, cosD));
		let dth = Math.acos(cosD);
		if (r1v[0] * r2v[1] - r1v[1] * r2v[0] < 0) dth = 2 * Math.PI - dth;
		const Ac = Math.sin(dth) * Math.sqrt(r1 * r2 / (1 - cosD));
		if (!isFinite(Ac) || Math.abs(Ac) < 1e-12) return null;
		const y = (z) => r1 + r2 + Ac * (z * stS(z) - 1) / Math.sqrt(stC(z));
		const F = (z) => {
			const yy = y(z);
			return yy < 0 ? NaN : Math.pow(yy / stC(z), 1.5) * stS(z) + Ac * Math.sqrt(yy) - Math.sqrt(MU_S) * tof;
		};
		let zlo = -64, zhi = 4 * Math.PI * Math.PI - 1e-9;
		while (zlo < zhi && !(y(zlo) > 0 && isFinite(F(zlo)))) zlo += 4;
		if (!(F(zlo) < 0)) return null;
		let z = 0;
		for (let i = 0; i < 80; i++) {
			z = (zlo + zhi) / 2;
			const f = F(z);
			if (isNaN(f) || f < 0) zlo = z;
			else zhi = z;
		}
		const yy = y(z), f = 1 - yy / r1, g = Ac * Math.sqrt(yy / MU_S), gd = 1 - yy / r2;
		const v1 = [
			0,
			0,
			0
		], v2 = [
			0,
			0,
			0
		];
		for (let i = 0; i < 3; i++) {
			v1[i] = (r2v[i] - f * r1v[i]) / g;
			v2[i] = (gd * r2v[i] - r1v[i]) / g;
		}
		return {
			v1,
			v2
		};
	}
	function propagateUV(r0v, v0v, dt) {
		const r0 = Math.hypot(r0v[0], r0v[1], r0v[2]), v02 = v0v[0] * v0v[0] + v0v[1] * v0v[1] + v0v[2] * v0v[2];
		const vr0 = (r0v[0] * v0v[0] + r0v[1] * v0v[1] + r0v[2] * v0v[2]) / r0;
		const alpha = 2 / r0 - v02 / MU_S, sq = Math.sqrt(MU_S);
		let x = Math.abs(alpha) > 1e-9 ? sq * Math.abs(alpha) * dt : sq * dt / r0;
		for (let i = 0; i < 40; i++) {
			const z = alpha * x * x, C = stC(z), Sz = stS(z);
			const dx = (r0 * vr0 / sq * x * x * C + (1 - alpha * r0) * x * x * x * Sz + r0 * x - sq * dt) / (r0 * vr0 / sq * x * (1 - z * Sz) + (1 - alpha * r0) * x * x * C + r0);
			x -= dx;
			if (Math.abs(dx) < 1e-10) break;
		}
		const z = alpha * x * x, f = 1 - x * x / r0 * stC(z), g = dt - x * x * x / sq * stS(z);
		return [
			f * r0v[0] + g * v0v[0],
			f * r0v[1] + g * v0v[1],
			f * r0v[2] + g * v0v[2]
		];
	}
	function bodyEclAt(b, jd) {
		const el = b.k ? keplerEcl(b.k, (jd - 2451545) / 36525) : keplerSB(b.kd, jd);
		return orbPoint(el, el.E);
	}
	function bodyVelAt(b, jd) {
		const p = bodyEclAt(b, jd + .5), m = bodyEclAt(b, jd - .5);
		return [
			p[0] - m[0],
			p[1] - m[1],
			p[2] - m[2]
		];
	}
	function findWindow(bA, bB, jd0) {
		const aA = bA.k ? bA.k[0] : bA.kd.a, aB = bB.k ? bB.k[0] : bB.kd.a;
		const Ta = Math.sqrt(aA * aA * aA) * 365.25, Tb = Math.sqrt(aB * aB * aB) * 365.25;
		const syn = 1 / Math.max(1e-9, Math.abs(1 / Ta - 1 / Tb));
		const span = Math.min(1e3, Math.max(420, syn * 1.15));
		const hoh = Math.PI * Math.sqrt(Math.pow((aA + aB) / 2, 3) / MU_S);
		const tofLo = hoh * .55, tofHi = Math.min(hoh * 1.6, 73e3);
		let best = null;
		const evalPt = (dep, tof) => {
			const L = lambert(bodyEclAt(bA, dep), bodyEclAt(bB, dep + tof), tof);
			if (!L) return;
			const vA = bodyVelAt(bA, dep), vB = bodyVelAt(bB, dep + tof);
			const dv = (Math.hypot(L.v1[0] - vA[0], L.v1[1] - vA[1], L.v1[2] - vA[2]) + Math.hypot(L.v2[0] - vB[0], L.v2[1] - vB[1], L.v2[2] - vB[2])) * AUD2KMS;
			if (!best || dv < best.dv) best = {
				dep,
				tof,
				dv,
				v1: L.v1
			};
		};
		for (let i = 0; i <= 70; i++) for (let j = 0; j <= 20; j++) evalPt(jd0 + i * span / 70, tofLo + j * (tofHi - tofLo) / 20);
		if (!best) return null;
		const ds = span / 70, ts = (tofHi - tofLo) / 20, c = {
			dep: best.dep,
			tof: best.tof
		};
		for (let i = -6; i <= 6; i++) for (let j = -6; j <= 6; j++) evalPt(c.dep + i * ds / 6, Math.max(20, c.tof + j * ts / 6));
		return best;
	}
	function computeTransfer(b) {
		const earth = PLANETS.find((p) => p.n === "Earth");
		const w = findWindow(earth, b, solarJD());
		if (!w) {
			if (UI.msg) UI.msg("no transfer window found");
			return;
		}
		const r1 = bodyEclAt(earth, w.dep), pts = [], N = 96;
		for (let i = 0; i <= N; i++) pts.push(propagateUV(r1, w.v1, w.tof * i / N));
		TRANSFER = {
			to: b,
			dep: w.dep,
			tof: w.tof,
			dv: w.dv,
			r1,
			v1: w.v1,
			pts
		};
		TRANSFER._o = {
			xfer: true,
			n: "Earth → " + b.n + " transfer",
			T: TRANSFER
		};
		if (UI.msg) UI.msg(`🚀 launch ${dateStr(w.dep)} · ${Math.round(w.tof)} d · Δv ${w.dv.toFixed(1)} km/s — ride the time slider`);
		lastInfo = void 0;
		dirty = true;
	}
	function drawTransfer(A) {
		const T = TRANSFER;
		if (!T) return;
		ctx.setLineDash([5, 4]);
		ctx.beginPath();
		let first = true;
		for (const q of T.pts) {
			const w = eclToWorld(q[0], q[1], q[2]), p = project(w[0], w[1], w[2]);
			if (offscr(p)) {
				first = true;
				continue;
			}
			if (first) {
				ctx.moveTo(p.x, p.y);
				first = false;
			} else ctx.lineTo(p.x, p.y);
		}
		ctx.strokeStyle = `rgba(79,214,200,${A * .8})`;
		ctx.lineWidth = 1.5;
		ctx.stroke();
		ctx.setLineDash([]);
		const ends = [[T.pts[0], `launch ${dateStr(T.dep)} · Δv ${T.dv.toFixed(1)} km/s`], [T.pts[T.pts.length - 1], `${T.to.n} at arrival · ${dateStr(T.dep + T.tof)}`]];
		ctx.font = "9px ui-monospace,monospace";
		for (const [q, txt] of ends) {
			const w = eclToWorld(q[0], q[1], q[2]), p = project(w[0], w[1], w[2]);
			if (p.depth <= NEAR) continue;
			ctx.beginPath();
			ctx.arc(p.x, p.y, 4, 0, 6.2832);
			ctx.strokeStyle = `rgba(79,214,200,${A * .9})`;
			ctx.lineWidth = 1.2;
			ctx.stroke();
			ctx.fillStyle = `rgba(140,235,225,${A * .85})`;
			ctx.fillText(txt, p.x + 7, p.y - 4);
		}
		const jd = solarJD();
		if (jd >= T.dep && jd <= T.dep + T.tof) {
			const q = propagateUV(T.r1, T.v1, jd - T.dep);
			const w = eclToWorld(q[0], q[1], q[2]), p = project(w[0], w[1], w[2]);
			if (p.depth > NEAR) {
				const sel = T._o === S.hover || T._o === S.pinned, sz = sel ? 6 : 5;
				ctx.beginPath();
				ctx.moveTo(p.x, p.y - sz);
				ctx.lineTo(p.x + sz, p.y);
				ctx.lineTo(p.x, p.y + sz);
				ctx.lineTo(p.x - sz, p.y);
				ctx.closePath();
				ctx.fillStyle = `rgba(120,255,235,${A})`;
				ctx.fill();
				if (sel) {
					ctx.beginPath();
					ctx.arc(p.x, p.y, sz + 6, 0, 6.2832);
					ctx.strokeStyle = "rgba(79,214,200,.9)";
					ctx.lineWidth = 1.2;
					ctx.stroke();
				}
				ctx.font = "10px ui-monospace,monospace";
				ctx.fillStyle = `rgba(140,255,240,${A * .95})`;
				const prog = Math.round((jd - T.dep) / T.tof * 100);
				ctx.fillText(`Earth → ${T.to.n} · ${prog}%`, p.x + sz + 4, p.y + 3);
				solarProj.push({
					o: T._o,
					x: p.x,
					y: p.y,
					px: Math.max(8, sz + 3)
				});
			}
		}
	}
	let FOLLOW = null;
	let ROUTE = null;
	const G_LYR = 1.0323;
	function route1g(Dly) {
		const d = Dly / 2;
		const t1 = Math.sqrt(Math.pow(1 + G_LYR * d, 2) - 1) / G_LYR;
		const tau1 = Math.acosh(1 + G_LYR * d) / G_LYR;
		return {
			T: 2 * t1,
			TAU: 2 * tau1
		};
	}
	function route1gAt(Dly, t) {
		const { T } = route1g(Dly), t1 = T / 2;
		const leg = (tt) => (Math.sqrt(1 + Math.pow(G_LYR * tt, 2)) - 1) / G_LYR;
		if (t >= T) return {
			x: Dly,
			v: 0,
			done: true
		};
		const x = t <= t1 ? leg(t) : Dly - leg(T - t);
		const ta = t <= t1 ? t : T - t;
		return {
			x,
			v: G_LYR * ta / Math.sqrt(1 + Math.pow(G_LYR * ta, 2)),
			tau: (t <= t1 ? Math.asinh(G_LYR * t) : 2 * Math.asinh(G_LYR * t1) - Math.asinh(G_LYR * (T - t))) / G_LYR,
			done: false
		};
	}
	function computeRoute(o) {
		const P = navPhys(o);
		if (!P) return;
		const distPc = Math.hypot(P[0], P[1], P[2]);
		if (!(distPc > 0)) return;
		const w = navWorld(o), wl = Math.hypot(w[0], w[1], w[2]) || 1;
		ROUTE = {
			o,
			n: o.n || o.h || "target",
			distPc,
			dir: [
				w[0] / wl,
				w[1] / wl,
				w[2] / wl
			],
			dep: solarJD()
		};
		ROUTE._o = {
			iroute: true,
			n: "Route: Earth → " + ROUTE.n,
			R: ROUTE
		};
		const r = route1g(distPc * PC2LY);
		if (UI.msg) UI.msg(`🚀 1g starship: ${fmtYears(r.T)} Earth time · ${fmtYears(r.TAU)} ship time — ride the time slider`);
		lastInfo = void 0;
		dirty = true;
	}
	function fmtYears(y) {
		if (y < 1) return Math.round(y * 365.25) + " d";
		if (y < 1e4) return y.toFixed(y < 20 ? 1 : 0).replace(/\.0$/, "") + " yr";
		if (y < 1e6) return (y / 1e3).toFixed(1) + " kyr";
		if (y < 1e9) return (y / 1e6).toFixed(2) + " Myr";
		return (y / 1e9).toFixed(2) + " Gyr";
	}
	function drawRoute() {
		const R = ROUTE, w = navWorld(R.o);
		if (!w) return;
		const wr = Math.hypot(w[0], w[1], w[2]);
		ctx.setLineDash([6, 5]);
		ctx.beginPath();
		let first = true;
		for (let i = 0; i <= 40; i++) {
			const r = wr * i / 40;
			const p = project(R.dir[0] * r, R.dir[1] * r, R.dir[2] * r);
			if (offscr(p)) {
				first = true;
				continue;
			}
			if (first) {
				ctx.moveTo(p.x, p.y);
				first = false;
			} else ctx.lineTo(p.x, p.y);
		}
		ctx.strokeStyle = "rgba(120,255,235,0.55)";
		ctx.lineWidth = 1.3;
		ctx.stroke();
		ctx.setLineDash([]);
		const tp = project(w[0], w[1], w[2]);
		if (tp.depth > NEAR) {
			ctx.font = "9px ui-monospace,monospace";
			ctx.fillStyle = "rgba(140,255,240,0.8)";
			const D = R.distPc * PC2LY, r = route1g(D);
			ctx.fillText(`${R.n} · ${D < 1e4 ? D.toFixed(1) + " ly" : fmt(D) + " ly"} · 1g: ${fmtYears(r.T)} (ship ${fmtYears(r.TAU)})`, tp.x + 8, tp.y + 12);
		}
		const tYr = (solarJD() - R.dep) / 365.25;
		if (tYr > 0) {
			const st = route1gAt(R.distPc * PC2LY, tYr);
			const xr = scale(Math.min(R.distPc, Math.max(1e-9, st.x / PC2LY)));
			const p = project(R.dir[0] * xr, R.dir[1] * xr, R.dir[2] * xr);
			if (p.depth > NEAR) {
				const sel = R._o === S.hover || R._o === S.pinned, sz = sel ? 6 : 5;
				ctx.beginPath();
				ctx.moveTo(p.x, p.y - sz);
				ctx.lineTo(p.x + sz, p.y);
				ctx.lineTo(p.x, p.y + sz);
				ctx.lineTo(p.x - sz, p.y);
				ctx.closePath();
				ctx.fillStyle = "rgba(120,255,235,0.95)";
				ctx.fill();
				if (sel) {
					ctx.beginPath();
					ctx.arc(p.x, p.y, sz + 6, 0, 6.2832);
					ctx.strokeStyle = "rgba(79,214,200,.9)";
					ctx.lineWidth = 1.2;
					ctx.stroke();
				}
				ctx.font = "10px ui-monospace,monospace";
				ctx.fillStyle = "rgba(150,255,242,0.95)";
				ctx.fillText(st.done ? `arrived at ${R.n}` : `1g starship · ${st.v.toFixed(st.v > .99 ? 4 : 2)} c · ship +${fmtYears(st.tau)}`, p.x + sz + 4, p.y + 3);
				R._sx = p.x;
				R._sy = p.y;
			} else R._sx = void 0;
		} else R._sx = void 0;
	}
	const MASS_RATIO = {
		Mercury: 166e-9,
		Venus: 2447e-9,
		Earth: 3003e-9,
		Mars: 3.227e-7,
		Jupiter: 9545e-7,
		Saturn: 2858e-7,
		Uranus: 4366e-8,
		Neptune: 5151e-8
	};
	const LAG_NOTE = {
		"L1 · Sun–Earth": "sunward · SOHO & DSCOVR station here",
		"L2 · Sun–Earth": "anti-sunward · JWST & Gaia orbit here",
		"L3 · Sun–Earth": "forever hidden behind the Sun",
		"L4 · Sun–Earth": "stable · leads Earth by 60°",
		"L5 · Sun–Earth": "stable · trails Earth by 60°",
		"L4 · Sun–Jupiter": "the \"Greek camp\" — thousands of trojans gather here",
		"L5 · Sun–Jupiter": "the \"Trojan camp\" — thousands of trojans gather here"
	};
	const LAG_PTS = [];
	for (const [pl, pts] of [["Earth", [
		"L1",
		"L2",
		"L3",
		"L4",
		"L5"
	]], ["Jupiter", ["L4", "L5"]]]) for (const L of pts) LAG_PTS.push({
		n: L + " · Sun–" + pl,
		lp: true,
		pl,
		L,
		kind: "Lagrange point",
		note: LAG_NOTE[L + " · Sun–" + pl]
	});
	function drawLagrange(A) {
		const byName = {};
		for (const b of SOLAR_BODIES) byName[b.n] = b;
		for (const b of SOLAR_BODIES) {
			const m = MASS_RATIO[b.n];
			if (!m || !b._e) continue;
			const rH = b._r * Math.cbrt(m / 3);
			const pc = project.apply(null, eclToWorld(b._e[0], b._e[1], b._e[2]));
			if (pc.depth <= NEAR) continue;
			const edge = project.apply(null, eclToWorld(b._e[0] + rH, b._e[1], b._e[2]));
			const rp = Math.hypot(edge.x - pc.x, edge.y - pc.y);
			if (rp < 6 || rp > Math.min(W, H) * 6) continue;
			ctx.beginPath();
			let first = true;
			for (let k = 0; k <= 48; k++) {
				const th = k / 48 * 6.2832;
				const w = eclToWorld(b._e[0] + Math.cos(th) * rH, b._e[1] + Math.sin(th) * rH, b._e[2]);
				const p = project(w[0], w[1], w[2]);
				if (offscr(p)) {
					first = true;
					continue;
				}
				if (first) {
					ctx.moveTo(p.x, p.y);
					first = false;
				} else ctx.lineTo(p.x, p.y);
			}
			ctx.strokeStyle = `rgba(150,205,255,${A * .4})`;
			ctx.lineWidth = 1;
			ctx.setLineDash([3, 5]);
			ctx.stroke();
			ctx.setLineDash([]);
			if (rp > 30) {
				ctx.font = "9px ui-monospace,monospace";
				ctx.fillStyle = `rgba(150,205,255,${A * .7})`;
				const km = rH * 149.6;
				ctx.fillText("Hill sphere · " + (km < 1 ? Math.round(km * 1e3).toLocaleString("en-US") + ",000 km" : km.toFixed(1) + " M km"), pc.x + rp * .72, pc.y - rp * .72);
			}
		}
		const c60 = .5, s60 = .8660254;
		for (const q of LAG_PTS) {
			const b = byName[q.pl];
			if (!b || !b._e) {
				q._e = null;
				continue;
			}
			const m = MASS_RATIO[q.pl], f = Math.cbrt(m / 3), e = b._e;
			q._e = q.L === "L1" ? [
				e[0] * (1 - f),
				e[1] * (1 - f),
				e[2] * (1 - f)
			] : q.L === "L2" ? [
				e[0] * (1 + f),
				e[1] * (1 + f),
				e[2] * (1 + f)
			] : q.L === "L3" ? [
				-e[0] * (1 + 7 * m / 12),
				-e[1] * (1 + 7 * m / 12),
				-e[2] * (1 + 7 * m / 12)
			] : q.L === "L4" ? [
				e[0] * c60 - e[1] * s60,
				e[0] * s60 + e[1] * c60,
				e[2]
			] : [
				e[0] * c60 + e[1] * s60,
				-e[0] * s60 + e[1] * c60,
				e[2]
			];
			const w = eclToWorld(q._e[0], q._e[1], q._e[2]), p = project(w[0], w[1], w[2]);
			if (p.depth <= NEAR) continue;
			if (q.L === "L1" || q.L === "L2") {
				const pp = project.apply(null, eclToWorld(e[0], e[1], e[2]));
				if (pp.depth > NEAR && Math.hypot(p.x - pp.x, p.y - pp.y) < 13) continue;
			}
			const sel = q === S.hover || q === S.pinned, r = sel ? 4.5 : 3;
			ctx.beginPath();
			ctx.moveTo(p.x, p.y - r);
			ctx.lineTo(p.x + r, p.y);
			ctx.lineTo(p.x, p.y + r);
			ctx.lineTo(p.x - r, p.y);
			ctx.closePath();
			ctx.strokeStyle = `rgba(196,170,255,${A * .9})`;
			ctx.lineWidth = 1.1;
			ctx.stroke();
			if (sel) {
				ctx.beginPath();
				ctx.arc(p.x, p.y, r + 5, 0, 6.2832);
				ctx.strokeStyle = "rgba(79,214,200,.9)";
				ctx.lineWidth = 1.1;
				ctx.stroke();
			}
			solarProj.push({
				o: q,
				x: p.x,
				y: p.y,
				px: 7
			});
			ctx.font = "9px ui-monospace,monospace";
			ctx.fillStyle = `rgba(196,170,255,${A * (sel ? 1 : .78)})`;
			ctx.fillText(q.L + (q.pl === "Jupiter" ? " · Jupiter" : ""), p.x + r + 3, p.y + 3);
		}
	}
	let sysProj = [];
	function planetColor(r) {
		if (!r) return [
			180,
			185,
			195
		];
		if (r < 1.6) return [
			206,
			150,
			108
		];
		if (r < 3.5) return [
			110,
			196,
			184
		];
		if (r < 8) return [
			110,
			150,
			224
		];
		return [
			226,
			180,
			132
		];
	}
	function drawSystem(alpha) {
		sysProj.length = 0;
		const s = focusSys;
		if (!s || !focusSysW) return;
		const sp = project(focusSysW[0], focusSysW[1], focusSysW[2]);
		if (sp.depth <= NEAR) return;
		const A = alpha;
		ctx.globalAlpha = A;
		const pls = s.p.filter((p) => p.a > 0).slice().sort((x, y) => x.a - y.a);
		const aMin = pls.length ? pls[0].a : 1, aMax = pls.length ? pls[pls.length - 1].a : 1;
		const lr = Math.log10(aMax / aMin) || 1, S0 = Math.min(W, H) * .34 * A;
		const sc = s._col;
		const gr = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, 14);
		gr.addColorStop(0, `rgba(${sc[0]},${sc[1]},${sc[2]},${A * .85})`);
		gr.addColorStop(1, `rgba(${sc[0]},${sc[1]},${sc[2]},0)`);
		ctx.fillStyle = gr;
		ctx.beginPath();
		ctx.arc(sp.x, sp.y, 14, 0, 6.2832);
		ctx.fill();
		ctx.beginPath();
		ctx.arc(sp.x, sp.y, Math.max(3, 5 * A), 0, 6.2832);
		ctx.fillStyle = `rgba(${sc[0]},${sc[1]},${sc[2]},${A})`;
		ctx.fill();
		if (S.hz && s.lum) {
			const sq = Math.sqrt(s.lum), rOf = (au) => {
				const t = Math.max(0, Math.min(1.06, pls.length > 1 ? Math.log10(au / aMin) / lr : .5));
				return S0 * (.13 + t * .84);
			};
			const ri = rOf(.95 * sq), ro = rOf(1.67 * sq);
			ctx.beginPath();
			ctx.ellipse(sp.x, sp.y, ro, ro * .42, 0, 0, 6.2832);
			ctx.ellipse(sp.x, sp.y, ri, ri * .42, 0, 0, 6.2832);
			ctx.fillStyle = `rgba(90,220,130,${A * .11})`;
			ctx.fill("evenodd");
			ctx.strokeStyle = `rgba(110,230,150,${A * .32})`;
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.ellipse(sp.x, sp.y, ri, ri * .42, 0, 0, 6.2832);
			ctx.stroke();
			ctx.beginPath();
			ctx.ellipse(sp.x, sp.y, ro, ro * .42, 0, 0, 6.2832);
			ctx.stroke();
			ctx.font = "8.5px ui-monospace,monospace";
			ctx.fillStyle = `rgba(120,230,150,${A * .72})`;
			ctx.fillText("habitable zone", sp.x + ro * .5, sp.y - ro * .42 - 3);
		}
		pls.forEach((p, i) => {
			const t = pls.length > 1 ? Math.log10(p.a / aMin) / lr : .5;
			const orb = S0 * (.13 + t * .84);
			ctx.beginPath();
			ctx.ellipse(sp.x, sp.y, orb, orb * .42, 0, 0, 6.2832);
			ctx.strokeStyle = `rgba(150,170,210,${A * .22})`;
			ctx.lineWidth = 1;
			ctx.stroke();
			let ang;
			if (p.per > 0 && p.t0 > 0) {
				const ph = (solarJD() - p.t0) / p.per % 1;
				ang = (ph < 0 ? ph + 1 : ph) * 6.2832;
			} else ang = i * 2.399 + .6;
			const mx = sp.x + Math.cos(ang) * orb, my = sp.y + Math.sin(ang) * orb * .42;
			const pc = planetColor(p.r), ppx = Math.max(2.2, Math.min(17, (p.r ? Math.pow(p.r, .4) * 2.6 : 4) * A));
			const psel = p === S.hover || p === S.pinned;
			ctx.beginPath();
			ctx.arc(mx, my, ppx, 0, 6.2832);
			ctx.fillStyle = `rgba(${pc[0]},${pc[1]},${pc[2]},${A})`;
			ctx.fill();
			if (psel) {
				ctx.beginPath();
				ctx.arc(mx, my, ppx + 6, 0, 6.2832);
				ctx.strokeStyle = "rgba(79,214,200,.9)";
				ctx.lineWidth = 1.2;
				ctx.stroke();
			}
			p._host = s.h;
			sysProj.push({
				o: p,
				x: mx,
				y: my,
				px: Math.max(7, ppx)
			});
			if (A > .55) {
				ctx.font = (psel ? "11px" : "9.5px") + " ui-monospace,monospace";
				ctx.fillStyle = `rgba(${pc[0]},${pc[1]},${pc[2]},${psel ? 1 : .82})`;
				ctx.fillText(p.n.replace(s.h, "").trim() || p.n, mx + ppx + 3, my + 3);
			}
		});
		ctx.font = "12px ui-monospace,monospace";
		ctx.fillStyle = `rgba(233,237,250,${A * .92})`;
		ctx.fillText("System " + s.h, sp.x + 16, sp.y - 6);
		ctx.font = "9px ui-monospace,monospace";
		ctx.fillStyle = `rgba(139,150,180,${A * .9})`;
		ctx.fillText(pls.length + " planet" + (pls.length !== 1 ? "s" : "") + " · " + fmt(s.d * PC2LY) + " ly", sp.x + 16, sp.y + 7);
		ctx.globalAlpha = 1;
	}
	function drawConstellations() {
		if (!S.con) return;
		const R = scale(30);
		ctx.strokeStyle = "rgba(128,150,215,0.15)";
		ctx.lineWidth = 1;
		for (const k of CONS) {
			for (const pl of k._L) {
				ctx.beginPath();
				let first = true;
				for (const d of pl) {
					const p = project(d[0] * R, d[1] * R, d[2] * R);
					if (offscr(p)) {
						first = true;
						continue;
					}
					if (first) {
						ctx.moveTo(p.x, p.y);
						first = false;
					} else ctx.lineTo(p.x, p.y);
				}
				ctx.stroke();
			}
			const cp = project(k.c[0] * R, k.c[1] * R, k.c[2] * R);
			if (cp.depth > NEAR) {
				ctx.font = "8.5px ui-monospace,monospace";
				ctx.fillStyle = "rgba(150,170,225,0.38)";
				ctx.fillText(CON_NAME[k.id] || k.id, cp.x + 3, cp.y);
			}
		}
	}
	function drawShowers() {
		const act = activeShowers(cmeSolarMs());
		if (!act.length) return;
		const R = scale(30);
		for (const s of act) {
			const d = dirOf(s.ra, s.dec), p = project(d[0] * R, d[1] * R, d[2] * R);
			if (p.depth <= NEAR) continue;
			ctx.strokeStyle = "rgba(190,255,200,0.55)";
			ctx.lineWidth = 1;
			for (let k = 0; k < 4; k++) {
				const a = k * .7854;
				const dx = Math.cos(a) * 6, dy = Math.sin(a) * 6;
				ctx.beginPath();
				ctx.moveTo(p.x - dx, p.y - dy);
				ctx.lineTo(p.x + dx, p.y + dy);
				ctx.stroke();
			}
			ctx.beginPath();
			ctx.arc(p.x, p.y, 2, 0, 6.2832);
			ctx.fillStyle = "rgba(210,255,215,0.9)";
			ctx.fill();
			ctx.font = "9px ui-monospace,monospace";
			ctx.fillStyle = "rgba(190,255,200,0.75)";
			ctx.fillText(`${s.n} · ZHR ${s.zhr}`, p.x + 9, p.y + 3);
		}
	}
	let dsoProj = [];
	let pulsarProj = [];
	let cluProj = [];
	let gwOnScreen = false;
	function drawDSO() {
		dsoProj.length = 0;
		if (!S.dso) return;
		for (const o of DSO) {
			const R = scale(o.d);
			o._x = o._dir[0] * R;
			o._y = o._dir[1] * R;
			o._z = o._dir[2] * R;
			const p = project(o._x, o._y, o._z);
			if (p.depth <= NEAR) continue;
			if (p.x < -70 || p.x > W + 70 || p.y < -70 || p.y > H + 70) continue;
			const c = (DSO_T[o.t] || DSO_T.EN).c, sz = Math.max(3, Math.min(26, foc * .02 / p.depth));
			const sel = o === S.hover || o === S.pinned;
			o._sx = p.x;
			o._sy = p.y;
			const bhR = o.t === "BH" ? Math.min(Math.min(W, H) * .22, foc * .028 / p.depth) : 0;
			if (bhR >= 9) drawBlackHole(p.x, p.y, bhR, .95);
			else {
				ctx.drawImage(blobSprite(c[0], c[1], c[2], .62, .24), p.x - sz * 1.9, p.y - sz * 1.9, sz * 3.8, sz * 3.8);
				if (o.t === "GW") {
					gwOnScreen = true;
					const ph = performance.now() / 2600 % 1;
					for (let k = 0; k < 3; k++) {
						const f = (ph + k / 3) % 1, rr = sz * (.9 + f * 3.6);
						ctx.beginPath();
						ctx.arc(p.x, p.y, rr, 0, 6.2832);
						ctx.strokeStyle = `rgba(130,255,220,${(1 - f) * .5})`;
						ctx.lineWidth = 1.2;
						ctx.stroke();
					}
				}
				if (o.t === "GC" || o.t === "OC") {
					const n = o.t === "GC" ? 10 : 6;
					for (let k = 0; k < n; k++) {
						const a = k * 2.399, rr = sz * (.25 + .6 * (k * 7 % 5 / 5));
						ctx.beginPath();
						ctx.arc(p.x + Math.cos(a) * rr, p.y + Math.sin(a) * rr, .9, 0, 6.2832);
						ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},0.9)`;
						ctx.fill();
					}
				} else {
					ctx.beginPath();
					ctx.arc(p.x, p.y, Math.max(1, sz * .32), 0, 6.2832);
					ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},0.8)`;
					ctx.fill();
				}
			}
			if (sel) {
				ctx.beginPath();
				ctx.arc(p.x, p.y, sz * 1.9 + 6, 0, 6.2832);
				ctx.strokeStyle = "rgba(79,214,200,.9)";
				ctx.lineWidth = 1.2;
				ctx.stroke();
			}
			dsoProj.push(o);
			ctx.font = (sel ? "10px" : "9px") + " ui-monospace,monospace";
			ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${sel ? 1 : .72})`;
			ctx.fillText(o.n, p.x + sz * 1.9 + 3, p.y + 3);
		}
	}
	function drawClusters() {
		cluProj.length = 0;
		if (!S.oclu) return;
		for (const c of CLUSTERS) {
			const R = scale(c.d);
			const x = c._dir[0] * R, y = c._dir[1] * R, z = c._dir[2] * R;
			const p = project(x, y, z);
			if (p.depth <= NEAR) continue;
			if (p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20) continue;
			const selc = c === S.hover || c === S.pinned;
			const raw = foc * .012 / p.depth;
			if (raw < .1 && !selc) continue;
			const sz = Math.max(1, Math.min(3.2, raw));
			c._x = x;
			c._y = y;
			c._z = z;
			c._sx = p.x;
			c._sy = p.y;
			const cc = CLU_T[c.ct || 0].c;
			if (!(glStars() && glBufC)) {
				ctx.beginPath();
				ctx.arc(p.x, p.y, sz, 0, 6.2832);
				ctx.fillStyle = `rgba(${cc[0]},${cc[1]},${cc[2]},0.55)`;
				ctx.fill();
			}
			cluProj.push(c);
			if (selc) {
				ctx.beginPath();
				ctx.arc(p.x, p.y, sz + 5, 0, 6.2832);
				ctx.strokeStyle = "rgba(79,214,200,.9)";
				ctx.lineWidth = 1;
				ctx.stroke();
				ctx.font = "9px ui-monospace,monospace";
				ctx.fillStyle = `rgba(${cc[0]},${cc[1]},${cc[2]},0.95)`;
				ctx.fillText(c.n, p.x + sz + 4, p.y + 3);
			}
		}
	}
	function drawPulsars() {
		pulsarProj.length = 0;
		if (!S.psr) return;
		for (const q of PULSARS) {
			const R = scale(q.d);
			const x = q._dir[0] * R, y = q._dir[1] * R, z = q._dir[2] * R;
			const p = project(x, y, z);
			if (p.depth <= NEAR) continue;
			if (p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20) continue;
			const selp = q === S.hover || q === S.pinned;
			const raw = foc * .02 / p.depth;
			if (raw < .13 && !selp) continue;
			const sz = Math.max(1, Math.min(3.4, raw));
			q._x = x;
			q._y = y;
			q._z = z;
			q._sx = p.x;
			q._sy = p.y;
			if (!(glStars() && glBufP)) {
				ctx.beginPath();
				ctx.arc(p.x, p.y, sz, 0, 6.2832);
				ctx.fillStyle = "rgba(150,220,255,0.72)";
				ctx.fill();
			}
			pulsarProj.push(q);
			if (selp) {
				ctx.beginPath();
				ctx.arc(p.x, p.y, sz + 5, 0, 6.2832);
				ctx.strokeStyle = "rgba(79,214,200,.9)";
				ctx.lineWidth = 1;
				ctx.stroke();
				ctx.font = "9px ui-monospace,monospace";
				ctx.fillStyle = "rgba(150,220,255,0.95)";
				ctx.fillText(q.n, p.x + sz + 4, p.y + 3);
			}
		}
	}
	const S2EL = {
		e: .884649,
		i: 134.567 * Math.PI / 180,
		O: 228.171 * Math.PI / 180,
		w: 66.263 * Math.PI / 180,
		Pd: 16.0455 * 365.25,
		Tp: 2458257.9
	};
	function s2XY(jd) {
		let M = 6.28318 * ((jd - S2EL.Tp) / S2EL.Pd % 1);
		const e = S2EL.e;
		let E = M + e * Math.sin(M) * (1 + e * Math.cos(M));
		for (let k = 0; k < 24; k++) {
			const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
			E -= dE;
			if (Math.abs(dE) < 1e-9) break;
		}
		const X = Math.cos(E) - e, Y = Math.sqrt(1 - e * e) * Math.sin(E);
		const cO = Math.cos(S2EL.O), sO = Math.sin(S2EL.O), ci = Math.cos(S2EL.i), cw = Math.cos(S2EL.w), sw = Math.sin(S2EL.w);
		const A2 = cO * cw - sO * sw * ci, B2 = sO * cw + cO * sw * ci, F2 = -cO * sw - sO * cw * ci, G2 = -sO * sw + cO * cw * ci;
		return [B2 * X + G2 * Y, A2 * X + F2 * Y];
	}
	function drawS2() {
		if (!S.mw || !sgraScreen) return;
		const sgW = [
			SGRA._x,
			SGRA._y,
			SGRA._z
		];
		const dS = Math.hypot(camPos[0] - sgW[0], camPos[1] - sgW[1], camPos[2] - sgW[2]);
		const a2 = S.pinned === SGRA ? 1 : lodA(dS, 3, 7);
		if (a2 < .02) return;
		const d0 = SGRA._dir, cd = Math.max(1e-6, Math.hypot(d0[0], d0[1]));
		const east = camDir2([
			-d0[1] / cd,
			d0[0] / cd,
			0
		]);
		const north = camDir2([
			-d0[2] * d0[0] / cd,
			-d0[2] * d0[1] / cd,
			cd
		]);
		const K = Math.min(W, H) * .11 * a2;
		ctx.globalAlpha = a2;
		ctx.beginPath();
		for (let k = 0; k <= 48; k++) {
			const eo = s2XY(S2EL.Tp + k / 48 * S2EL.Pd);
			const qx = sgraScreen.x + (east[0] * eo[0] + north[0] * eo[1]) * K;
			const qy = sgraScreen.y + (east[1] * eo[0] + north[1] * eo[1]) * K;
			if (k === 0) ctx.moveTo(qx, qy);
			else ctx.lineTo(qx, qy);
		}
		ctx.strokeStyle = "rgba(255,220,150,0.4)";
		ctx.lineWidth = 1;
		ctx.stroke();
		const p2 = s2XY(solarJD());
		const sx = sgraScreen.x + (east[0] * p2[0] + north[0] * p2[1]) * K;
		const sy = sgraScreen.y + (east[1] * p2[0] + north[1] * p2[1]) * K;
		ctx.beginPath();
		ctx.arc(sx, sy, 2.6, 0, 6.2832);
		ctx.fillStyle = "rgba(255,235,180,0.95)";
		ctx.fill();
		ctx.font = "9px ui-monospace,monospace";
		ctx.fillStyle = "rgba(255,225,160,0.85)";
		ctx.fillText("S2 · 16-yr orbit · pericentre 2018/2034", sx + 5, sy + 3);
		ctx.globalAlpha = 1;
	}
	function drawEdge() {
		const R = scale(143e8);
		ctx.strokeStyle = "rgba(120,150,255,0.11)";
		ctx.lineWidth = 1;
		for (let pl = 0; pl < 3; pl++) {
			ctx.beginPath();
			let first = true;
			for (let a = 0; a <= 6.2833; a += .13) {
				const ca = Math.cos(a) * R, sa = Math.sin(a) * R;
				const w = pl === 0 ? [
					ca,
					sa,
					0
				] : pl === 1 ? [
					ca,
					0,
					sa
				] : [
					0,
					ca,
					sa
				];
				const p = project(w[0], w[1], w[2]);
				if (p.depth <= NEAR) {
					first = true;
					continue;
				}
				if (first) {
					ctx.moveTo(p.x, p.y);
					first = false;
				} else ctx.lineTo(p.x, p.y);
			}
			ctx.stroke();
		}
		const lp = project(R, 0, 0);
		if (lp.depth > NEAR) {
			ctx.font = "9px ui-monospace,monospace";
			ctx.fillStyle = "rgba(140,165,255,0.5)";
			ctx.fillText("observable universe · CMB ~46 Gly", lp.x + 5, lp.y);
		}
	}
	const LENS_EXAG = 300, SGRA_RS = 41e-8;
	let lensPar = null;
	function calcLens() {
		lensPar = null;
		if (!S.lens) return;
		const R = scale(SGRA.d);
		const p = project(SGRA._dir[0] * R, SGRA._dir[1] * R, SGRA._dir[2] * R);
		if (p.depth <= NEAR) return;
		const c = camPhysPos();
		const D = Math.max(1e-9, Math.hypot(SGRA._dir[0] * SGRA.d - c[0], SGRA._dir[1] * SGRA.d - c[1], SGRA._dir[2] * SGRA.d - c[2]));
		const px = foc * Math.sqrt(2 * SGRA_RS / D) * LENS_EXAG;
		if (px < .7) return;
		lensPar = {
			x: p.x,
			y: p.y,
			e: Math.min(px, Math.min(W, H) * .22),
			depth: p.depth
		};
	}
	let sgraScreen = null;
	const MW_R0 = 8178;
	function mwWorld(r, th) {
		const u = MW_R0 - r * Math.cos(th), v = r * Math.sin(th);
		const dx = GPu[0] * u + GPv[0] * v, dy = GPu[1] * u + GPv[1] * v, dz = GPu[2] * u + GPv[2] * v;
		const dist = Math.hypot(dx, dy, dz) || 1e-6, R = scale(dist) / dist;
		return [
			dx * R,
			dy * R,
			dz * R,
			dist
		];
	}
	const MW_ARMS = [
		{
			n: "Perseus Arm",
			t0: .35,
			c: [
				150,
				185,
				255
			]
		},
		{
			n: "Sagittarius Arm",
			t0: 1.92,
			c: [
				165,
				205,
				255
			]
		},
		{
			n: "Scutum-Centaurus Arm",
			t0: 3.49,
			c: [
				150,
				185,
				255
			]
		},
		{
			n: "Norma / Outer Arm",
			t0: 5.06,
			c: [
				165,
				200,
				255
			]
		}
	];
	function drawGalaxyModel() {
		const k = .235;
		{
			const w = mwWorld(1e-4, 0), p = project(w[0], w[1], w[2]);
			if (p.depth > NEAR) {
				const sz = Math.max(6, Math.min(70, foc * .14 / p.depth));
				const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, sz);
				g.addColorStop(0, "rgba(255,232,190,0.32)");
				g.addColorStop(.5, "rgba(255,206,150,0.12)");
				g.addColorStop(1, "rgba(255,190,120,0)");
				ctx.fillStyle = g;
				ctx.beginPath();
				ctx.arc(p.x, p.y, sz, 0, 6.2832);
				ctx.fill();
			}
		}
		ctx.fillStyle = "rgba(255,214,160,0.5)";
		for (let t = -1; t <= 1; t += .06) {
			const w = mwWorld(Math.abs(t) * 3200, (t < 0 ? Math.PI : 0) + .44), p = project(w[0], w[1], w[2]);
			if (p.depth <= NEAR) continue;
			const sz = Math.max(.9, Math.min(3, foc * .02 / p.depth));
			ctx.beginPath();
			ctx.arc(p.x, p.y, sz, 0, 6.2832);
			ctx.fill();
		}
		for (const arm of MW_ARMS) {
			ctx.fillStyle = `rgba(${arm.c[0]},${arm.c[1]},${arm.c[2]},0.55)`;
			let mid = null;
			for (let th = .15; th < 7.4; th += .075) {
				const r = 2600 * Math.exp(k * th);
				if (r > 17e3) break;
				const w = mwWorld(r, th + arm.t0), p = project(w[0], w[1], w[2]);
				if (p.depth <= NEAR) continue;
				if (p.x < -30 || p.x > W + 30 || p.y < -30 || p.y > H + 30) continue;
				const sz = Math.max(.8, Math.min(2.6, foc * .02 / p.depth));
				ctx.beginPath();
				ctx.arc(p.x, p.y, sz, 0, 6.2832);
				ctx.fill();
				if (th > 2.4 && th < 2.55) mid = p;
			}
			if (mid) {
				ctx.font = "9px ui-monospace,monospace";
				ctx.fillStyle = `rgba(${arm.c[0]},${arm.c[1]},${arm.c[2]},0.72)`;
				ctx.fillText(arm.n, mid.x + 4, mid.y);
			}
		}
		{
			const w = mwWorld(MW_R0, 0), p = project(w[0], w[1], w[2]);
			if (p.depth > NEAR) {
				ctx.fillStyle = "rgba(120,230,255,0.95)";
				ctx.beginPath();
				ctx.arc(p.x, p.y, 2.4, 0, 6.2832);
				ctx.fill();
				ctx.font = "9px ui-monospace,monospace";
				ctx.fillStyle = "rgba(150,235,255,0.8)";
				ctx.fillText("Sun · Orion Spur", p.x + 5, p.y + 3);
			}
		}
		ctx.strokeStyle = "rgba(150,175,235,0.14)";
		ctx.lineWidth = 1;
		ctx.beginPath();
		{
			let first = true;
			for (let a = 0; a <= 6.2833; a += .1) {
				const w = mwWorld(16e3, a), p = project(w[0], w[1], w[2]);
				if (offscr(p)) {
					first = true;
					continue;
				}
				if (first) {
					ctx.moveTo(p.x, p.y);
					first = false;
				} else ctx.lineTo(p.x, p.y);
			}
		}
		ctx.stroke();
	}
	let _bhgl = null, _bhFails = 0, _bhNextTry = 0;
	function bhInit() {
		if (_bhgl !== null) {
			if (_bhgl.gl) return _bhgl;
			if (_bhFails >= 4 || performance.now() < _bhNextTry) return null;
			_bhgl = null;
		}
		const fail = (m) => {
			_bhgl = { gl: null };
			_bhFails++;
			_bhNextTry = performance.now() + 5e3;
			try {
				console.warn(m);
			} catch (e) {}
			return null;
		};
		const cv2 = document.createElement("canvas");
		const gl = cv2.getContext("webgl", {
			alpha: true,
			antialias: false
		});
		if (!gl) return fail("bh: no WebGL context");
		const mk = (t, src) => {
			const sh = gl.createShader(t);
			gl.shaderSource(sh, src);
			gl.compileShader(sh);
			if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
				try {
					console.warn("bh:", gl.getShaderInfoLog(sh));
				} catch (e) {}
				return null;
			}
			return sh;
		};
		const vsh = mk(gl.VERTEX_SHADER, `attribute vec2 aP; varying vec2 vP;
    void main(){ vP=aP; gl_Position=vec4(aP,0.0,1.0); }`);
		const fsh = mk(gl.FRAGMENT_SHADER, `precision highp float; varying vec2 vP;
    uniform highp mat3 uT; uniform sampler2D uBg; uniform float uBgOk;
    float hash(vec3 p){ p=fract(p*0.3183+vec3(0.11,0.23,0.37)); p*=17.0;
      return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
    void main(){
      const float HALF=9.6;
      vec3 pos=uT*vec3(vP*HALF,-18.0);
      vec3 dir=uT*vec3(0.0,0.0,1.0);
      vec3 hv=cross(pos,dir); float h2=dot(hv,hv);
      vec3 col=vec3(0.0); float trans=1.0; bool cap=false;
      float jit=0.85+0.3*fract(sin(dot(vP,vec2(12.9898,78.233)))*43758.5453);   // de-band the integrator
      float py=pos.y;
      for(int i=0;i<300;i++){
        float r=length(pos);
        if(r<1.02){cap=true;break;}
        if(r>20.0 && dot(pos,dir)>0.0) break;
        float dt=clamp(r*0.1,0.04,0.35)*jit;
        dir+=-1.5*h2*pos/pow(r,5.0)*dt;      // null-geodesic bending
        pos+=dir*dt;
        float ny=pos.y;
        if(py*ny<0.0){                       // crossed the disk plane
          float f=py/(py-ny);
          vec3 hit=mix(pos-dir*dt,pos,f);
          float rh=length(hit.xz);
          if(rh>2.6&&rh<9.0){                // thin disk from the ISCO out
            float v=clamp(sqrt(0.5/max(rh-1.0,0.4)),0.0,0.72);
            vec3 vel=normalize(vec3(-hit.z,0.0,hit.x))*v;
            float g=clamp(1.0/(1.0-dot(vel,normalize(dir))),0.42,2.6);   // Doppler
            float grav=sqrt(clamp(1.0-1.0/rh,0.0,1.0));                  // grav. redshift
            float br=pow(3.0/rh,0.9)*pow(g,3.0)*grav
                     *smoothstep(2.6,3.3,rh)*smoothstep(9.0,7.4,rh);   // crisp band edges
            vec3 dc=mix(vec3(1.0,0.4,0.13),vec3(1.0,0.97,0.9),clamp(g*0.8-0.4,0.0,1.0));
            col+=trans*dc*br*1.7;
            trans*=0.22;
            if(trans<0.05) break;
          }
        }
        py=ny;
      }
      if(!cap&&trans>0.05){
        vec3 pc=pos*uT;                      // back to camera frame (transpose)
        vec2 buv=pc.xy/HALF*0.5+0.5;
        vec3 bg=vec3(0.0);
        if(uBgOk>0.5&&buv.x>0.0&&buv.x<1.0&&buv.y>0.0&&buv.y<1.0)
          bg=texture2D(uBg,vec2(buv.x,1.0-buv.y)).rgb;
        vec3 rd=normalize(dir)*uT;
        vec3 sp=floor(rd*240.0);             // faint procedural stars so the warp
        float st=step(0.9985,hash(sp));      // shows even over empty capture
        col+=trans*(bg+vec3(st)*0.85);
      }
      col=vec3(1.0)-exp(-col*1.25);                      // filmic-ish tone map
      float edge=1.0-smoothstep(0.74,0.98,length(vP));   // round vignette — no square seam
      gl_FragColor=vec4(col*edge,edge);
    }`);
		if (!vsh || !fsh) return fail("bh: shader compile failed");
		const pr = gl.createProgram();
		gl.attachShader(pr, vsh);
		gl.attachShader(pr, fsh);
		gl.linkProgram(pr);
		if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return fail("bh: link failed");
		const vb = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vb);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			-1,
			-1,
			1,
			-1,
			-1,
			1,
			1,
			1
		]), gl.STATIC_DRAW);
		const tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([
			0,
			0,
			0,
			255
		]));
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		_bhgl = {
			cv: cv2,
			gl,
			pr,
			vb,
			tex,
			capCv: document.createElement("canvas"),
			aP: gl.getAttribLocation(pr, "aP"),
			uT: gl.getUniformLocation(pr, "uT"),
			uBg: gl.getUniformLocation(pr, "uBg"),
			uBgOk: gl.getUniformLocation(pr, "uBgOk")
		};
		_bhFails = 0;
		return _bhgl;
	}
	function bhRender(x, y, rpx) {
		const g = bhInit();
		if (!g) return null;
		const gl = g.gl, box = rpx * 7.4;
		let bgOk = 0;
		try {
			const c = g.capCv;
			c.width = c.height = 256;
			const g2 = c.getContext("2d");
			const glcv = document.getElementById("gl");
			if (glcv) g2.drawImage(glcv, (x - box / 2) * GLDPR, (y - box / 2) * GLDPR, box * GLDPR, box * GLDPR, 0, 0, 256, 256);
			g2.drawImage(cv, (x - box / 2) * DPR, (y - box / 2) * DPR, box * DPR, box * DPR, 0, 0, 256, 256);
			gl.bindTexture(gl.TEXTURE_2D, g.tex);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
			bgOk = 1;
		} catch (e) {}
		const dpr = Math.min(2, window.devicePixelRatio || 1);
		const size = Math.max(160, Math.min(1024, Math.ceil(box * dpr)));
		if (g.cv.width !== size) g.cv.width = g.cv.height = size;
		gl.viewport(0, 0, size, size);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.useProgram(g.pr);
		gl.bindBuffer(gl.ARRAY_BUFFER, g.vb);
		gl.enableVertexAttribArray(g.aP);
		gl.vertexAttribPointer(g.aP, 2, gl.FLOAT, false, 0, 0);
		const V = globeViewRows();
		const n = NGP, u = GC;
		const B = [
			u,
			n,
			[
				n[1] * u[2] - n[2] * u[1],
				n[2] * u[0] - n[0] * u[2],
				n[0] * u[1] - n[1] * u[0]
			]
		];
		const M = new Array(9);
		for (let i2 = 0; i2 < 3; i2++) for (let j = 0; j < 3; j++) M[j * 3 + i2] = B[i2][0] * V[j][0] + B[i2][1] * V[j][1] + B[i2][2] * V[j][2];
		gl.uniformMatrix3fv(g.uT, false, M);
		gl.bindTexture(gl.TEXTURE_2D, g.tex);
		gl.uniform1i(g.uBg, 0);
		gl.uniform1f(g.uBgOk, bgOk);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		return g.cv;
	}
	function drawBlackHole(x, y, r, A) {
		const patch = bhRender(x, y, r);
		if (patch) {
			ctx.drawImage(patch, x - r * 3.7, y - r * 3.7, r * 7.4, r * 7.4);
			return;
		}
		drawBlackHolePainted(x, y, r, A);
	}
	function drawBlackHolePainted(x, y, r, A) {
		const disk = r * 3.1, flat = .13;
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(-.14);
		let g = ctx.createRadialGradient(0, 0, r * .7, 0, 0, disk * 1.35);
		g.addColorStop(0, `rgba(255,190,120,${A * .22})`);
		g.addColorStop(.6, `rgba(255,150,70,${A * .07})`);
		g.addColorStop(1, "rgba(255,140,60,0)");
		ctx.fillStyle = g;
		ctx.beginPath();
		ctx.arc(0, 0, disk * 1.35, 0, 6.2832);
		ctx.fill();
		const diskGrad = () => {
			const dg = ctx.createRadialGradient(0, 0, r * 1.22, 0, 0, disk);
			dg.addColorStop(0, `rgba(255,252,246,${A})`);
			dg.addColorStop(.18, `rgba(255,238,205,${A * .92})`);
			dg.addColorStop(.55, `rgba(255,196,120,${A * .55})`);
			dg.addColorStop(1, "rgba(255,150,70,0)");
			return dg;
		};
		ctx.save();
		ctx.scale(1, flat);
		ctx.fillStyle = diskGrad();
		ctx.beginPath();
		ctx.arc(0, 0, disk, 0, 6.2832);
		ctx.arc(0, 0, r * 1.24, 0, 6.2832, true);
		ctx.fill();
		const dop = ctx.createLinearGradient(-disk, 0, disk, 0);
		dop.addColorStop(0, `rgba(255,255,255,${A * .3})`);
		dop.addColorStop(.5, "rgba(255,255,255,0)");
		ctx.fillStyle = dop;
		ctx.beginPath();
		ctx.arc(0, 0, disk, 0, 6.2832);
		ctx.arc(0, 0, r * 1.24, 0, 6.2832, true);
		ctx.fill();
		ctx.restore();
		const hg = ctx.createRadialGradient(0, 0, r * 1.02, 0, 0, r * 1.75);
		hg.addColorStop(0, `rgba(255,250,240,${A * .85})`);
		hg.addColorStop(.35, `rgba(255,225,175,${A * .45})`);
		hg.addColorStop(1, "rgba(255,180,110,0)");
		ctx.fillStyle = hg;
		ctx.beginPath();
		ctx.arc(0, 0, r * 1.75, 0, 6.2832);
		ctx.arc(0, 0, r * 1.02, 0, 6.2832, true);
		ctx.fill();
		ctx.beginPath();
		ctx.ellipse(0, 0, r * 1.32, r * 1.28, 0, Math.PI, 6.2832);
		ctx.strokeStyle = `rgba(255,252,244,${A * .45})`;
		ctx.lineWidth = Math.max(1, r * .16);
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(0, 0, r, 0, 6.2832);
		ctx.fillStyle = "#000";
		ctx.fill();
		ctx.beginPath();
		ctx.arc(0, 0, r * 1.05, 0, 6.2832);
		ctx.strokeStyle = `rgba(255,248,232,${A * .95})`;
		ctx.lineWidth = Math.max(1, r * .035);
		ctx.stroke();
		ctx.save();
		ctx.beginPath();
		ctx.rect(-disk * 1.05, r * .02, disk * 2.1, disk);
		ctx.clip();
		ctx.save();
		ctx.scale(1, flat);
		ctx.fillStyle = diskGrad();
		ctx.beginPath();
		ctx.arc(0, 0, disk * .9, 0, 6.2832);
		ctx.arc(0, 0, r * 1.24, 0, 6.2832, true);
		ctx.fill();
		ctx.restore();
		ctx.restore();
		ctx.restore();
	}
	function drawMW() {
		sgraScreen = null;
		if (!S.mw) return;
		{
			const R = scale(SGRA.d);
			SGRA._x = SGRA._dir[0] * R;
			SGRA._y = SGRA._dir[1] * R;
			SGRA._z = SGRA._dir[2] * R;
		}
		[
			500,
			1500,
			5e3
		].forEach((pc, idx) => {
			const R = scale(pc), mid = idx === 1;
			ctx.beginPath();
			let first = true;
			for (let t = 0; t <= 100; t++) {
				const th = t / 100 * 6.2832, c = Math.cos(th), s = Math.sin(th);
				const p = project((GPu[0] * c + GPv[0] * s) * R, (GPu[1] * c + GPv[1] * s) * R, (GPu[2] * c + GPv[2] * s) * R);
				if (offscr(p)) {
					first = true;
					continue;
				}
				if (first) {
					ctx.moveTo(p.x, p.y);
					first = false;
				} else ctx.lineTo(p.x, p.y);
			}
			ctx.strokeStyle = `rgba(140,165,235,${mid ? .16 : .08})`;
			ctx.lineWidth = mid ? 2 : 1;
			ctx.stroke();
		});
		const sp = project(SGRA._x, SGRA._y, SGRA._z);
		if (sp.depth > NEAR) {
			sgraScreen = {
				x: sp.x,
				y: sp.y
			};
			const rbh = Math.min(Math.min(W, H) * .28, foc * (S.realScale ? 500 : 2.6) / sp.depth);
			if (rbh >= 10) {
				drawBlackHole(sp.x, sp.y, rbh, 1);
				ctx.font = "10px ui-monospace,monospace";
				ctx.fillStyle = "rgba(255,205,150,0.92)";
				ctx.fillText("Sagittarius A* · 4.15 million M☉", sp.x + rbh * 1.15, sp.y - rbh * 1.35);
				return;
			}
			const gr = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, 11);
			gr.addColorStop(0, "rgba(255,180,90,0.55)");
			gr.addColorStop(.5, "rgba(255,120,60,0.22)");
			gr.addColorStop(1, "rgba(255,120,60,0)");
			ctx.fillStyle = gr;
			ctx.beginPath();
			ctx.arc(sp.x, sp.y, 11, 0, 6.2832);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(sp.x, sp.y, 3.4, 0, 6.2832);
			ctx.fillStyle = "#0a0a12";
			ctx.fill();
			ctx.beginPath();
			ctx.arc(sp.x, sp.y, 3.4, 0, 6.2832);
			ctx.strokeStyle = "rgba(255,205,130,0.95)";
			ctx.lineWidth = 1.5;
			ctx.stroke();
			ctx.font = "10px ui-monospace,monospace";
			ctx.fillStyle = "rgba(255,205,150,0.92)";
			ctx.fillText("Sagittarius A * · galactic centre", sp.x + 9, sp.y + 3);
		}
	}
	function navWorld(o) {
		const w = objWorld(o);
		if (w) return w;
		if (o._e) return eclToWorld(o._e[0], o._e[1], o._e[2]);
		return null;
	}
	function navPhys(o) {
		if (o.sgra || o.dso || o.psr || o.oclu || o.gpick) return [
			o._dir[0] * o.d,
			o._dir[1] * o.d,
			o._dir[2] * o.d
		];
		if (o.mpc !== void 0) {
			const d = o.mpc * 1e6;
			return [
				o.dx * d,
				o.dy * d,
				o.dz * d
			];
		}
		if (o.p && o._dx !== void 0) {
			const d = o._r;
			return [
				o._dx * d,
				o._dy * d,
				o._dz * d
			];
		}
		if (o.m !== void 0 && o.dx !== void 0) {
			const d = o.d;
			return [
				o.dx * d,
				o.dy * d,
				o.dz * d
			];
		}
		if (o._e) return [
			o._e[0] * AU_PC,
			o._e[1] * AU_PC,
			o._e[2] * AU_PC
		];
		return null;
	}
	function camXY(px, py, pz) {
		px -= ctr.x;
		py -= ctr.y;
		pz -= ctr.z;
		const c = Math.cos(S.yaw), s = Math.sin(S.yaw), x1 = px * c + pz * s, z1 = -px * s + pz * c, y1 = py;
		const cp = Math.cos(S.pitch), sp = Math.sin(S.pitch), y2 = y1 * cp - z1 * sp, z2 = y1 * sp + z1 * cp;
		return {
			x1,
			y2,
			z2,
			depth: S.camZ - z2
		};
	}
	function camPhysPos() {
		const cd = Math.hypot(camPos[0], camPos[1], camPos[2]);
		if (cd < 1e-15) return [
			0,
			0,
			0
		];
		const p = invScale(cd) / cd;
		return [
			camPos[0] * p,
			camPos[1] * p,
			camPos[2] * p
		];
	}
	function navDistPc() {
		if (!navTarget) return 0;
		const t = navPhys(navTarget);
		if (!t) return 0;
		const c = camPhysPos();
		return Math.hypot(t[0] - c[0], t[1] - c[1], t[2] - c[2]);
	}
	function fmtDist(pc) {
		const au = pc * 206265, ly = pc * 3.261564;
		if (pc < 48e-5) return (au < 10 ? au.toFixed(2) : fmt(au)) + " AU";
		if (ly < 9e5) return fmt(ly) + " ly";
		return (ly / 1e6).toFixed(2) + " Mly";
	}
	function fmtLight(pc) {
		const ly = pc * 3.261564;
		if (ly < 1) {
			const min = ly * 365.25 * 24 * 60;
			if (min < 90) return Math.max(1, Math.round(min)) + " light-minutes";
			if (min < 2880) return (min / 60).toFixed(1) + " light-hours";
			return fmt(min / 1440) + " light-days";
		}
		if (ly < 1e3) return fmt(ly) + " years";
		if (ly < 1e6) return (ly / 1e3).toFixed(1) + " thousand years";
		return (ly / 1e6).toFixed(2) + " million years";
	}
	function drawNav() {
		if (!navTarget) return;
		const w = navWorld(navTarget);
		if (!w) return;
		const c = camXY(w[0], w[1], w[2]);
		let onscreen = false, sx = 0, sy = 0;
		if (c.depth > NEAR) {
			sx = cx + foc * c.x1 / c.depth;
			sy = cy - foc * c.y2 / c.depth;
			onscreen = sx > 12 && sx < W - 12 && sy > 12 && sy < H - 12;
		}
		ctx.strokeStyle = "rgba(79,214,200,0.9)";
		ctx.fillStyle = "rgba(79,214,200,0.9)";
		ctx.lineWidth = 1.4;
		if (onscreen) {
			ctx.save();
			ctx.setLineDash([6, 6]);
			ctx.strokeStyle = "rgba(79,214,200,0.4)";
			ctx.lineWidth = 1.2;
			ctx.beginPath();
			ctx.moveTo(cx, cy);
			ctx.lineTo(sx, sy);
			ctx.stroke();
			ctx.restore();
			ctx.strokeStyle = "rgba(79,214,200,0.9)";
			const r = 13;
			ctx.beginPath();
			ctx.arc(sx, sy, r, 0, 6.2832);
			ctx.globalAlpha = .5;
			ctx.stroke();
			ctx.globalAlpha = 1;
			for (const [ex, ey] of [
				[-1, -1],
				[1, -1],
				[1, 1],
				[-1, 1]
			]) {
				ctx.beginPath();
				ctx.moveTo(sx + ex * r, sy + ey * r * .4);
				ctx.lineTo(sx + ex * r, sy + ey * r);
				ctx.lineTo(sx + ex * r * .4, sy + ey * r);
				ctx.stroke();
			}
		} else {
			let dx = c.x1, dy = -c.y2;
			if (c.depth <= NEAR) {
				dx = -c.x1;
				dy = c.y2;
			}
			const L = Math.hypot(dx, dy) || 1;
			dx /= L;
			dy /= L;
			const rad = Math.min(W, H) * .4, ax = cx + dx * rad, ay = cy + dy * rad;
			ctx.save();
			ctx.setLineDash([6, 6]);
			ctx.strokeStyle = "rgba(79,214,200,0.35)";
			ctx.lineWidth = 1.2;
			ctx.beginPath();
			ctx.moveTo(cx, cy);
			ctx.lineTo(ax, ay);
			ctx.stroke();
			ctx.restore();
			ctx.save();
			ctx.translate(ax, ay);
			ctx.rotate(Math.atan2(dy, dx));
			ctx.beginPath();
			ctx.moveTo(11, 0);
			ctx.lineTo(-6, 7);
			ctx.lineTo(-6, -7);
			ctx.closePath();
			ctx.fill();
			ctx.restore();
			ctx.font = "10px ui-monospace,monospace";
			ctx.textAlign = "center";
			ctx.fillText(navTarget.n || navTarget.h || "Target", ax - dx * 18, ay - dy * 18 + 3);
			ctx.textAlign = "left";
		}
	}
	function fmt(n) {
		return Math.round(n).toLocaleString("en-US");
	}
	let lastInfo = void 0, lastInfoNav = false, lastStat = [
		"",
		"",
		"",
		""
	];
	function setStat(id, v, i) {
		if (lastStat[i] !== v) {
			lastStat[i] = v;
			document.getElementById(id).textContent = v;
		}
	}
	function updateHUD() {
		setStat("s-sys", fmt(visSys), 0);
		setStat("s-pl", fmt(visPl), 1);
		setStat("s-near", isFinite(nearD) ? fmt(nearD * PC2LY) : "—", 2);
		setStat("s-far", farD ? fmt(farD * PC2LY) : "—", 3);
		const s = S.pinned || S.hover, info = document.getElementById("info"), isNav = s === navTarget;
		if (s !== lastInfo || isNav !== lastInfoNav) {
			lastInfo = s;
			lastInfoNav = isNav;
			if (s) {
				showInfo(s);
				if (s === SUN || navWorld(s)) info.insertAdjacentHTML("beforeend", `<button class="lockset">${FOLLOW === s ? "🔓 Unlock view" : "🔒 Lock & zoom"}</button>`);
				if (navPhys(s)) info.insertAdjacentHTML("beforeend", `<button class="navset">${isNav ? "✓ Target set" : "🎯 Set course"}</button>`);
				if (navPhys(s) && s._e === void 0 && s.rk === void 0 && !s.lp && !s.iroute && !s.xfer) info.insertAdjacentHTML("beforeend", `<button class="transferset">${ROUTE && ROUTE.o === s ? "✕ Clear route" : "🚀 Route from Earth · 1g ship"}</button>`);
			} else info.classList.remove("show");
		}
		updateNavPanel();
		syncSolarBtn();
	}
	function updateNavPanel() {
		const nav = document.getElementById("hud-nav");
		if (!navTarget) {
			if (nav.style.display !== "none") showNav(false);
			return;
		}
		document.getElementById("navName").textContent = navTarget.n || navTarget.h || "Target";
		const dpc = navDistPc();
		document.getElementById("navDist").textContent = fmtDist(dpc);
		document.getElementById("navLight").textContent = fmtLight(dpc);
		const w = navWorld(navTarget);
		let head = "–";
		if (w) {
			const tv = [
				w[0] - camPos[0],
				w[1] - camPos[1],
				w[2] - camPos[2]
			], tl = Math.hypot(tv[0], tv[1], tv[2]) || 1;
			const dot = (tv[0] * camFwd[0] + tv[1] * camFwd[1] + tv[2] * camFwd[2]) / tl;
			const ang = Math.acos(Math.max(-1, Math.min(1, dot))) * 57.2958;
			head = ang < 3 ? "on target" : fmt(ang) + "° off";
		}
		document.getElementById("navHead").textContent = head;
	}
	function showNav(on) {
		document.getElementById("hud-nav").style.display = on ? "block" : "none";
		document.getElementById("hud-pm").style.top = on ? "132px" : "16px";
		if (!on) navTarget = null;
	}
	const GTYPE = {
		Sp: "Spiral galaxy",
		E: "Elliptical galaxy",
		S0: "Lenticular galaxy",
		Irr: "Irregular galaxy",
		dSph: "Dwarf galaxy"
	};
	function showInfo(s) {
		const el = document.getElementById("info");
		if (s.gpick) {
			const [ra, dec] = radec(s._dir[0], s._dir[1], s._dir[2]);
			let rows = "";
			if (s.gpick === "gaia") rows = `
        <div class="r"><span class="rk">Type</span><span class="rv">Star · Gaia DR3</span></div>
        <div class="r"><span class="rk">Mag G</span><span class="rv">${s.mag.toFixed(1)}</span></div>
        <div class="r"><span class="rk">Colour bp-rp</span><span class="rv">${s.bprp.toFixed(2)}</span></div>
        <div class="r"><span class="rk">Distance</span><span class="rv">${fmt(s.d * PC2LY)} ly · ${s.d.toFixed(1)} pc</span></div>`;
			else if (s.gpick === "web") rows = `
        <div class="r"><span class="rk">Type</span><span class="rv">Galaxy · 2MRS survey</span></div>
        <div class="r"><span class="rk">Mag K</span><span class="rv">${s.kmag.toFixed(1)}</span></div>
        <div class="r"><span class="rk">Distance</span><span class="rv">${(s.d / 1e6).toFixed(1)} Mpc · ${(s.d * 3.2616 / 1e6).toFixed(0)} Mly</span></div>`;
			else if (s.gpick === "qso") rows = `
        <div class="r"><span class="rk">Type</span><span class="rv">Quasar · Milliquas</span></div>
        <div class="r"><span class="rk">Redshift</span><span class="rv">z ≈ ${s.z.toFixed(2)}</span></div>
        <div class="r"><span class="rk">Distance</span><span class="rv">${(s.d / 1e9).toFixed(2)} Gpc comoving</span></div>`;
			else rows = `
        <div class="r"><span class="rk">Type</span><span class="rv">${s.n} · JPL SBDB</span></div>
        <div class="r"><span class="rk">Abs. mag H</span><span class="rv">${s.H.toFixed(1)}</span></div>
        <div class="r"><span class="rk">Distance</span><span class="rv">${s.rAU.toFixed(2)} AU from the Sun</span></div>`;
			let h = `<div class="nm"><span class="mk" style="color:#cfd8f2;background:#cfd8f2"></span>${s.n}</div>
      <div class="rows">${rows}</div>`;
			h += links([{
				t: "SIMBAD",
				u: `https://simbad.cds.unistra.fr/simbad/sim-coo?Coord=${ra.toFixed(4)}%20${dec.toFixed(4)}&Radius=2&Radius.unit=arcmin`
			}, {
				t: "Aladin",
				u: `https://aladin.cds.unistra.fr/AladinLite/?target=${ra.toFixed(4)}%20${dec.toFixed(4)}&fov=0.5`
			}]);
			h += `<div class="hint">catalog point — no individual name</div>`;
			el.innerHTML = h;
			el.classList.add("show");
			return;
		}
		if (s.oclu) {
			let h = `<div class="nm"><span class="mk" style="color:#96beff;background:#96beff"></span>${s.n}</div>
      <div class="rows">
        <div class="r"><span class="rk">Type</span><span class="rv">${CLU_T[s.ct || 0].l}</span></div>
        <div class="r"><span class="rk">Distance</span><span class="rv">${s.ct === 2 ? fmt(s.d / 1e6) + " Mpc" : fmt(s.d * PC2LY) + " ly"}</span></div>
        <div class="r"><span class="rk">${s.ct === 2 ? "z est. from DM" : fmt(s.d) + " pc"}</span><span class="rv">${s.ct === 2 ? "approximate!" : "measured"}</span></div>
      </div>`;
			h += links([{
				t: "SIMBAD",
				u: `https://simbad.cds.unistra.fr/simbad/sim-id?Ident=${encodeURIComponent(s.n)}`
			}, {
				t: "Aladin",
				u: `https://aladin.cds.unistra.fr/AladinLite/?target=${s[0].toFixed(4)}%20${s[1].toFixed(4)}&fov=2`
			}]);
			h += `<div class="hint">${S.pinned ? "Click empty space to release" : "Click to pin"}</div>`;
			el.innerHTML = h;
			el.classList.add("show");
			return;
		}
		if (s.psr) {
			let h = `<div class="nm"><span class="mk" style="color:#96dcff;background:#96dcff;box-shadow:0 0 7px #64b4ff"></span>${s.n}</div>
      <div class="rows">
        <div class="r"><span class="rk">Type</span><span class="rv">Pulsar · rotating neutron star</span></div>
        <div class="r"><span class="rk">Distance</span><span class="rv">${fmt(s.d * PC2LY)} ly</span></div>
        <div class="r"><span class="rk">${fmt(s.d)} pc</span><span class="rv">from DM (dispersion)</span></div>
      </div>`;
			h += links([{
				t: "ATNF",
				u: "https://www.atnf.csiro.au/research/pulsar/psrcat/"
			}, {
				t: "SIMBAD",
				u: `https://simbad.cds.unistra.fr/simbad/sim-coo?Coord=${s[0].toFixed(4)}%20${s[1].toFixed(4)}&Radius=5&Radius.unit=arcmin`
			}]);
			h += `<div class="hint">${S.pinned ? "Click empty space to release" : "Click to pin"}</div>`;
			el.innerHTML = h;
			el.classList.add("show");
			return;
		}
		if (s.lp) {
			const rAU = s._e ? Math.hypot(s._e[0], s._e[1], s._e[2]) : 0;
			let h = `<div class="nm"><span class="mk" style="color:#c4aaff;background:#c4aaff"></span>${s.n}</div>
      <div class="rows">
        <div class="r"><span class="rk">Type</span><span class="rv">Lagrange point · gravity balance</span></div>
        <div class="r"><span class="rk">System</span><span class="rv">Sun–${s.pl}</span></div>
        <div class="r"><span class="rk">Distance</span><span class="rv">${rAU.toFixed(2)} AU from the Sun</span></div>
        ${s.note ? `<div class="r"><span class="rk">Note</span><span class="rv">${s.note}</span></div>` : ""}
      </div>`;
			h += links([{
				t: "Wikipedia",
				u: "https://en.wikipedia.org/wiki/Lagrange_point"
			}]);
			h += `<div class="hint">where the Sun's and ${s.pl}'s gravity balance the orbit</div>`;
			el.innerHTML = h;
			el.classList.add("show");
			return;
		}
		if (s.cme) {
			const c = s.cme, col = s.c || [
				255,
				150,
				80
			];
			const dir = `${c.lat >= 0 ? "N" : "S"}${Math.abs(c.lat).toFixed(0)} ${c.lon >= 0 ? "W" : "E"}${Math.abs(c.lon).toFixed(0)}`;
			const dt = (o) => new Date(o).toLocaleString("en-US", {
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit"
			});
			let h = `<div class="nm"><span class="mk" style="color:rgb(${col[0]},${col[1]},${col[2]});background:rgb(${col[0]},${col[1]},${col[2]})"></span>Coronal mass ejection</div>
      <div class="rows">
        <div class="r"><span class="rk">Type</span><span class="rv">CME · class ${c.type} · NASA DONKI</span></div>
        <div class="r"><span class="rk">Erupted</span><span class="rv">${dt(c.t)} UTC (at 21.5 R☉)</span></div>
        <div class="r"><span class="rk">Speed</span><span class="rv">${Math.round(c.v)} km/s</span></div>
        <div class="r"><span class="rk">Width</span><span class="rv">±${Math.round(c.half)}° · from ${dir}</span></div>
        ${c.earthDir ? `<div class="r"><span class="rk">Earth arrival</span><span class="rv">~ ${dt(c.eta)} UTC</span></div>` : `<div class="r"><span class="rk">Direction</span><span class="rv">not Earth-directed</span></div>`}
      </div>`;
			h += links([{
				t: "DONKI",
				u: "https://kauai.ccmc.gsfc.nasa.gov/DONKI/"
			}, {
				t: "SWPC",
				u: "https://www.swpc.noaa.gov/"
			}]);
			h += `<div class="hint">ballistic estimate — real fronts decelerate in the solar wind</div>`;
			el.innerHTML = h;
			el.classList.add("show");
			return;
		}
		if (s.iroute) {
			const D = s.R.distPc * PC2LY, r = route1g(D);
			const dTxt = D < 1e4 ? `${D.toFixed(1)} ly` : `${fmt(D)} ly`;
			let h = `<div class="nm"><span class="mk" style="color:#78ffeb;background:#78ffeb"></span>${s.n}</div>
      <div class="rows">
        <div class="r"><span class="rk">Distance</span><span class="rv">${dTxt}</span></div>
        <div class="r"><span class="rk">Light</span><span class="rv">${fmtYears(D)}</span></div>
        <div class="r"><span class="rk">Voyager 1 (17 km/s)</span><span class="rv">${fmtYears(D / 567e-7)}</span></div>
        <div class="r"><span class="rk">Probe at 0.1 c</span><span class="rv">${fmtYears(D * 10)}</span></div>
        <div class="r"><span class="rk">1g ship · Earth clock</span><span class="rv">${fmtYears(r.T)}</span></div>
        <div class="r"><span class="rk">1g ship · on board</span><span class="rv">${fmtYears(r.TAU)}</span></div>
      </div>`;
			h += links([{
				t: "Wikipedia",
				u: "https://en.wikipedia.org/wiki/Space_travel_under_constant_acceleration"
			}]);
			h += `<div class="hint">accelerate at 1 g to the midpoint, flip, brake — time dilation makes even galaxies reachable within a life on board</div>`;
			el.innerHTML = h;
			el.classList.add("show");
			return;
		}
		if (s.xfer) {
			const T = s.T;
			let h = `<div class="nm"><span class="mk" style="color:#78ffeb;background:#78ffeb"></span>${s.n}</div>
      <div class="rows">
        <div class="r"><span class="rk">Type</span><span class="rv">Two-impulse transfer (Lambert)</span></div>
        <div class="r"><span class="rk">Launch</span><span class="rv">${dateStr(T.dep)}</span></div>
        <div class="r"><span class="rk">Arrival</span><span class="rv">${dateStr(T.dep + T.tof)}</span></div>
        <div class="r"><span class="rk">Time of flight</span><span class="rv">${Math.round(T.tof)} days</span></div>
        <div class="r"><span class="rk">Δv (heliocentric)</span><span class="rv">${T.dv.toFixed(2)} km/s</span></div>
      </div>`;
			h += links([{
				t: "Wikipedia",
				u: "https://en.wikipedia.org/wiki/Hohmann_transfer_orbit"
			}]);
			h += `<div class="hint">min-Δv window from a departure × flight-time search — drag the time slider to fly it</div>`;
			el.innerHTML = h;
			el.classList.add("show");
			return;
		}
		if (s.spot) {
			const r = s.spot;
			let h = `<div class="nm"><span class="mk" style="color:#c86432;background:#c86432"></span>Active region ${r.no}</div>
      <div class="rows">
        <div class="r"><span class="rk">Type</span><span class="rv">Sunspot group · NOAA SWPC</span></div>
        <div class="r"><span class="rk">Class</span><span class="rv">${r.cls || "—"}${r.mag ? " · mag " + r.mag : ""}</span></div>
        <div class="r"><span class="rk">Area</span><span class="rv">${r.area} millionths · ${r.spots} spots</span></div>
        <div class="r"><span class="rk">Flares 24 h</span><span class="rv">${r.cx} C · ${r.mx} M · ${r.xx} X</span></div>
        <div class="r"><span class="rk">Flare odds</span><span class="rv">C ${r.cp}% · M ${r.mp}% · X ${r.xp}%</span></div>
      </div>`;
			h += links([{
				t: "SWPC",
				u: "https://www.swpc.noaa.gov/products/solar-region-summary"
			}]);
			h += `<div class="hint">observed ${r.date} — sunspots this size dwarf the Earth</div>`;
			el.innerHTML = h;
			el.classList.add("show");
			return;
		}
		if (s.rec) {
			let h = `<div class="nm"><span class="mk" style="color:#96ebff;background:#96ebff"></span>${s.n}</div>
      <div class="rows">
        <div class="r"><span class="rk">Type</span><span class="rv">Satellite · NORAD ${s.rec.satnum}</span></div>
        <div class="r"><span class="rk">Altitude</span><span class="rv">${fmt(s.alt || 0)} km</span></div>
        <div class="r"><span class="rk">Period</span><span class="rv">${(2 * Math.PI / s.rec.no).toFixed(0)} min</span></div>
        <div class="r"><span class="rk">Inclination</span><span class="rv">${(s.rec.inclo * 57.2958).toFixed(1)}°</span></div>
      </div>`;
			h += links([{
				t: "N2YO",
				u: `https://www.n2yo.com/satellite/?s=${s.rec.satnum}`
			}, {
				t: "CelesTrak",
				u: "https://celestrak.org/"
			}]);
			h += `<div class="hint">real orbit, SGP4-propagated — it moves as you watch</div>`;
			el.innerHTML = h;
			el.classList.add("show");
			return;
		}
		if (s.fb) {
			const f = s.fb;
			let h = `<div class="nm"><span class="mk" style="color:#ff9650;background:#ff9650"></span>Fireball</div>
      <div class="rows">
        <div class="r"><span class="rk">Type</span><span class="rv">Atmospheric impact · JPL CNEOS</span></div>
        <div class="r"><span class="rk">When</span><span class="rv">${new Date(f.t).toLocaleString("en-US", {
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit"
			})} UTC</span></div>
        <div class="r"><span class="rk">Energy</span><span class="rv">${f.kt} kt TNT</span></div>
        <div class="r"><span class="rk">Location</span><span class="rv">${Math.abs(f.lat).toFixed(1)}°${f.lat >= 0 ? "N" : "S"} ${Math.abs(f.lon).toFixed(1)}°${f.lon >= 0 ? "E" : "W"}</span></div>
        ${f.vel ? `<div class="r"><span class="rk">Velocity</span><span class="rv">${f.vel} km/s</span></div>` : ""}
      </div>`;
			h += links([{
				t: "CNEOS",
				u: "https://cneos.jpl.nasa.gov/fireballs/"
			}]);
			h += `<div class="hint">a small asteroid burning up — most are never seen by anyone</div>`;
			el.innerHTML = h;
			el.classList.add("show");
			return;
		}
		if (s.rk !== void 0) {
			const c = s.c, er = s.rk / 6371, probe = s.kind === "Spacecraft";
			let dist = s.am !== void 0 ? `${fmt(s.am * 1e3)} km from ${s.parent}` : s._r !== void 0 ? `${s._r.toFixed(2)} AU from the Sun` : s.a !== void 0 ? `${s.a} AU (semi-major axis)` : "—";
			const ltxt = s._r !== void 0 ? s._r * 8.317 > 120 ? (s._r * 8.317 / 60).toFixed(1) + " h" : (s._r * 8.317).toFixed(0) + " min" : "—";
			let rows = probe ? `<div class="r"><span class="rk">Type</span><span class="rv">Spacecraft · human-made</span></div>
         ${s.launch ? `<div class="r"><span class="rk">Launched</span><span class="rv">${s.launch}</span></div>` : ""}
         <div class="r"><span class="rk">Distance</span><span class="rv">${dist}</span></div>
         <div class="r"><span class="rk">Signal delay</span><span class="rv">${ltxt} · one way</span></div>` : `<div class="r"><span class="rk">Type</span><span class="rv">${s.kind}${s.parent ? " · " + s.parent : ""}</span></div>
         <div class="r"><span class="rk">Radius</span><span class="rv">${fmt(s.rk)} km</span></div>
         <div class="r"><span class="rk">= Earth radii</span><span class="rv">${er < .1 ? er.toFixed(3) : er.toFixed(2)} ⊕</span></div>
         <div class="r"><span class="rk">Distance</span><span class="rv">${dist}</span></div>`;
			rows += s.note ? `<div class="r"><span class="rk">Note</span><span class="rv">${s.note}</span></div>` : "";
			let h = `<div class="nm"><span class="mk" style="color:rgb(${c[0]},${c[1]},${c[2]});background:rgb(${c[0]},${c[1]},${c[2]})"></span>${s.n}</div>
      <div class="rows">${rows}</div>`;
			const q = s.slug ? `https://science.nasa.gov/${s.slug}/` : `https://science.nasa.gov/?search=${encodeURIComponent(s.n)}`;
			h += links([{
				t: "NASA",
				u: q
			}, {
				t: "Wikipedia",
				u: `https://en.wikipedia.org/wiki/${encodeURIComponent(s.n)}`
			}]);
			if ((s.k || s.kd) && s.n !== "Earth" && s.kind !== "Moon" && s.kind !== "Spacecraft") h += `<button class="transferset">${TRANSFER && TRANSFER.to === s ? "✕ Clear transfer orbit" : "🚀 Transfer Earth → " + s.n}</button>`;
			h += `<div class="hint">${S.pinned ? "Click empty space to release" : "Click to pin"}</div>`;
			el.innerHTML = h;
			el.classList.add("show");
			return;
		}
		if (s.dso) {
			const c = (DSO_T[s.t] || DSO_T.EN).c;
			let h = `<div class="nm"><span class="mk" style="color:rgb(${c});background:rgb(${c})"></span>${s.n}</div>
      <div class="rows">
        <div class="r"><span class="rk">Type</span><span class="rv">${(DSO_T[s.t] || DSO_T.EN).l}</span></div>
        <div class="r"><span class="rk">Distance</span><span class="rv">${fmt(s.d * PC2LY)} LJ</span></div>
        <div class="r"><span class="rk">${fmt(s.d)} pc</span><span class="rv">Deep-Sky</span></div>
      </div>`;
			const [ra, dec] = radec(s._dir[0], s._dir[1], s._dir[2]);
			h += links([{
				t: "SIMBAD",
				u: `https://simbad.cds.unistra.fr/simbad/sim-coo?Coord=${ra.toFixed(4)}%20${dec.toFixed(4)}&Radius=10&Radius.unit=arcmin`
			}, {
				t: "Aladin",
				u: `https://aladin.cds.unistra.fr/AladinLite/?target=${ra.toFixed(4)}%20${dec.toFixed(4)}&fov=1`
			}]);
			h += `<div class="hint">${S.pinned ? "Click empty space to release" : "Click to pin"}</div>`;
			el.innerHTML = h;
			el.classList.add("show");
			return;
		}
		if (s.sgra) {
			let h = `<div class="nm"><span class="mk" style="color:#ffcd82;background:#ffcd82;box-shadow:0 0 8px #ff8c3c"></span>${s.n}</div>
      <div class="rows">
        <div class="r"><span class="rk">Object</span><span class="rv">Black hole</span></div>
        <div class="r"><span class="rk">Mass</span><span class="rv">4.3 million M☉</span></div>
        <div class="r"><span class="rk">Distance</span><span class="rv">${fmt(s.d * PC2LY)} LJ</span></div>
        <div class="r"><span class="rk">${fmt(s.d)} pc</span><span class="rv">centre of the Milky Way</span></div>
      </div>`;
			const [ra, dec] = radec(s._dir[0], s._dir[1], s._dir[2]);
			h += links([{
				t: "SIMBAD",
				u: "https://simbad.cds.unistra.fr/simbad/sim-id?Ident=Sgr+A*"
			}, {
				t: "Aladin",
				u: `https://aladin.cds.unistra.fr/AladinLite/?target=${ra.toFixed(4)}%20${dec.toFixed(4)}&fov=0.3`
			}]);
			h += `<div class="hint">We orbit it every ~225 million years</div>`;
			el.innerHTML = h;
			el.classList.add("show");
			return;
		}
		if (s.fc !== void 0) {
			const pc = planetColor(s.r);
			const cls = !s.r ? "—" : s.r < 1.6 ? "Rocky planet" : s.r < 3.5 ? "Super-Earth" : s.r < 8 ? "Neptune-like" : "Gas giant";
			let h = `<div class="nm"><span class="mk" style="color:rgb(${pc});background:rgb(${pc})"></span>${s.n}</div>
      <div class="rows">
        <div class="r"><span class="rk">Type</span><span class="rv">${cls}</span></div>
        ${s.r ? `<div class="r"><span class="rk">Radius</span><span class="rv">${s.r} R⊕</span></div>` : ""}
        ${s.ma ? `<div class="r"><span class="rk">Mass</span><span class="rv">${s.ma} M⊕</span></div>` : ""}
        ${s.a ? `<div class="r"><span class="rk">Orbit (a)</span><span class="rv">${s.a} AE</span></div>` : ""}
        <div class="r"><span class="rk">Discovered</span><span class="rv">${s.y || "—"} · ${s.m || ""}</span></div>
      </div>`;
			h += links([{
				t: "NASA archive",
				u: `https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(s._host || s.n)}`
			}, {
				t: "SIMBAD",
				u: `https://simbad.cds.unistra.fr/simbad/sim-id?Ident=${encodeURIComponent(s._host || s.n)}`
			}]);
			h += `<div class="hint">Planet in system ${s._host || ""}</div>`;
			el.innerHTML = h;
			el.classList.add("show");
			return;
		}
		if (s.mpc !== void 0) {
			const c = s.c, mly = s.mpc * 3.2616;
			const distTxt = mly < 10 ? mly.toFixed(2) + " Mly" : fmt(mly) + " Mly";
			let h = `<div class="nm"><span class="mk" style="color:rgb(${c[0]},${c[1]},${c[2]});background:rgb(${c[0]},${c[1]},${c[2]})"></span>${s.n}</div>
      <div class="rows">
        <div class="r"><span class="rk">Distance</span><span class="rv">${distTxt}</span></div>
        <div class="r"><span class="rk">${s.mpc} Mpc</span><span class="rv">${GTYPE[s.t] || "Galaxie"}</span></div>
        <div class="r"><span class="rk">Catalog</span><span class="rv">${s.id}</span></div>
        ${s.kpc ? `<div class="r"><span class="rk">Diameter</span><span class="rv">${s.kpc} kpc</span></div>` : ""}
      </div>`;
			const [ra, dec] = radec(s.dx, s.dy, s.dz);
			h += links([
				{
					t: "SIMBAD",
					u: `https://simbad.cds.unistra.fr/simbad/sim-id?Ident=${encodeURIComponent(s.id)}`
				},
				{
					t: "NED",
					u: `https://ned.ipac.caltech.edu/byname?objname=${encodeURIComponent(s.id)}`
				},
				{
					t: "Aladin",
					u: `https://aladin.cds.unistra.fr/AladinLite/?target=${ra.toFixed(4)}%20${dec.toFixed(4)}&fov=1`
				}
			]);
			h += `<div class="hint">${S.pinned ? "Click empty space to release" : "Click to pin"}</div>`;
			el.innerHTML = h;
			el.classList.add("show");
			return;
		}
		if (!s.p) {
			const c = s.c, [ra, dec] = radec(s.dx, s.dy, s.dz);
			let h = `<div class="nm"><span class="mk" style="color:rgb(${c[0]},${c[1]},${c[2]});background:rgb(${c[0]},${c[1]},${c[2]})"></span>${s.n || "Stern"}</div>
      <div class="rows">
        <div class="r"><span class="rk">Distance</span><span class="rv">${fmt(s.d * PC2LY)} LJ</span></div>
        <div class="r"><span class="rk">${s.d} pc</span><span class="rv">apparent mag. ${s.m}</span></div>
        ${s.con ? `<div class="r"><span class="rk">Constellation</span><span class="rv">${s.con}</span></div>` : ""}
      </div>`;
			h += links([{
				t: "SIMBAD",
				u: s.n ? `https://simbad.cds.unistra.fr/simbad/sim-id?Ident=${encodeURIComponent(s.n)}` : `https://simbad.cds.unistra.fr/simbad/sim-coo?Coord=${ra.toFixed(4)}%20${dec.toFixed(4)}&Radius=2&Radius.unit=arcmin`
			}, {
				t: "Aladin",
				u: `https://aladin.cds.unistra.fr/AladinLite/?target=${ra.toFixed(4)}%20${dec.toFixed(4)}&fov=0.5`
			}]);
			h += `<div class="hint">Background star (HYG catalogue)</div>`;
			el.innerHTML = h;
			el.classList.add("show");
			return;
		}
		const c = s._col, pls = s.p.filter((p) => p.y <= S.year || p.y === 0).sort((a, b) => (a.y || 9999) - (b.y || 9999));
		let rows = `
    <div class="nm"><span class="mk" style="color:rgb(${c[0]},${c[1]},${c[2]});background:rgb(${c[0]},${c[1]},${c[2]})"></span>${s.h}</div>
    <div class="rows">
      <div class="r"><span class="rk">Distance</span><span class="rv">${fmt(s.d * PC2LY)} LJ</span></div>
      <div class="r"><span class="rk">${fmt(s.d)} pc</span><span class="rv">${s.sp ? s.sp : s.t ? fmt(s.t) + " K" : "—"}</span></div>
      <div class="r"><span class="rk">Discovered</span><span class="rv">${s.fy || "—"}</span></div>
    </div>`;
		rows += `<div class="pls"><div class="label">${pls.length} planet${pls.length !== 1 ? "s" : ""}</div>`;
		for (const p of pls.slice(0, 6)) {
			const extra = p.r ? `${p.r} R⊕` : p.ma ? `${p.ma} M⊕` : "";
			rows += `<div class="pl"><b>${p.n}</b><span>${p.y || ""} · ${extra}</span></div>`;
		}
		if (pls.length > 6) rows += `<div class="pl"><span>… and ${pls.length - 6} more</span></div>`;
		const fc = FAC[s.fac] || FAC.other;
		rows += `<div class="r" style="margin-top:9px"><span class="rk">Instrument</span><span class="rv" style="color:rgb(${fc.c[0]},${fc.c[1]},${fc.c[2]})">${fc.l}</span></div></div>`;
		const [ra, dec] = radec(s.x / s.d, s.y / s.d, s.z / s.d);
		rows += links([
			{
				t: "NASA archive",
				u: `https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(s.h)}`
			},
			{
				t: "SIMBAD",
				u: `https://simbad.cds.unistra.fr/simbad/sim-id?Ident=${encodeURIComponent(s.h)}`
			},
			{
				t: "Aladin",
				u: `https://aladin.cds.unistra.fr/AladinLite/?target=${ra.toFixed(4)}%20${dec.toFixed(4)}&fov=0.4`
			}
		]);
		rows += `<div class="hint">Click → fly into the system &amp; see the orbits</div>`;
		el.innerHTML = rows;
		el.classList.add("show");
	}
	function pick(mx, my) {
		if (SURF.on) return null;
		if (ROUTE && ROUTE._sx !== void 0) {
			const dx = ROUTE._sx - mx, dy = ROUTE._sy - my;
			if (dx * dx + dy * dy < 196) return ROUTE._o;
		}
		if (sysA > .5) {
			let best = null, bd = 1e9;
			for (const it of sysProj) {
				const dx = it.x - mx, dy = it.y - my, d = dx * dx + dy * dy;
				const rr = Math.max(12, it.px + 8);
				if (d < rr * rr && d < bd) {
					bd = d;
					best = it.o;
				}
			}
			if (best) return best;
		}
		if (solarA > .5) {
			let best = null, bd = 1e9;
			for (const it of solarProj) {
				const dx = it.x - mx, dy = it.y - my, d = dx * dx + dy * dy;
				const rr = Math.max(13, it.px + 8);
				if (d < rr * rr && d < bd) {
					bd = d;
					best = it.o;
				}
			}
			if (best) return best;
		}
		let best = null, bd = 324;
		for (const s of order) {
			const dx = s._sx - mx, dy = s._sy - my, d = dx * dx + dy * dy;
			if (d < bd) {
				bd = d;
				best = s;
			}
		}
		if (S.galaxies) for (const g of galProj) {
			const dx = g._sx - mx, dy = g._sy - my, d = dx * dx + dy * dy;
			if (d < bd) {
				bd = d;
				best = g;
			}
		}
		if (S.dso) for (const o of dsoProj) {
			const dx = o._sx - mx, dy = o._sy - my, d = dx * dx + dy * dy;
			if (d < 289 && d < bd) {
				bd = d;
				best = o;
			}
		}
		if (S.psr) for (const o of pulsarProj) {
			const dx = o._sx - mx, dy = o._sy - my, d = dx * dx + dy * dy;
			if (d < 169 && d < bd) {
				bd = d;
				best = o;
			}
		}
		if (S.oclu) for (const o of cluProj) {
			const dx = o._sx - mx, dy = o._sy - my, d = dx * dx + dy * dy;
			if (d < 169 && d < bd) {
				bd = d;
				best = o;
			}
		}
		if (S.hyg) {
			let hb = 169;
			for (const g of hygProj) {
				const dx = g._sx - mx, dy = g._sy - my, d = dx * dx + dy * dy;
				if (d < hb && d < bd) {
					bd = d;
					best = g;
				}
			}
		}
		if (S.mw && sgraScreen) {
			const dx = sgraScreen.x - mx, dy = sgraScreen.y - my, d = dx * dx + dy * dy;
			if (d < 225 && d < bd) {
				bd = d;
				best = SGRA;
			}
		}
		if (solarA < .3 && lastSun.depth > NEAR) {
			const dx = lastSun.x - mx, dy = lastSun.y - my;
			if (dx * dx + dy * dy < 256) return SUNHIT;
		}
		return best;
	}
	function gpuPick(mx, my) {
		if (SURF.on || !glOK || !S.gpu) return null;
		const layers = [];
		if (gaiaRaw && S.gaia) layers.push(["gaia", gaiaRaw]);
		if (solarA < .5) {
			if (webRaw && S.web) layers.push(["web", webRaw]);
			if (qsoRaw && S.qso) layers.push(["qso", qsoRaw]);
		}
		if (solarA > .05 && beltRaw && S.belt) layers.push(["belt", beltRaw]);
		const D2R = Math.PI / 180;
		let best = null, bd = 81;
		for (const [type, bytes] of layers) {
			const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength), n = bytes.length / 8 | 0;
			for (let i = 0; i < n; i++) {
				const b = i * 8;
				const u = dv.getUint16(b + 4, true) / 65535;
				const dist = type === "gaia" ? u * gaiaRange : type === "web" ? u * 6e8 : type === "qso" ? u * 13e9 : u * 120 * 484814e-11;
				const rr = dv.getUint16(b, true) * (360 / 65535) * D2R, dr = (dv.getUint16(b + 2, true) * (180 / 65535) - 90) * D2R;
				const cd = Math.cos(dr), R = scale(dist);
				const p = project(cd * Math.cos(rr) * R, cd * Math.sin(rr) * R, Math.sin(dr) * R);
				if (p.depth <= NEAR) continue;
				const dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
				if (d2 < bd) {
					bd = d2;
					best = {
						type,
						b,
						rr,
						dr,
						dist,
						bytes
					};
				}
			}
		}
		if (!best) return null;
		const dv = new DataView(best.bytes.buffer, best.bytes.byteOffset, best.bytes.byteLength);
		const b6 = dv.getUint8(best.b + 6), b7 = dv.getUint8(best.b + 7), cd = Math.cos(best.dr);
		const o = {
			gpick: best.type,
			_dir: [
				cd * Math.cos(best.rr),
				cd * Math.sin(best.rr),
				Math.sin(best.dr)
			],
			d: best.dist
		};
		if (best.type === "gaia") {
			o.n = "Gaia DR3 star";
			o.mag = b6 / 255 * 28 - 2;
			o.bprp = b7 / 255 * 6 - 1;
		} else if (best.type === "web") {
			o.n = "2MRS galaxy";
			o.kmag = b6 / 255 * 16;
		} else if (best.type === "qso") {
			o.n = "Quasar";
			o.z = b6 / 20;
		} else {
			o.n = [
				"Main-belt asteroid",
				"Jupiter trojan",
				"Near-Earth object",
				"Trans-Neptunian object"
			][b7] || "Asteroid";
			o.H = b6 / 10;
			o.rAU = best.dist / 484814e-11;
		}
		return o;
	}
	function radec(dx, dy, dz) {
		let ra = Math.atan2(dy, dx) * 57.29578;
		if (ra < 0) ra += 360;
		const dec = Math.asin(Math.max(-1, Math.min(1, dz))) * 57.29578;
		return [ra, dec];
	}
	function links(items) {
		return "<div class=\"links\">" + items.map((i) => `<a href="${i.u}" target="_blank" rel="noopener">${i.t}</a>`).join("") + "</div>";
	}
	let dragging = false, panning = false, lx = 0, ly = 0, moved = 0;
	cv.addEventListener("contextmenu", (e) => e.preventDefault());
	const ptrs = /* @__PURE__ */ new Map();
	let pinching = false, pinchD = 0;
	cv.addEventListener("pointerdown", (e) => {
		if (document.body.classList) document.body.classList.remove("mob-left", "mob-right");
		ptrs.set(e.pointerId, [e.clientX, e.clientY]);
		if (ptrs.size === 2) {
			pinching = true;
			dragging = false;
			const p2 = [...ptrs.values()];
			pinchD = Math.hypot(p2[0][0] - p2[1][0], p2[0][1] - p2[1][1]);
			return;
		}
		dragging = true;
		moved = 0;
		lx = e.clientX;
		ly = e.clientY;
		panning = e.button === 2 || e.button === 1 || e.shiftKey;
		cv.setPointerCapture(e.pointerId);
		cv.classList.add("drag");
		if (!panning) {
			S.autorot = false;
			syncToggle("t-rot", false);
		}
	});
	cv.addEventListener("pointermove", (e) => {
		if (pinching) {
			if (ptrs.has(e.pointerId)) ptrs.set(e.pointerId, [e.clientX, e.clientY]);
			if (ptrs.size === 2) {
				const p2 = [...ptrs.values()];
				const d = Math.hypot(p2[0][0] - p2[1][0], p2[0][1] - p2[1][1]);
				if (pinchD > 4 && d > 4) {
					let ax = (p2[0][0] + p2[1][0]) / 2, ay = (p2[0][1] + p2[1][1]) / 2;
					if (S.pinned) {
						const w = objWorld(S.pinned);
						if (w) {
							const pp = project(w[0], w[1], w[2]);
							if (pp.depth > NEAR && pp.x > 0 && pp.x < W && pp.y > 0 && pp.y < H) {
								ax = pp.x;
								ay = pp.y;
							}
						}
					}
					zoomFactorAt(ax, ay, pinchD / d);
				}
				pinchD = d;
			}
			return;
		}
		if (dragging) {
			const dx = e.clientX - lx, dy = e.clientY - ly;
			moved += Math.abs(dx) + Math.abs(dy);
			if (SURF.on) {
				surfPan(dx, dy);
				lx = e.clientX;
				ly = e.clientY;
				return;
			}
			if (e.ctrlKey || e.metaKey) {
				zoomFactorAt(e.clientX, e.clientY, Math.exp(dy * (S.realScale ? .008 : .003)));
				lx = e.clientX;
				ly = e.clientY;
				return;
			}
			if (panning) {
				FOLLOW = null;
				const sc = Math.max(S.camZ, camDist) / foc;
				tgtCtr.x += (-camRight[0] * dx + camUp[0] * dy) * sc;
				tgtCtr.y += (-camRight[1] * dx + camUp[1] * dy) * sc;
				tgtCtr.z += (-camRight[2] * dx + camUp[2] * dy) * sc;
				S.pinned = null;
			} else if (S.freelook) {
				camBasis();
				const px = camPos[0], py = camPos[1], pz = camPos[2];
				S.yaw = tgtYaw = tgtYaw + dx * .005;
				S.pitch = tgtPitch = Math.max(-1.45, Math.min(1.45, tgtPitch + dy * .005));
				const c = Math.cos(S.yaw), sn = Math.sin(S.yaw), cp = Math.cos(S.pitch), sp = Math.sin(S.pitch);
				tgtCtr.x = ctr.x = px + sn * S.camZ;
				tgtCtr.y = ctr.y = py + -sp * c * S.camZ;
				tgtCtr.z = ctr.z = pz + cp * c * S.camZ;
				S.focusStar = null;
			} else {
				tgtYaw += dx * .005;
				tgtPitch += dy * .005;
				tgtPitch = Math.max(-1.45, Math.min(1.45, tgtPitch));
				S.focusStar = null;
			}
			lx = e.clientX;
			ly = e.clientY;
		} else {
			const h = pick(e.clientX, e.clientY);
			S.hover = h === SUNHIT ? null : h;
			cv.style.cursor = h ? "pointer" : "grab";
		}
	});
	let lastTap = {
		t: 0,
		x: 0,
		y: 0
	}, lastTapFocusT = 0;
	cv.addEventListener("pointerup", (e) => {
		ptrs.delete(e.pointerId);
		if (ptrs.size < 2) {
			pinching = false;
			pinchD = 0;
		}
		dragging = false;
		panning = false;
		cv.classList.remove("drag");
		if (moved < 5) {
			if (e.pointerType === "touch" && !measureMode && !SURF.on) {
				const now = performance.now();
				if (now - lastTap.t < 350 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 40) {
					lastTap.t = 0;
					lastTapFocusT = now;
					focusAt(e.clientX, e.clientY);
					return;
				}
				lastTap = {
					t: now,
					x: e.clientX,
					y: e.clientY
				};
			}
			const hit = pick(e.clientX, e.clientY) || gpuPick(e.clientX, e.clientY);
			if (measureMode) {
				if (hit && hit !== SUNHIT) measurePick(hit);
				return;
			}
			if (hit === SUNHIT) {
				focusSys = null;
				enterSolar();
				return;
			}
			S.pinned = hit || null;
			if (hit) {
				if (hit.p && hit._dx !== void 0) {
					focusSys = hit;
					focusSysW = objWorld(hit);
					flyTo(hit);
				} else if (hit.sgra || hit.dso || hit.psr || hit.oclu || hit.gpick || hit.mpc !== void 0 || hit.m !== void 0 && hit.dx !== void 0) {
					focusSys = null;
					flyTo(hit);
				}
			}
		}
	});
	function frameSelection() {
		const b = S.pinned || S.hover;
		if (!b) return;
		if (b === SUN) {
			enterSolar();
			return;
		}
		const w = navWorld(b);
		if (!w) return;
		const isSolar = b._e !== void 0 || b.rk !== void 0;
		aim(w[0], w[1], w[2], isSolar ? Math.min(tgtCamZ, scale(3e-6)) : Math.max(scale(3e-6), tgtCamZ * .5));
		if (b._e !== void 0 || b === SUN) {
			FOLLOW = b;
			lastInfo = void 0;
		}
		dirty = true;
	}
	addEventListener("keydown", (e) => {
		const ae = document.activeElement;
		if (ae && ae.tagName === "INPUT") return;
		const k = e.key.toLowerCase();
		if ("wasdrf".includes(k) || e.key.startsWith("Arrow")) {
			keys.add(k === "arrowup" ? "w" : k === "arrowdown" ? "s" : k === "arrowleft" ? "a" : k === "arrowright" ? "d" : k);
			e.preventDefault();
		} else if (e.key === ".") {
			frameSelection();
			e.preventDefault();
		} else if (e.key === "Home") {
			const b = document.getElementById("resetBtn");
			if (b) b.click();
			e.preventDefault();
		} else if (e.key === "Escape") {
			S.pinned = null;
			S.hover = null;
			FOLLOW = null;
			lastInfo = void 0;
			dirty = true;
		}
	});
	addEventListener("keyup", (e) => {
		const k = e.key.toLowerCase();
		keys.delete(k);
		keys.delete(k === "arrowup" ? "w" : k === "arrowdown" ? "s" : k === "arrowleft" ? "a" : k === "arrowright" ? "d" : k);
	});
	function zoomAt(mx, my, delta, deltaMode) {
		let d = delta === true ? -100 : delta === false ? 100 : delta * (deltaMode === 1 ? 33 : deltaMode === 2 ? 400 : 1);
		d = Math.max(-200, Math.min(200, d));
		const k = S.realScale ? .0026 : tgtCamZ < .45 ? .0019 : 88e-5;
		zoomFactorAt(mx, my, Math.exp(k * d));
	}
	function zoomFactorAt(mx, my, f) {
		const before = tgtCamZ;
		tgtCamZ *= f;
		const zmin = S.realScale ? 1e-12 : 1e-4, zmax = S.realScale ? 6e7 : 16;
		tgtCamZ = Math.max(zmin, Math.min(zmax, tgtCamZ));
		if (SURF.on) {
			const eff = tgtCamZ / before;
			surfPan(-(mx - cx) * (1 - eff), -(my - cy) * (1 - eff));
			return;
		}
		if (tgtCamZ < before && !FOLLOW) {
			const k = tgtCamZ / before;
			const x1 = (mx - cx) * before / foc, y2 = (cy - my) * before / foc;
			const cyw = Math.cos(S.yaw), syw = Math.sin(S.yaw), cpp = Math.cos(S.pitch), spp = Math.sin(S.pitch);
			const Px = tgtCtr.x + cyw * x1 + spp * syw * y2;
			const Py = tgtCtr.y + cpp * y2;
			const Pz = tgtCtr.z + syw * x1 - spp * cyw * y2;
			tgtCtr.x += (Px - tgtCtr.x) * (1 - k);
			tgtCtr.y += (Py - tgtCtr.y) * (1 - k);
			tgtCtr.z += (Pz - tgtCtr.z) * (1 - k);
		}
	}
	function focusAt(x, y) {
		if (SURF.on) return;
		const hit = pick(x, y) || gpuPick(x, y);
		if (!hit) return;
		if (hit === SUNHIT || hit === SUN) {
			focusSys = null;
			enterSolar();
			return;
		}
		if (!hit.gpick) S.pinned = hit;
		if (hit.p && hit._dx !== void 0) {
			focusSys = hit;
			focusSysW = objWorld(hit);
			flyTo(hit);
			return;
		}
		if (objWorld(hit)) {
			flyTo(hit);
			return;
		}
		const w = navWorld(hit);
		if (w) {
			aim(w[0], w[1], w[2], Math.min(tgtCamZ, scale(3e-6)));
			if (hit._e !== void 0) {
				FOLLOW = hit;
				lastInfo = void 0;
			}
		}
		dirty = true;
	}
	cv.addEventListener("dblclick", (e) => {
		if (performance.now() - lastTapFocusT < 500) return;
		focusAt(e.clientX, e.clientY);
	});
	cv.addEventListener("pointercancel", (e) => {
		ptrs.delete(e.pointerId);
		if (ptrs.size < 2) {
			pinching = false;
			pinchD = 0;
		}
		dragging = false;
	});
	cv.addEventListener("wheel", (e) => {
		e.preventDefault();
		zoomAt(e.clientX, e.clientY, e.deltaY, e.deltaMode);
	}, { passive: false });
	[
		"pointerdown",
		"pointermove",
		"pointerup",
		"wheel",
		"keydown",
		"keyup",
		"click",
		"input"
	].forEach((ev) => addEventListener(ev, () => {
		dirty = true;
	}, {
		capture: true,
		passive: true
	}));
	function syncToggle(id, on) {
		if (UI.syncToggle) {
			UI.syncToggle(id, on);
			return;
		}
		const el = document.getElementById(id);
		if (el && el.classList) el.classList.toggle("on", on);
	}
	const TOGGLE_REG = {}, TOGGLE_ACT = {};
	function bindToggle(id, key, fn) {
		TOGGLE_REG[key] = id;
		TOGGLE_ACT[id] = {
			key,
			fn
		};
	}
	function clickToggle(id) {
		const t = TOGGLE_ACT[id];
		if (!t) return;
		S[t.key] = !S[t.key];
		syncToggle(id, S[t.key]);
		if (t.fn) t.fn();
		dirty = true;
	}
	bindToggle("t-rot", "autorot");
	bindToggle("t-freelook", "freelook");
	bindToggle("t-hyg", "hyg");
	bindToggle("t-gpu", "gpu");
	bindToggle("t-gaia", "gaia");
	bindToggle("t-web", "web");
	bindToggle("t-ob", "ob");
	bindToggle("t-var", "vars");
	bindToggle("t-qso", "qso");
	bindToggle("t-edge", "edge");
	bindToggle("t-size", "size");
	bindToggle("t-veil", "veil");
	bindToggle("t-rings", "rings");
	bindToggle("t-gal", "galaxies");
	bindToggle("t-dso", "dso");
	bindToggle("t-mw3d", "mw3d");
	bindToggle("t-psr", "psr");
	bindToggle("t-oclu", "oclu");
	bindToggle("t-real", "realScale", () => {
		const wasReal = !S.realScale;
		const inv = (v) => wasReal ? v / REALK : Math.pow(10, v / KDEC + LOG0);
		const physCam = inv(S.camZ);
		const cm = Math.hypot(ctr.x, ctr.y, ctr.z), physCtr = cm > 0 ? inv(cm) : 0;
		S.camZ = tgtCamZ = scale(physCam);
		const zf = S.realScale ? 1e-12 : 1e-4;
		if (tgtCamZ < zf) S.camZ = tgtCamZ = zf;
		if (cm > 0) {
			const nm = scale(physCtr) / cm;
			ctr.x *= nm;
			ctr.y *= nm;
			ctr.z *= nm;
			tgtCtr.x = ctr.x;
			tgtCtr.y = ctr.y;
			tgtCtr.z = ctr.z;
		}
		if (focusSys) focusSysW = objWorld(focusSys);
	});
	bindToggle("t-con", "con");
	bindToggle("t-hz", "hz");
	bindToggle("t-moons", "moons");
	bindToggle("t-ast", "ast");
	bindToggle("t-tno", "tno");
	bindToggle("t-probes", "probes");
	bindToggle("t-helio", "helio");
	bindToggle("t-belt", "belt");
	bindToggle("t-lag", "lag");
	bindToggle("t-lens", "lens");
	bindToggle("t-iso", "iso");
	bindToggle("t-cme", "cme");
	bindToggle("t-neo", "neo");
	bindToggle("t-sat", "sat");
	bindToggle("t-sun", "sunAR");
	bindToggle("t-met", "met");
	const pmTime = document.getElementById("pmTime"), pmVal = document.getElementById("pmVal");
	function setPmVal() {
		const y = S.pmYears;
		pmVal.textContent = y === 0 ? "today" : (y > 0 ? "+" : "−") + Math.abs(y).toLocaleString("en-US") + " years";
		pmTime.style.setProperty("--pct", (y + 5e4) / 1e5 * 100 + "%");
	}
	bindToggle("t-pm", "pm", () => {
		const el = document.getElementById("hud-pm");
		if (el) el.style.display = S.pm ? "block" : "none";
		if (!S.pm) {
			S.pmYears = 0;
			pmTime.value = 0;
			setPmVal();
		}
	});
	pmTime.addEventListener("input", (e) => {
		S.pmYears = +e.target.value;
		setPmVal();
	});
	setPmVal();
	document.getElementById("info").addEventListener("click", (e) => {
		if (e.target.classList.contains("navset")) {
			navTarget = S.pinned || S.hover;
			showNav(true);
		}
		if (e.target.classList.contains("lockset")) {
			const b = S.pinned || S.hover;
			if (!b) return;
			if (FOLLOW === b) FOLLOW = null;
			else {
				const w = b === SUN ? [
					0,
					0,
					0
				] : navWorld(b);
				if (w) {
					tgtCtr.x = w[0];
					tgtCtr.y = w[1];
					tgtCtr.z = w[2];
					FOLLOW = b;
					S.autorot = false;
					syncToggle("t-rot", false);
				}
			}
			lastInfo = void 0;
			dirty = true;
		}
		if (e.target.classList.contains("transferset")) {
			const b = S.pinned || S.hover;
			if (!b) return;
			if (b.rk !== void 0 && (b.k || b.kd)) if (TRANSFER && TRANSFER.to === b) {
				TRANSFER = null;
				lastInfo = void 0;
				dirty = true;
			} else computeTransfer(b);
			else if (ROUTE && ROUTE.o === b) {
				ROUTE = null;
				lastInfo = void 0;
				dirty = true;
			} else computeRoute(b);
		}
	});
	document.getElementById("navClose").addEventListener("click", () => showNav(false));
	document.getElementById("navGo").addEventListener("click", () => {
		if (!navTarget) return;
		if (navTarget.p && navTarget._dx !== void 0) {
			focusSys = navTarget;
			focusSysW = objWorld(navTarget);
		}
		if (objWorld(navTarget)) flyTo(navTarget);
		else {
			const w = navWorld(navTarget);
			if (w) aim(w[0], w[1], w[2], scale(3e-6));
		}
	});
	bindToggle("t-mw", "mw", () => {
		document.getElementById("hud-mwmap").style.display = S.mw ? "block" : "none";
	});
	function drawMWMap() {
		const cv2 = document.getElementById("mwmap");
		if (!cv2) return;
		const W2 = 198, H2 = 150, cx2 = W2 / 2, cy2 = H2 * .54, Rd = 68;
		cv2.width = W2 * DPR;
		cv2.height = H2 * DPR;
		const g = cv2.getContext("2d");
		g.setTransform(DPR, 0, 0, DPR, 0, 0);
		g.clearRect(0, 0, W2, H2);
		g.save();
		g.translate(cx2, cy2);
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
		g.arc(cx2, cy2, 3, 0, 6.2832);
		g.fillStyle = "#0a0a12";
		g.fill();
		g.strokeStyle = "rgba(255,205,130,0.95)";
		g.lineWidth = 1;
		g.stroke();
		g.font = "9px ui-monospace,monospace";
		g.fillStyle = "rgba(255,205,150,0.9)";
		g.fillText("Sgr A*", 104, cy2 - 3);
		const sr = Rd * .52, sa = -.85, sx = cx2 + Math.cos(sa) * sr, sy = cy2 + Math.sin(sa) * sr * .62;
		g.beginPath();
		g.arc(sx, sy, 3, 0, 6.2832);
		g.fillStyle = "#eafffb";
		g.fill();
		g.fillStyle = "rgba(233,237,250,0.9)";
		g.fillText("Sun", sx + 5, sy + 3);
	}
	drawMWMap();
	document.getElementById("resetBtn").addEventListener("click", () => {
		tgtYaw = .5;
		tgtPitch = -.35;
		S.focusStar = null;
		S.pinned = null;
		focusSys = null;
		tgtCtr.x = tgtCtr.y = tgtCtr.z = 0;
		tgtCamZ = camCosmos();
		S.autorot = false;
		syncToggle("t-rot", false);
	});
	function facColorToggle() {
		S.facColor = !S.facColor;
		if (UI.facColor) UI.facColor(S.facColor);
		dirty = true;
		return S.facColor;
	}
	{
		const tf = document.getElementById("t-fac");
		if (tf && tf.addEventListener) tf.addEventListener("click", (e) => {
			facColorToggle();
			if (e.currentTarget.classList) e.currentTarget.classList.toggle("on", S.facColor);
		});
	}
	const solarBtn = document.getElementById("solarBtn");
	function enterSolar() {
		S.pinned = null;
		S.hover = null;
		tgtCamZ = camSolar();
		tgtPitch = -.5;
		tgtCtr.x = tgtCtr.y = tgtCtr.z = 0;
	}
	solarBtn.addEventListener("click", () => {
		if (solarA > .5) {
			tgtCamZ = camCosmos();
			tgtPitch = -.35;
			tgtCtr.x = tgtCtr.y = tgtCtr.z = 0;
		} else enterSolar();
		S.pinned = null;
	});
	let _wasSolar = null;
	function syncSolarBtn() {
		const inS = solarA > .5;
		if (inS !== _wasSolar) {
			_wasSolar = inS;
			solarBtn.textContent = inS ? "← Back to space" : "☉ Into the solar system";
			solarBtn.classList.toggle("active", inS);
			document.getElementById("hud-time").style.display = inS ? "none" : "flex";
			document.getElementById("hud-soltime").style.display = inS ? "flex" : "none";
			if (inS) stopPlay();
			else solStop();
		}
	}
	const facCount = {};
	for (const s of STARS) facCount[s.fac] = (facCount[s.fac] || 0) + 1;
	const facList = Object.keys(FAC).filter((k) => facCount[k]).sort((a, b) => facCount[b] - facCount[a]).map((k) => ({
		k,
		l: FAC[k].l,
		c: FAC[k].c,
		n: facCount[k]
	}));
	function toggleFac(k) {
		if (S.facHidden.has(k)) S.facHidden.delete(k);
		else S.facHidden.add(k);
		dirty = true;
		return S.facHidden.has(k);
	}
	if (UI.fac) UI.fac(facList);
	const facEl = document.getElementById("facChips");
	if (!UI.fac && facEl && facEl.appendChild) Object.keys(FAC).filter((k) => facCount[k]).sort((a, b) => facCount[b] - facCount[a]).forEach((k) => {
		const f = FAC[k], div = document.createElement("div");
		div.className = "chip";
		div.dataset.k = k;
		div.innerHTML = `<span class="cdot" style="background:rgb(${f.c[0]},${f.c[1]},${f.c[2]})"></span><span>${f.l}</span><span class="cn">${facCount[k].toLocaleString("en-US")}</span>`;
		div.addEventListener("click", () => {
			if (S.facHidden.has(k)) {
				S.facHidden.delete(k);
				div.classList.remove("off");
			} else {
				S.facHidden.add(k);
				div.classList.add("off");
			}
		});
		facEl.appendChild(div);
	});
	const yearEl = document.getElementById("year"), yrVal = document.getElementById("yrVal"), yrMeta = document.getElementById("yrMeta");
	function setYear(y, fromInput) {
		S.year = +y;
		yrVal.textContent = y;
		if (!fromInput) yearEl.value = y;
		const pct = (y - 1992) / 34 * 100;
		yearEl.style.setProperty("--pct", pct + "%");
		let sys = 0, pl = 0;
		for (const s of STARS) if (s.fy <= y && s.fy !== 0) sys++;
		for (const s of STARS) for (const p of s.p) if (p.y <= y && p.y !== 0) pl++;
		yrMeta.innerHTML = `${fmt(sys)} systems · ${fmt(pl)} planets<br>by end of ${y}`;
	}
	yearEl.addEventListener("input", (e) => {
		setYear(e.target.value, true);
		stopPlay();
	});
	setYear(2026);
	let playing = false, playAcc = 0;
	const playIcon = document.getElementById("playIcon");
	function stopPlay() {
		playing = false;
		playIcon.innerHTML = "<path d=\"M3 2l11 6L3 14z\"/>";
	}
	function startPlay() {
		if (S.year >= 2026) setYear(1992);
		playing = true;
		playIcon.innerHTML = "<path d=\"M3 2h4v12H3zM9 2h4v12H9z\"/>";
	}
	document.getElementById("play").addEventListener("click", () => {
		playing ? stopPlay() : startPlay();
	});
	let _lastMsg = "";
	const searchMsg = {
		set textContent(v) {
			_lastMsg = v;
			if (UI.msg) UI.msg(v);
			const el = document.getElementById("searchMsg");
			if (el && !UI.msg) el.textContent = v;
		},
		get textContent() {
			return _lastMsg;
		}
	};
	function doSearch(q) {
		q = q.trim().toLowerCase();
		if (!q) {
			searchMsg.textContent = "";
			return;
		}
		const eq = (s) => s && s.toLowerCase() === q, has = (s) => s && s.toLowerCase().includes(q);
		const cands = [];
		const push = (t, o) => {
			if (o) cands.push([t, o]);
		};
		if (/^(sgr ?a\*?|sagittarius a\*?|galactic cent(er|re))$/.test(q)) {
			searchMsg.textContent = "→ Sgr A* · galactic centre";
			if (!S.mw) {
				S.mw = true;
				syncToggle("t-mw", true);
			}
			focusSys = null;
			S.pinned = SGRA;
			flyTo(SGRA);
			return;
		}
		push("iso", ISO.find((o) => eq(o.n)));
		push("small", SMALL.find((o) => eq(o.n)));
		push("dso", DSO.find((o) => eq(o.n)));
		push("hyg", HYG.find((s) => eq(s.n)));
		push("gal", GAL.find((g) => eq(g.n) || eq(g.id)));
		push("star", STARS.find((s) => eq(s.h)));
		push("body", SOLAR_BODIES.find((b) => eq(b.n)) || (eq("sun") ? SUN : null));
		push("probe", PROBES.find((p) => eq(p.n)));
		push("tno2", TNOS.find((t2) => eq(t2.n)));
		push("psr", PULSARS.find((o) => eq(o.n)));
		push("clu", CLUSTERS.find((c) => eq(c.n)));
		push("iso", ISO.find((o) => has(o.n)));
		push("small", SMALL.find((o) => has(o.n)));
		push("dso", DSO.find((o) => has(o.n)));
		push("hyg", HYG.find((s) => has(s.n)));
		push("gal", GAL.find((g) => has(g.n) || has(g.id)));
		push("star", STARS.find((s) => s._search.includes(q)));
		push("body", SOLAR_BODIES.find((b) => has(b.n)));
		push("probe", PROBES.find((p) => has(p.n)));
		push("tno2", TNOS.find((t2) => has(t2.n)));
		push("psr", PULSARS.find((o) => has(o.n)));
		push("clu", CLUSTERS.find((c) => has(c.n)));
		if (!cands.length) {
			searchMsg.textContent = "nothing found";
			return;
		}
		const [t, o] = cands[0];
		if (t === "iso") {
			searchMsg.textContent = "→ " + o.n + " (interstellar)";
			if (!S.iso) {
				S.iso = true;
				syncToggle("t-iso", true);
			}
			focusSys = null;
			enterSolar();
			S.pinned = o;
			return;
		}
		if (t === "small") {
			searchMsg.textContent = "→ " + o.n + " (" + o.kind + ")";
			if (!S.ast) {
				S.ast = true;
				syncToggle("t-ast", true);
			}
			focusSys = null;
			enterSolar();
			S.pinned = o;
			return;
		}
		if (t === "body") {
			searchMsg.textContent = "→ " + o.n + " (" + (o.kind || "") + ")";
			focusSys = null;
			enterSolar();
			S.pinned = o;
			return;
		}
		if (t === "probe" || t === "tno2") {
			searchMsg.textContent = "→ " + o.n + " (" + (o.kind || "") + ")";
			if (t === "probe" && !S.probes) {
				S.probes = true;
				syncToggle("t-probes", true);
			}
			if (t === "tno2" && !S.tno) {
				S.tno = true;
				syncToggle("t-tno", true);
			}
			focusSys = null;
			enterSolar();
			S.pinned = o;
			return;
		}
		if (t === "psr" || t === "clu") {
			searchMsg.textContent = "→ " + o.n + " · " + fmt(o.d * PC2LY) + " ly";
			if (t === "psr" && !S.psr) {
				S.psr = true;
				syncToggle("t-psr", true);
			}
			if (t === "clu" && !S.oclu) {
				S.oclu = true;
				syncToggle("t-oclu", true);
			}
			focusSys = null;
			S.pinned = o;
			const R = scale(o.d);
			aim(o._dir[0] * R, o._dir[1] * R, o._dir[2] * R, scale(o.d * .25));
			return;
		}
		if (t === "dso") {
			searchMsg.textContent = "→ " + o.n + " · " + fmt(o.d * PC2LY) + " ly";
			focusSys = null;
			S.pinned = o;
			if (!S.dso) {
				S.dso = true;
				syncToggle("t-dso", true);
			}
			const R = scale(o.d);
			aim(o._dir[0] * R, o._dir[1] * R, o._dir[2] * R, scale(o.d * .25));
		} else if (t === "gal") {
			searchMsg.textContent = "→ " + o.n + " · " + fmt(o.mpc * 3.2616) + " Mly";
			focusOnGalaxy(o);
		} else if (t === "hyg") {
			searchMsg.textContent = "→ " + (o.n || "Stern") + " · " + fmt(o.d * PC2LY) + " ly";
			focusOnHyg(o);
		} else {
			searchMsg.textContent = "→ " + o.h + " · " + fmt(o.d * PC2LY) + " ly";
			if (o.fy > S.year && o.fy !== 0) setYear(o.fy);
			focusOn(o);
		}
	}
	function aim(x, y, z, margin) {
		if (!isFinite(x + y + z + margin)) return;
		FOLLOW = null;
		tgtCtr.x = x;
		tgtCtr.y = y;
		tgtCtr.z = z;
		tgtCamZ = Math.max(scale(3e-6), margin);
		S.autorot = false;
		syncToggle("t-rot", false);
	}
	function objWorld(o) {
		if ((o.psr || o.oclu || o.gpick || o.sgra || o.dso) && o._dir && o.d !== void 0) {
			const R = scale(o.d);
			return [
				o._dir[0] * R,
				o._dir[1] * R,
				o._dir[2] * R
			];
		}
		if (o.sgra || o.dso) return [
			o._x,
			o._y,
			o._z
		];
		if (o.mpc !== void 0) return [
			o._x,
			o._y,
			o._z
		];
		if (o.p && o._dx !== void 0) {
			const d = compress(o._r);
			return [
				o._dx * d,
				o._dy * d,
				o._dz * d
			];
		}
		if (o.m !== void 0 && o.dx !== void 0) {
			const d = compress(o.d);
			return [
				o.dx * d,
				o.dy * d,
				o.dz * d
			];
		}
		return null;
	}
	function flyTo(o) {
		const w = objWorld(o);
		if (!w) return;
		const physPc = invScale(Math.hypot(w[0], w[1], w[2])) || 1;
		let m;
		if (o.p) m = S.realScale ? scale(physPc * .12) : scale(3e-5);
		else if (o.m !== void 0 && o.dx !== void 0) m = scale(physPc * .2);
		else m = scale(physPc * .25);
		aim(w[0], w[1], w[2], m);
	}
	function focusOn(s) {
		S.pinned = s;
		S.focusStar = s;
		focusSys = s;
		focusSysW = objWorld(s);
		aim(focusSysW[0], focusSysW[1], focusSysW[2], S.realScale ? scale(s._r * .12) : scale(3e-5));
	}
	function focusOnGalaxy(g) {
		if (!S.galaxies) {
			S.galaxies = true;
			syncToggle("t-gal", true);
		}
		S.pinned = g;
		S.focusStar = null;
		focusSys = null;
		const R = scale(g.mpc * 1e6);
		aim(g.dx * R, g.dy * R, g.dz * R, scale(g.mpc * 1e6 * .25));
	}
	function focusOnHyg(s) {
		if (!S.hyg) {
			S.hyg = true;
			syncToggle("t-hyg", true);
		}
		S.pinned = s;
		S.focusStar = null;
		focusSys = null;
		const dr = compress(s.d);
		aim(s.dx * dr, s.dy * dr, s.dz * dr, scale(s.d * .2));
	}
	const solTime = document.getElementById("solTime"), solDate = document.getElementById("solDate"), solIcon = document.getElementById("solIcon");
	let solPlaying = false;
	function setSolDate() {
		solDate.textContent = dateStr(solarJD());
		solTime.style.setProperty("--pct", (S.tOffsetDays + 36525) / 73050 * 100 + "%");
	}
	function solStop() {
		solPlaying = false;
		solIcon.innerHTML = "<path d=\"M3 2l11 6L3 14z\"/>";
	}
	function solStart() {
		if (S.tOffsetDays >= 36525) {
			S.tOffsetDays = -36525;
			solTime.value = -36525;
		}
		solPlaying = true;
		solIcon.innerHTML = "<path d=\"M3 2h4v12H3zM9 2h4v12H9z\"/>";
	}
	solTime.addEventListener("input", (e) => {
		S.tOffsetDays = +e.target.value;
		setSolDate();
		solStop();
	});
	document.getElementById("solPlay").addEventListener("click", () => {
		solPlaying ? solStop() : solStart();
	});
	document.getElementById("solNow").addEventListener("click", () => {
		S.tOffsetDays = 0;
		solTime.value = 0;
		setSolDate();
		solStop();
	});
	setSolDate();
	const GL_UNI = `
uniform float u_yaw,u_pitch,u_camZ,u_foc,u_dpr,u_LOG0,u_KDEC,u_REALK,u_cull,u_minPx,u_alphaK,u_maxPt;
uniform vec3 u_ctr; uniform vec2 u_res; uniform bool u_real;
uniform vec4 u_lens; uniform float u_lensOn;   // xy: lens device px · z: Einstein radius px · w: lens depth
out vec3 v_color; out float v_alpha;
float scl(float pc){ if(u_real) return pc*u_REALK; return max(0.0,(log(pc)/2.302585093 - u_LOG0)*u_KDEC); }
`;
	function glTail(host) {
		return `
  float R=scl(dist);
  vec3 p=dir*R - u_ctr;
  float c=cos(u_yaw), sy=sin(u_yaw);
  float x1=p.x*c + p.z*sy;
  float z1=-p.x*sy + p.z*c;
  float y1=p.y;
  float cp=cos(u_pitch), sp=sin(u_pitch);
  float y2=y1*cp - z1*sp;
  float z2=y1*sp + z1*cp;
  float depth=u_camZ - z2;
  float focCss=u_foc/u_dpr;
  float bright=max(0.0, 6.8 - mg);
  float sizeCss;
  ${host ? `if(u_hostMode>0.5) sizeCss=min(20.0, max(0.7, focCss*0.0075/depth*rs));
  else ` : ""}sizeCss=clamp((0.4+bright*0.34)*focCss*0.0032/depth, 0.0, 3.6);
  float nearP=u_real?u_camZ*0.02:0.05; if(depth<=nearP || sizeCss<u_cull){ gl_Position=vec4(2.0,0.0,0.0,1.0); gl_PointSize=0.0; return; }
  float px=max(sizeCss, u_minPx);
  ${host ? `if(u_glow>0.5){
    if(mg>2.6){ gl_Position=vec4(2.0,0.0,0.0,1.0); gl_PointSize=0.0; return; }
    px=min(sizeCss*6.0, 26.0);                           // soft halo for the brightest stars
  }` : ""}
  float dvx=u_res.x*0.5 + u_foc*x1/depth;
  float dvy=u_res.y*0.5 - u_foc*y2/depth;
  if(u_lensOn>0.5 && depth>u_lens.w){            // gravitational lens: sources behind
    vec2 lv=vec2(dvx,dvy)-u_lens.xy;             // Sgr A* deflect outward (point-mass
    float lr=max(length(lv),1e-3);               // lens equation, exaggerated scale)
    float lm=0.5*(lr+sqrt(lr*lr+4.0*u_lens.z*u_lens.z))/lr;
    dvx=u_lens.x+lv.x*lm; dvy=u_lens.y+lv.y*lm;
  }
  gl_Position=vec4(dvx/u_res.x*2.0-1.0, 1.0-dvy/u_res.y*2.0, 0.0, 1.0);
  gl_PointSize=min(px*u_dpr, u_maxPt);
  v_color=col;
  ${host ? `if(u_hostMode>0.5){
    float av=clamp(1.9-depth*0.55, 0.12, 1.0);
    if(u_veil>0.5 && dist>u_bnd){                        // red veil beyond the charted edge
      float t=min(1.0,(dist-u_bnd)/(u_bnd*1.6));
      v_color=mix(v_color, vec3(0.9098,0.2275,0.1961), t*0.85); av*=(1.0-t*0.4);
    }
    if(a_pm.y>0.5 && abs(a_pm.y-u_year)<0.5){ v_color=vec3(0.3098,0.8392,0.7843); av=1.0; }
    v_alpha=av;
  } else {` : "{"}
    float fade=clamp(1.9-depth*0.4, 0.22, 1.0);
    v_alpha=clamp((0.28+bright*0.12)*fade, 0.0, 1.0);
    if(u_minPx>0.0) v_alpha=max(v_alpha, 0.17);          // Gaia: keep faint dwarfs visible
  }
  ${host ? `if(u_glow>0.5) v_alpha*=0.05;` : ""}
  v_alpha*=u_alphaK;
`;
	}
	const GL_VSF = `#version 300 es
precision highp float;
in vec3 a_dir; in float a_dist; in float a_mag; in vec3 a_color; in vec2 a_pm;
${GL_UNI}
uniform float u_pmYears,u_hostMode,u_year,u_facColor,u_sizeOn,u_veil,u_bnd,u_glow;
uniform float u_facVis[8]; uniform vec3 u_pal[8];
void main(){
  vec3 dir=a_dir;
  if(u_pmYears!=0.0 && u_hostMode<0.5){
    float cd=max(1e-6, length(a_dir.xy));
    float mas=3.14159265/(180.0*3600.0*1000.0);
    float tE=a_pm.x*u_pmYears*mas, tN=a_pm.y*u_pmYears*mas;
    vec3 east=vec3(-a_dir.y/cd, a_dir.x/cd, 0.0);
    vec3 north=vec3(-a_dir.z*a_dir.x/cd, -a_dir.z*a_dir.y/cd, cd);
    dir=normalize(a_dir + east*tE + north*tN);
  }
  vec3 col=a_color; float rs=1.0;
  if(u_hostMode>0.5){
    float fy=a_pm.y;                                     // discovery-year filter on the GPU
    if(fy>u_year+0.5 && fy>0.5){ gl_Position=vec4(2.0,0.0,0.0,1.0); gl_PointSize=0.0; return; }
    int ci=int(a_pm.x+0.5);                              // facility category
    if(u_facVis[ci]<0.5){ gl_Position=vec4(2.0,0.0,0.0,1.0); gl_PointSize=0.0; return; }
    if(u_facColor>0.5) col=u_pal[ci];
    if(u_sizeOn>0.5) rs=a_mag;                           // a_mag carries radiusScale for hosts
  }
  float dist=a_dist, mg=a_mag;
  ${glTail(true)}
}`;
	const GL_VSU = `#version 300 es
precision highp float;
in uvec4 a_rec;                                          // one raw 8-byte catalogue record
${GL_UNI}
uniform float u_decDist,u_colMode,u_isBelt,u_beltDt;
uniform vec2 u_decMag; uniform vec3 u_colFix; uniform vec3 u_decPal[4];
vec3 gaiaCol(float bprp){                                // bp_rp -> Teff (Ballesteros) -> colour
  float t=4600.0*(1.0/(0.92*bprp+1.7)+1.0/(0.92*bprp+0.62));
  if(t>=30000.0) return vec3(0.608,0.690,1.0);
  if(t>=10000.0) return vec3(0.667,0.749,1.0);
  if(t>=7500.0)  return vec3(0.792,0.843,1.0);
  if(t>=6000.0)  return vec3(0.973,0.969,1.0);
  if(t>=5200.0)  return vec3(1.0,0.957,0.910);
  if(t>=3700.0)  return vec3(1.0,0.824,0.631);
  return vec3(1.0,0.710,0.424);
}
void main(){
  float D2R=0.017453292519943295;
  float rr=float(a_rec.x)*(360.0/65535.0)*D2R;
  float dr=(float(a_rec.y)*(180.0/65535.0)-90.0)*D2R;
  float u=float(a_rec.z)*(1.0/65535.0);
  float b6=float(a_rec.w & 255u), b7=float(a_rec.w >> 8);
  float cd=cos(dr);
  vec3 dir=vec3(cd*cos(rr), cd*sin(rr), sin(dr));
  float dist=u*u_decDist;
  float mg=(b6/255.0)*u_decMag.x + u_decMag.y;
  vec3 col = u_colMode<0.5 ? u_colFix
           : u_colMode<1.5 ? gaiaCol((b7/255.0)*6.0-1.0)
           : u_decPal[int(min(b7,3.0))];
  if(u_isBelt>0.5 && u_beltDt!=0.0){
    // approximate Kepler drift: circular mean motion at the body's heliocentric distance
    float rAU=max(0.05, dist/0.0000048481368);
    float ang=0.0172021242/pow(rAU,1.5)*u_beltDt;
    float ca=cos(ang), sa=sin(ang);
    dir=vec3(dir.x*ca - dir.z*sa, dir.y, dir.x*sa + dir.z*ca);   // world y = ecliptic pole
  }
  ${glTail(false)}
}`;
	const GL_FSP = `#version 300 es
precision mediump float;
in vec3 v_color; in float v_alpha;
out vec4 o;
void main(){
  float r=length(gl_PointCoord-vec2(0.5));
  if(r>0.5) discard;
  float a=v_alpha*smoothstep(0.5,0.12,r);
  o=vec4(v_color*a, a);                                  // premultiplied additive (ONE, ONE)
}`;
	const TM_VS = `#version 300 es
void main(){                                             // fullscreen triangle from gl_VertexID
  vec2 p=vec2(float((gl_VertexID<<1)&2), float(gl_VertexID&2));
  gl_Position=vec4(p*2.0-1.0, 0.0, 1.0);
}`;
	const TM_FS = `#version 300 es
precision mediump float;
uniform sampler2D u_tex; out vec4 o;
void main(){                                             // soft shoulder above 0.55: dense star
  vec3 x=texelFetch(u_tex, ivec2(gl_FragCoord.xy), 0).rgb;   // fields roll off instead of clipping
  vec3 hi=vec3(0.55) + 0.45*(1.0-exp(-(x-vec3(0.55))/0.45));
  o=vec4(mix(x, hi, step(vec3(0.55), x)), 1.0);
}`;
	function glCompile(gl, type, src) {
		const sh = gl.createShader(type);
		gl.shaderSource(sh, src);
		gl.compileShader(sh);
		if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
			try {
				console.error("shader:", gl.getShaderInfoLog(sh));
			} catch (_) {}
			return null;
		}
		return sh;
	}
	function mkProg(gl, vsSrc, fsSrc) {
		const vs = glCompile(gl, gl.VERTEX_SHADER, vsSrc), fs = glCompile(gl, gl.FRAGMENT_SHADER, fsSrc);
		if (!vs || !fs) return null;
		const p = gl.createProgram();
		gl.attachShader(p, vs);
		gl.attachShader(p, fs);
		gl.linkProgram(p);
		if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
			try {
				console.error("link:", gl.getProgramInfoLog(p));
			} catch (_) {}
			return null;
		}
		const o = {
			p,
			loc: {},
			attr: {}
		};
		const nu = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
		for (let i = 0; i < nu; i++) {
			const u = gl.getActiveUniform(p, i);
			o.loc[u.name.replace(/\[0\]$/, "")] = gl.getUniformLocation(p, u.name);
		}
		const na = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES);
		for (let i = 0; i < na; i++) {
			const a = gl.getActiveAttrib(p, i);
			o.attr[a.name] = gl.getAttribLocation(p, a.name);
		}
		return o;
	}
	function mkFloatVAO(gl, arr) {
		const buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buf);
		gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
		const vao = gl.createVertexArray();
		gl.bindVertexArray(vao);
		const A = progF.attr;
		gl.enableVertexAttribArray(A.a_dir);
		gl.vertexAttribPointer(A.a_dir, 3, gl.FLOAT, false, 40, 0);
		gl.enableVertexAttribArray(A.a_dist);
		gl.vertexAttribPointer(A.a_dist, 1, gl.FLOAT, false, 40, 12);
		gl.enableVertexAttribArray(A.a_mag);
		gl.vertexAttribPointer(A.a_mag, 1, gl.FLOAT, false, 40, 16);
		gl.enableVertexAttribArray(A.a_color);
		gl.vertexAttribPointer(A.a_color, 3, gl.FLOAT, false, 40, 20);
		gl.enableVertexAttribArray(A.a_pm);
		gl.vertexAttribPointer(A.a_pm, 2, gl.FLOAT, false, 40, 32);
		gl.bindVertexArray(null);
		return {
			vao,
			n: arr.length / 10
		};
	}
	function initGL() {
		try {
			glcv = document.getElementById("gl");
			if (!glcv) return;
			const gl = glcv.getContext("webgl2", {
				alpha: false,
				antialias: false,
				depth: false,
				stencil: false,
				powerPreference: "high-performance"
			});
			if (!gl) return;
			GL = gl;
			if (!glcv.__loss) {
				glcv.__loss = 1;
				glcv.addEventListener("webglcontextlost", (e) => {
					e.preventDefault();
					glOK = false;
					dirty = true;
				});
				glcv.addEventListener("webglcontextrestored", () => {
					initGL();
					glRestoreClouds();
					dirty = true;
				});
			}
			progF = mkProg(gl, GL_VSF, GL_FSP);
			progU = mkProg(gl, GL_VSU, GL_FSP);
			progT = mkProg(gl, TM_VS, TM_FS);
			if (!progF || !progU) return;
			glMaxPt = (gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE) || [1, 64])[1] || 64;
			hdrOK = false;
			if (progT && gl.getExtension("EXT_color_buffer_float")) {
				hdrTex = gl.createTexture();
				gl.bindTexture(gl.TEXTURE_2D, hdrTex);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, 4, 4, 0, gl.RGBA, gl.HALF_FLOAT, null);
				hdrFB = gl.createFramebuffer();
				gl.bindFramebuffer(gl.FRAMEBUFFER, hdrFB);
				gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, hdrTex, 0);
				hdrOK = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
				gl.bindFramebuffer(gl.FRAMEBUFFER, null);
				if (progT.loc.u_tex) {
					gl.useProgram(progT.p);
					gl.uniform1i(progT.loc.u_tex, 0);
				}
			}
			const arr = new Float32Array(HYG.length * 10);
			for (let i = 0; i < HYG.length; i++) {
				const st = HYG[i], o = i * 10;
				arr[o] = st.dx;
				arr[o + 1] = st.dy;
				arr[o + 2] = st.dz;
				arr[o + 3] = st.d;
				arr[o + 4] = st.m;
				arr[o + 5] = st.c[0] / 255;
				arr[o + 6] = st.c[1] / 255;
				arr[o + 7] = st.c[2] / 255;
				arr[o + 8] = st.pr || 0;
				arr[o + 9] = st.pd || 0;
			}
			glBuf = mkFloatVAO(gl, arr);
			const FACIDX = {
				kepler: 0,
				tess: 1,
				k2: 2,
				rv: 3,
				micro: 4,
				imaging: 5,
				ground: 6,
				other: 7
			};
			const ha = new Float32Array(STARS.length * 10);
			for (let i = 0; i < STARS.length; i++) {
				const st2 = STARS[i], o = i * 10;
				let rmax = 0;
				for (const pp of st2.p) if (pp.r && pp.r > rmax) rmax = pp.r;
				ha[o] = st2._dx;
				ha[o + 1] = st2._dy;
				ha[o + 2] = st2._dz;
				ha[o + 3] = st2._r;
				ha[o + 4] = rmax ? Math.max(.55, Math.min(4.2, Math.pow(rmax / 1.4, .5))) : 1;
				ha[o + 5] = st2._col[0] / 255;
				ha[o + 6] = st2._col[1] / 255;
				ha[o + 7] = st2._col[2] / 255;
				ha[o + 8] = FACIDX[st2.fac] !== void 0 ? FACIDX[st2.fac] : 7;
				ha[o + 9] = st2.fy || 0;
			}
			glBufH = mkFloatVAO(gl, ha);
			const mkPts = (list, mag, cFn) => {
				const a2 = new Float32Array(list.length * 10);
				for (let i = 0; i < list.length; i++) {
					const q = list[i], o = i * 10, c = cFn(q);
					a2[o] = q._dir[0];
					a2[o + 1] = q._dir[1];
					a2[o + 2] = q._dir[2];
					a2[o + 3] = q.d;
					a2[o + 4] = mag;
					a2[o + 5] = c[0] / 255;
					a2[o + 6] = c[1] / 255;
					a2[o + 7] = c[2] / 255;
					a2[o + 8] = 0;
					a2[o + 9] = 0;
				}
				return mkFloatVAO(gl, a2);
			};
			glBufP = mkPts(PULSARS, 4.6, () => [
				150,
				220,
				255
			]);
			glBufC = mkPts(CLUSTERS, 4.2, (q) => CLU_T[q.ct || 0].c);
			gl.useProgram(progF.p);
			const pal = [];
			for (const k of [
				"kepler",
				"tess",
				"k2",
				"rv",
				"micro",
				"imaging",
				"ground",
				"other"
			]) {
				const c3 = FAC[k].c;
				pal.push(c3[0] / 255, c3[1] / 255, c3[2] / 255);
			}
			gl.uniform3fv(progF.loc.u_pal, pal);
			gl.clearColor(.027, .035, .07, 1);
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.ONE, gl.ONE);
			glOK = true;
			glResize();
		} catch (e) {
			glOK = false;
		}
	}
	function glResize() {
		if (!glOK || !glcv) return;
		const raw = devicePixelRatio || 1, px = exactPx && raw <= 2.02 ? exactPx : null;
		glcv.width = px ? px[0] : Math.round(W * Math.min(raw, 2));
		glcv.height = px ? px[1] : Math.round(H * Math.min(raw, 2));
		glcv.style.width = W + "px";
		glcv.style.height = H + "px";
		GLDPR = glcv.width / W;
		GL.viewport(0, 0, glcv.width, glcv.height);
		if (hdrOK) {
			GL.bindTexture(GL.TEXTURE_2D, hdrTex);
			GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA16F, glcv.width, glcv.height, 0, GL.RGBA, GL.HALF_FLOAT, null);
		}
		dirty = true;
	}
	function glClearCanvas() {
		if (!glOK) return;
		GL.bindFramebuffer(GL.FRAMEBUFFER, null);
		GL.clear(GL.COLOR_BUFFER_BIT);
	}
	function glStars() {
		return glOK && S.gpu;
	}
	const CLOUD_DEC = {
		gaia: {
			dist: 100,
			mag: [28, -2],
			mode: 1
		},
		gaiabig: {
			dist: 150,
			mag: [28, -2],
			mode: 1
		},
		belt: {
			dist: 120 * 484814e-11,
			mag: [0, 5.6],
			mode: 2,
			pal: [
				[
					176,
					166,
					148
				],
				[
					160,
					148,
					172
				],
				[
					255,
					150,
					120
				],
				[
					140,
					172,
					224
				]
			],
			belt: 1
		},
		vars: {
			dist: 2e4,
			mag: [0, 5],
			mode: 2,
			pal: [[
				255,
				214,
				120
			], [
				200,
				160,
				255
			]]
		},
		ob: {
			dist: 4e3,
			mag: [0, 5.2],
			mode: 0,
			fix: [
				168,
				205,
				255
			]
		},
		web: {
			dist: 6e8,
			mag: [16, -5.2],
			mode: 0,
			fix: [
				190,
				200,
				228
			]
		},
		qso: {
			dist: 13e9,
			mag: [0, 5],
			mode: 0,
			fix: [
				212,
				150,
				255
			]
		}
	};
	function buildCloudBuf(bytes, key) {
		if (!glOK || !bytes || bytes.length < 8) return null;
		const gl = GL, n = bytes.length / 8 | 0;
		const buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buf);
		gl.bufferData(gl.ARRAY_BUFFER, bytes, gl.STATIC_DRAW);
		const vao = gl.createVertexArray();
		gl.bindVertexArray(vao);
		const a = progU.attr.a_rec;
		gl.enableVertexAttribArray(a);
		gl.vertexAttribIPointer(a, 4, gl.UNSIGNED_SHORT, 8, 0);
		gl.bindVertexArray(null);
		dirty = true;
		return {
			vao,
			n,
			key
		};
	}
	function cloudLabel(id, txt) {
		if (UI.setLabel) {
			UI.setLabel(id, txt);
			return;
		}
		const el = document.getElementById(id);
		if (el && el.querySelector) el.querySelector("span").textContent = txt;
	}
	function buildGaia(bytes) {
		const r = buildCloudBuf(bytes, "gaia");
		if (!r) return;
		CL.G = r;
		gaiaRaw = bytes;
		gaiaRange = 100;
		cloudLabel("t-gaia", "Gaia stars (" + (r.n >= 1e3 ? (r.n / 1e3 | 0) + "k" : r.n) + " <100 pc)");
	}
	function buildGaiaBig(bytes) {
		const r = buildCloudBuf(bytes, "gaiabig");
		if (!r) return;
		CL.G = r;
		gaiaRaw = bytes;
		gaiaRange = 150;
		cloudLabel("t-gaia", "Gaia stars (" + (r.n / 1e6).toFixed(1) + "M <150 pc)");
	}
	function buildBelt(bytes) {
		if (!bytes || bytes.length < 16) return;
		beltEpoch = new DataView(bytes.buffer, bytes.byteOffset, 8).getFloat64(0, true) || 0;
		bytes = bytes.subarray(8);
		const r = buildCloudBuf(bytes, "belt");
		if (!r) return;
		CL.B = r;
		beltRaw = bytes;
		cloudLabel("t-belt", "Asteroid field (" + (r.n / 1e3 | 0) + "k)");
	}
	function buildVars(bytes) {
		const r = buildCloudBuf(bytes, "vars");
		if (!r) return;
		CL.V = r;
		varRaw = bytes;
		cloudLabel("t-var", "Variable stars (" + (r.n / 1e3 | 0) + "k Cepheids·RR Lyr)");
	}
	function buildOB(bytes) {
		const r = buildCloudBuf(bytes, "ob");
		if (!r) return;
		CL.O = r;
		obRaw = bytes;
		cloudLabel("t-ob", "OB stars (" + (r.n / 1e3 | 0) + "k arm tracers)");
	}
	function buildWeb(bytes) {
		const r = buildCloudBuf(bytes, "web");
		if (!r) return;
		CL.W = r;
		webRaw = bytes;
		cloudLabel("t-web", "Cosmic web (" + (r.n / 1e3 | 0) + "k galaxies)");
	}
	function buildQso(bytes) {
		if (bytes && CL.Q && bytes.length / 8 <= CL.Q.n) return;
		const r = buildCloudBuf(bytes, "qso");
		if (!r) return;
		CL.Q = r;
		qsoRaw = bytes;
		cloudLabel("t-qso", "Quasars (" + (r.n / 1e3 | 0) + "k)");
	}
	function glRestoreClouds() {
		if (!glOK) return;
		if (gaiaRaw) {
			const r = buildCloudBuf(gaiaRaw, gaiaRange > 100 ? "gaiabig" : "gaia");
			if (r) CL.G = r;
		}
		if (beltRaw) {
			const r = buildCloudBuf(beltRaw, "belt");
			if (r) CL.B = r;
		}
		if (webRaw) {
			const r = buildCloudBuf(webRaw, "web");
			if (r) CL.W = r;
		}
		if (qsoRaw) {
			const r = buildCloudBuf(qsoRaw, "qso");
			if (r) CL.Q = r;
		}
		if (obRaw) {
			const r = buildCloudBuf(obRaw, "ob");
			if (r) CL.O = r;
		}
		if (varRaw) {
			const r = buildCloudBuf(varRaw, "vars");
			if (r) CL.V = r;
		}
	}
	function loadExtragal() {
		if (!glOK) return;
		try {
			if (typeof window.__WEB_B64__ === "string" && window.__WEB_B64__.length) {
				buildWeb(b64ToBytes(window.__WEB_B64__));
				window.__WEB_B64__ = null;
			} else fetch("data/cosmicweb.bin").then((r) => r.ok ? r.arrayBuffer() : null).then((a) => {
				if (a) buildWeb(new Uint8Array(a));
			}).catch(() => {});
			if (typeof window.__QSO_B64__ === "string" && window.__QSO_B64__.length) {
				buildQso(b64ToBytes(window.__QSO_B64__));
				window.__QSO_B64__ = null;
			} else fetch("data/quasars.bin").then((r) => r.ok ? r.arrayBuffer() : null).then((a) => {
				if (a) buildQso(new Uint8Array(a));
			}).catch(() => {});
			fetch("data/quasarsbig.bin").then((r) => r.ok ? r.arrayBuffer() : null).then((a) => {
				if (a) buildQso(new Uint8Array(a));
			}).catch(() => {});
			if (typeof window.__BELT_B64__ === "string" && window.__BELT_B64__.length) {
				buildBelt(b64ToBytes(window.__BELT_B64__));
				window.__BELT_B64__ = null;
			} else fetch("data/belt.bin").then((r) => r.ok ? r.arrayBuffer() : null).then((a) => {
				if (a) buildBelt(new Uint8Array(a));
			}).catch(() => {});
			fetch("data/gaiabig.bin").then((r) => r.ok ? r.arrayBuffer() : null).then((a) => {
				if (a) buildGaiaBig(new Uint8Array(a));
			}).catch(() => {});
			if (typeof window.__OB_B64__ === "string" && window.__OB_B64__.length) {
				buildOB(b64ToBytes(window.__OB_B64__));
				window.__OB_B64__ = null;
			} else fetch("data/obstars.bin").then((r) => r.ok ? r.arrayBuffer() : null).then((a) => {
				if (a) buildOB(new Uint8Array(a));
			}).catch(() => {});
			if (typeof window.__VAR_B64__ === "string" && window.__VAR_B64__.length) {
				buildVars(b64ToBytes(window.__VAR_B64__));
				window.__VAR_B64__ = null;
			} else fetch("data/variables.bin").then((r) => r.ok ? r.arrayBuffer() : null).then((a) => {
				if (a) buildVars(new Uint8Array(a));
			}).catch(() => {});
		} catch (e) {}
	}
	function b64ToBytes(b64) {
		const bin = atob(b64), len = bin.length, u = new Uint8Array(len);
		for (let i = 0; i < len; i++) u[i] = bin.charCodeAt(i);
		return u;
	}
	function loadGaia() {
		if (!glOK) return;
		try {
			if (typeof window.__GAIA_B64__ === "string" && window.__GAIA_B64__.length) {
				buildGaia(b64ToBytes(window.__GAIA_B64__));
				window.__GAIA_B64__ = null;
				return;
			}
			fetch("data/gaia.bin").then((r) => r.ok ? r.arrayBuffer() : null).then((a) => {
				if (a) buildGaia(new Uint8Array(a));
			}).catch(() => {});
		} catch (e) {}
	}
	function glShared(L) {
		const gl = GL, foc = Math.min(W, H) * .62;
		gl.uniform1f(L.u_yaw, S.yaw);
		gl.uniform1f(L.u_pitch, S.pitch);
		gl.uniform1f(L.u_camZ, S.camZ);
		gl.uniform1f(L.u_foc, foc * GLDPR);
		gl.uniform1f(L.u_dpr, GLDPR);
		gl.uniform1f(L.u_LOG0, LOG0);
		gl.uniform1f(L.u_KDEC, KDEC);
		gl.uniform1f(L.u_REALK, REALK);
		gl.uniform3f(L.u_ctr, ctr.x, ctr.y, ctr.z);
		gl.uniform2f(L.u_res, glcv.width, glcv.height);
		gl.uniform1i(L.u_real, S.realScale ? 1 : 0);
		gl.uniform1f(L.u_maxPt, glMaxPt);
		gl.uniform1f(L.u_alphaK, 1);
		if (lensPar && L.u_lensOn) {
			gl.uniform1f(L.u_lensOn, 1);
			gl.uniform4f(L.u_lens, lensPar.x * GLDPR, lensPar.y * GLDPR, lensPar.e * GLDPR, lensPar.depth);
		} else if (L.u_lensOn) gl.uniform1f(L.u_lensOn, 0);
	}
	function drawCloud(h, cull, minPx, alphaK, beltDt) {
		const gl = GL, L = progU.loc, d = CLOUD_DEC[h.key];
		gl.uniform1f(L.u_cull, cull);
		gl.uniform1f(L.u_minPx, minPx);
		gl.uniform1f(L.u_alphaK, alphaK || 1);
		gl.uniform1f(L.u_decDist, d.dist);
		gl.uniform2f(L.u_decMag, d.mag[0], d.mag[1]);
		gl.uniform1f(L.u_colMode, d.mode);
		if (d.fix) gl.uniform3f(L.u_colFix, d.fix[0] / 255, d.fix[1] / 255, d.fix[2] / 255);
		if (d.pal) {
			const pa = [];
			for (let i = 0; i < 4; i++) {
				const c = d.pal[i] || d.pal[0];
				pa.push(c[0] / 255, c[1] / 255, c[2] / 255);
			}
			gl.uniform3fv(L.u_decPal, pa);
		}
		gl.uniform1f(L.u_isBelt, d.belt ? 1 : 0);
		gl.uniform1f(L.u_beltDt, d.belt ? beltDt || 0 : 0);
		gl.bindVertexArray(h.vao);
		gl.drawArrays(gl.POINTS, 0, h.n);
	}
	function glRender() {
		const gl = GL;
		if (hdrOK) gl.bindFramebuffer(gl.FRAMEBUFFER, hdrFB);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.useProgram(progU.p);
		glShared(progU.loc);
		if (solarA < .5) {
			if (CL.W && S.web) drawCloud(CL.W, .05, 1.1);
			if (CL.Q && S.qso) drawCloud(CL.Q, .05, 1.15);
		}
		if (CL.B && S.belt && solarA > .05) drawCloud(CL.B, .03, 1.05, 1, beltEpoch ? solarJD() - beltEpoch : 0);
		if (CL.G && S.gaia) drawCloud(CL.G, .12, 1.2, hdrOK ? 1 : .85);
		if (solarA < .5 && sysA < .5) {
			if (CL.O && S.ob) drawCloud(CL.O, .05, 1, .8);
			if (CL.V && S.vars) drawCloud(CL.V, .05, 1);
		}
		const L = progF.loc;
		gl.useProgram(progF.p);
		glShared(L);
		gl.uniform1f(L.u_pmYears, S.pm ? S.pmYears : 0);
		gl.uniform1f(L.u_hostMode, 0);
		gl.uniform1f(L.u_glow, 0);
		if (glBufH) {
			gl.uniform1f(L.u_hostMode, 1);
			gl.uniform1f(L.u_year, S.year);
			gl.uniform1f(L.u_facColor, S.facColor ? 1 : 0);
			gl.uniform1f(L.u_sizeOn, S.size ? 1 : 0);
			gl.uniform1f(L.u_veil, S.veil ? 1 : 0);
			gl.uniform1f(L.u_bnd, BND);
			const fv = [];
			for (const k of [
				"kepler",
				"tess",
				"k2",
				"rv",
				"micro",
				"imaging",
				"ground",
				"other"
			]) fv.push(S.facHidden.has(k) ? 0 : 1);
			gl.uniform1fv(L.u_facVis, fv);
			gl.uniform1f(L.u_cull, 0);
			gl.uniform1f(L.u_minPx, 0);
			gl.bindVertexArray(glBufH.vao);
			gl.drawArrays(gl.POINTS, 0, glBufH.n);
			gl.uniform1f(L.u_hostMode, 0);
		}
		if (solarA < .5 && sysA < .5) {
			gl.uniform1f(L.u_cull, .05);
			gl.uniform1f(L.u_minPx, 1);
			if (glBufP && S.psr) {
				gl.bindVertexArray(glBufP.vao);
				gl.drawArrays(gl.POINTS, 0, glBufP.n);
			}
			if (glBufC && S.oclu) {
				gl.bindVertexArray(glBufC.vao);
				gl.drawArrays(gl.POINTS, 0, glBufC.n);
			}
		}
		gl.uniform1f(L.u_cull, .34);
		gl.uniform1f(L.u_minPx, 0);
		if (S.hyg && glBuf) {
			gl.bindVertexArray(glBuf.vao);
			gl.drawArrays(gl.POINTS, 0, glBuf.n);
			gl.uniform1f(L.u_glow, 1);
			gl.drawArrays(gl.POINTS, 0, glBuf.n);
			gl.uniform1f(L.u_glow, 0);
		}
		gl.bindVertexArray(null);
		if (hdrOK) {
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			gl.disable(gl.BLEND);
			gl.useProgram(progT.p);
			gl.bindTexture(gl.TEXTURE_2D, hdrTex);
			gl.drawArrays(gl.TRIANGLES, 0, 3);
			gl.enable(gl.BLEND);
		}
	}
	let last = 0, lastGw = 0;
	function frame(t) {
		const dt = Math.min(.05, (t - last) / 1e3 || 0);
		last = t;
		if (FOLLOW) {
			const w = FOLLOW === SUN ? [
				0,
				0,
				0
			] : navWorld(FOLLOW);
			if (w) {
				tgtCtr.x = w[0];
				tgtCtr.y = w[1];
				tgtCtr.z = w[2];
			} else FOLLOW = null;
		}
		if (S.autorot && !dragging) tgtYaw += dt * .1;
		if (playing) {
			playAcc += dt;
			if (playAcc > .42) {
				playAcc = 0;
				if (S.year < 2026) setYear(S.year + 1);
				else stopPlay();
			}
		}
		if (solPlaying) {
			S.tOffsetDays += dt * 365;
			if (S.tOffsetDays > 36525) {
				S.tOffsetDays = 36525;
				solStop();
			}
			solTime.value = S.tOffsetDays;
			setSolDate();
		}
		if (keys.size) {
			if (S.realScale) flySpeed = Math.min(flySpeed * 1.06 + .06, 150);
			else flySpeed = 1;
			const step = (S.realScale ? S.camZ * flySpeed : Math.max(S.camZ, camDist)) * .06;
			let mx = 0, my = 0, mz = 0;
			if (keys.has("w")) {
				mx += camFwd[0];
				my += camFwd[1];
				mz += camFwd[2];
			}
			if (keys.has("s")) {
				mx -= camFwd[0];
				my -= camFwd[1];
				mz -= camFwd[2];
			}
			if (keys.has("d")) {
				mx += camRight[0];
				my += camRight[1];
				mz += camRight[2];
			}
			if (keys.has("a")) {
				mx -= camRight[0];
				my -= camRight[1];
				mz -= camRight[2];
			}
			if (keys.has("r")) {
				mx += camUp[0];
				my += camUp[1];
				mz += camUp[2];
			}
			if (keys.has("f")) {
				mx -= camUp[0];
				my -= camUp[1];
				mz -= camUp[2];
			}
			tgtCtr.x += mx * step;
			tgtCtr.y += my * step;
			tgtCtr.z += mz * step;
			S.autorot = false;
			S.pinned = null;
			FOLLOW = null;
		} else flySpeed = 1;
		if (gwOnScreen && t - lastGw > 70) {
			lastGw = t;
			dirty = true;
		}
		const cs = Math.abs(ctr.x) + Math.abs(ctr.y) + Math.abs(ctr.z) + 1;
		const anim = S.autorot && !dragging || dragging || playing || solPlaying || keys.size > 0 || Math.abs(tgtYaw - S.yaw) > 1e-4 || Math.abs(tgtPitch - S.pitch) > 1e-4 || Math.abs(tgtCamZ - S.camZ) > S.camZ * 2e-4 + 1e-12 || Math.abs(tgtCtr.x - ctr.x) + Math.abs(tgtCtr.y - ctr.y) + Math.abs(tgtCtr.z - ctr.z) > cs * 1e-5;
		if (dirty || anim) {
			ctr.x += (tgtCtr.x - ctr.x) * .18;
			ctr.y += (tgtCtr.y - ctr.y) * .18;
			ctr.z += (tgtCtr.z - ctr.z) * .18;
			S.yaw += (tgtYaw - S.yaw) * .12;
			S.pitch += (tgtPitch - S.pitch) * .12;
			S.camZ += (tgtCamZ - S.camZ) * .12;
			try {
				render();
			} catch (err) {
				if (!window.__rerr) {
					window.__rerr = 1;
					console.error("render error:", err);
				}
			}
			dirty = false;
		}
		requestAnimationFrame(frame);
	}
	let measureMode = false, measA = null, measB = null;
	function physPos(o) {
		if (o && o._e) return [
			o._e[0] * AU_PC,
			o._e[2] * AU_PC,
			o._e[1] * AU_PC
		];
		const w = objWorld(o);
		if (!w) return null;
		const m2 = Math.hypot(w[0], w[1], w[2]);
		if (m2 < 1e-12) return [
			0,
			0,
			0
		];
		const r = invScale(m2) / m2;
		return [
			w[0] * r,
			w[1] * r,
			w[2] * r
		];
	}
	function measWorld(P) {
		const r = Math.hypot(P[0], P[1], P[2]);
		if (r < 1e-15) return [
			0,
			0,
			0
		];
		const R = scale(r) / r;
		return [
			P[0] * R,
			P[1] * R,
			P[2] * R
		];
	}
	function measName(o) {
		return o.n || o.h || "object";
	}
	function drawMeasure() {
		if (!measA || !measA.P) return;
		const wA = measWorld(measA.P), pA = project(wA[0], wA[1], wA[2]);
		ctx.beginPath();
		ctx.arc(pA.x, pA.y, 6, 0, 6.2832);
		ctx.strokeStyle = "rgba(255,207,107,.9)";
		ctx.lineWidth = 1.4;
		ctx.stroke();
		if (!measB || !measB.P) return;
		const wB = measWorld(measB.P), pB = project(wB[0], wB[1], wB[2]);
		if (pA.depth <= NEAR || pB.depth <= NEAR) return;
		ctx.beginPath();
		ctx.arc(pB.x, pB.y, 6, 0, 6.2832);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(pA.x, pA.y);
		ctx.lineTo(pB.x, pB.y);
		ctx.setLineDash([5, 4]);
		ctx.strokeStyle = "rgba(255,207,107,.7)";
		ctx.stroke();
		ctx.setLineDash([]);
		const dpc = Math.hypot(measA.P[0] - measB.P[0], measA.P[1] - measB.P[1], measA.P[2] - measB.P[2]);
		const txt = dpc < .001 ? (dpc / AU_PC).toFixed(2) + " AU" : fmt(dpc * PC2LY) + " ly · light needs " + fmt(dpc * PC2LY) + " yr";
		ctx.font = "11px ui-monospace,monospace";
		ctx.fillStyle = "rgba(255,220,140,.95)";
		ctx.fillText(txt, (pA.x + pB.x) / 2 + 8, (pA.y + pB.y) / 2 - 6);
	}
	function measurePick(hit) {
		const P = physPos(hit);
		if (!P) return;
		if (!measA || measB) {
			measA = {
				o: hit,
				P
			};
			measB = null;
			searchMsg.textContent = "📏 " + measName(hit) + " — pick a second object";
		} else {
			measB = {
				o: hit,
				P
			};
			const dpc = Math.hypot(measA.P[0] - P[0], measA.P[1] - P[1], measA.P[2] - P[2]);
			searchMsg.textContent = "📏 " + measName(measA.o) + " ↔ " + measName(hit) + " = " + (dpc < .001 ? (dpc / AU_PC).toFixed(2) + " AU" : fmt(dpc * PC2LY) + " ly");
		}
		dirty = true;
	}
	document.getElementById("measureBtn").addEventListener("click", () => {
		measureMode = !measureMode;
		measA = measB = null;
		document.getElementById("measureBtn").classList.toggle("active", measureMode);
		searchMsg.textContent = measureMode ? "📏 click the first object" : "";
		dirty = true;
	});
	const TOUR = [
		{
			t: "1 · Earth — home",
			d: "Every planet, dwarf planet and moon here sits at its real position for today’s date (JPL ephemerides). The moons orbit in their true planes — run the time slider and watch them move.",
			go: () => {
				const e = PLANETS.find((p) => p.n === "Earth");
				enterSolar();
				S.pinned = e;
			}
		},
		{
			t: "2 · Voyager 1 — the farthest human object",
			d: "Launched 1977, now ~171 AU out — a radio signal takes almost a day for the round trip. The blue dashed line is its real outbound trajectory (JPL Horizons). Beyond it: the heliopause, where the Sun’s wind yields to interstellar space.",
			go: () => {
				if (!S.probes) {
					S.probes = true;
					syncToggle("t-probes", true);
				}
				const v = PROBES.find((p) => p.n === "Voyager 1");
				enterSolar();
				S.pinned = v;
			}
		},
		{
			t: "3 · Proxima Centauri — the nearest star",
			d: "4.25 light-years away. The gap between our solar system and this red dwarf is the real emptiness of interstellar space — switch “Compact view” off later to feel it. Proxima hosts at least one Earth-sized planet in its habitable zone.",
			go: () => {
				const h = HYG.find((x) => x.n === "Proxima Centauri");
				if (h) {
					S.pinned = h;
					focusOnHyg(h);
				}
			}
		},
		{
			t: "4 · TRAPPIST-1 — seven rocky worlds",
			d: "A cool red dwarf 40 ly away with seven Earth-sized planets — several inside the green habitable zone. Their positions on the orbits are the REAL phases for today, computed from the measured transit ephemerides.",
			go: () => {
				const st = STARS.find((x) => x.h === "TRAPPIST-1");
				if (st) focusOn(st);
			}
		},
		{
			t: "5 · Orion Nebula — a stellar nursery",
			d: "1,300 ly away: the nearest massive star-forming region, visible to the naked eye as the middle “star” of Orion’s sword. The blue dots all around are 131,000 real Gaia OB stars — hot young stars tracing the spiral arms.",
			go: () => {
				const o = DSO.find((x) => x.n.indexOf("Orion Nebula") >= 0);
				if (o) {
					S.pinned = o;
					flyTo(o);
				}
			}
		},
		{
			t: "6 · Sagittarius A* — our black hole",
			d: "The 4.3-million-solar-mass black hole at the centre of the Milky Way, 27,000 ly away. The star S2 whips around it every 16 years — its real measured orbit is drawn here; the 2018 pericentre passage confirmed general relativity.",
			go: () => {
				S.pinned = SGRA;
				flyTo(SGRA);
			}
		},
		{
			t: "7 · Andromeda — the next galaxy",
			d: "M31, 2.54 million ly away — the light you see left it before humans existed. It approaches us at ~110 km/s and will merge with the Milky Way in ~4.5 billion years.",
			go: () => {
				const g = GAL.find((x) => x.n && x.n.indexOf("Andromeda") >= 0);
				if (g) focusOnGalaxy(g);
			}
		},
		{
			t: "8 · Laniakea — our supercluster",
			d: "100,000 galaxies, 520 million ly across, all drifting toward the Great Attractor. The faint dots everywhere are 43,000 real galaxies of the 2MRS survey — the cosmic web.",
			go: () => {
				const o = DSO.find((x) => x.n.indexOf("Laniakea") >= 0);
				if (o) {
					S.pinned = o;
					flyTo(o);
				}
			}
		},
		{
			t: "9 · The edge of the observable universe",
			d: "The blue shell marks the cosmic microwave background, ~46 billion ly in every direction — the oldest light there is. Beyond it, the universe continues, but its light hasn’t reached us yet. The purple dots: a million real quasars.",
			go: () => {
				if (!S.edge) {
					S.edge = true;
					syncToggle("t-edge", true);
				}
				S.pinned = null;
				tgtCtr.x = tgtCtr.y = tgtCtr.z = 0;
				tgtCamZ = 16;
				tgtPitch = -.35;
			}
		}
	];
	let tourIdx = -1;
	function tourShow(i) {
		tourIdx = Math.max(0, Math.min(TOUR.length - 1, i));
		const st = TOUR[tourIdx];
		st.go();
		document.getElementById("tourTitle").textContent = st.t;
		document.getElementById("tourText").textContent = st.d;
		document.getElementById("tourStep").textContent = tourIdx + 1 + " / " + TOUR.length;
		document.getElementById("tourPanel").style.display = "block";
		dirty = true;
	}
	function tourEnd() {
		tourIdx = -1;
		document.getElementById("tourPanel").style.display = "none";
		S.pinned = null;
		dirty = true;
	}
	document.getElementById("tourBtn").addEventListener("click", () => {
		if (S.realScale) clickToggle("t-real");
		tourShow(0);
	});
	document.getElementById("tourNext").addEventListener("click", () => {
		if (tourIdx >= TOUR.length - 1) tourEnd();
		else tourShow(tourIdx + 1);
	});
	document.getElementById("tourPrev").addEventListener("click", () => tourShow(tourIdx - 1));
	document.getElementById("tourEnd").addEventListener("click", tourEnd);
	const HASH_KEYS = [
		"ast",
		"autorot",
		"belt",
		"con",
		"dso",
		"edge",
		"freelook",
		"gaia",
		"galaxies",
		"gpu",
		"helio",
		"hyg",
		"hz",
		"moons",
		"mw",
		"mw3d",
		"ob",
		"oclu",
		"probes",
		"psr",
		"qso",
		"rings",
		"size",
		"tno",
		"vars",
		"veil",
		"web",
		"lag",
		"lens",
		"iso"
	];
	function viewHash() {
		const keys = HASH_KEYS;
		let m = 0;
		keys.forEach((k, i) => {
			if (S[k]) m |= 1 << i;
		});
		return "v1_" + [
			S.yaw.toFixed(4),
			S.pitch.toFixed(4),
			S.camZ.toExponential(4),
			ctr.x.toExponential(4),
			ctr.y.toExponential(4),
			ctr.z.toExponential(4),
			S.realScale ? 1 : 0,
			Math.round(S.tOffsetDays),
			(m >>> 0).toString(36)
		].join("_");
	}
	function applyHash() {
		try {
			const h = (typeof location !== "undefined" && location.hash || "").replace(/^#/, "");
			if (!h.startsWith("v1_")) return;
			const p = h.split("_");
			if (p.length < 10) return;
			S.yaw = tgtYaw = +p[1];
			S.pitch = tgtPitch = +p[2];
			S.camZ = tgtCamZ = +p[3];
			ctr.x = tgtCtr.x = +p[4];
			ctr.y = tgtCtr.y = +p[5];
			ctr.z = tgtCtr.z = +p[6];
			S.realScale = p[7] === "1";
			syncToggle("t-real", S.realScale);
			S.tOffsetDays = +p[8] || 0;
			const m = parseInt(p[9], 36) || 0;
			HASH_KEYS.forEach((k, i) => {
				if (!TOGGLE_REG[k]) return;
				const v = !!(m & 1 << i);
				S[k] = v;
				syncToggle(TOGGLE_REG[k], v);
			});
			document.getElementById("hud-mwmap").style.display = S.mw ? "block" : "none";
			dirty = true;
		} catch (e) {}
	}
	let lastHash = "";
	if (typeof history !== "undefined" && history.replaceState) setInterval(() => {
		const h = viewHash();
		if (h !== lastHash) {
			lastHash = h;
			try {
				history.replaceState(null, "", "#" + h);
			} catch (e) {}
		}
	}, 2e3);
	document.getElementById("shareBtn").addEventListener("click", () => {
		const h = viewHash();
		try {
			history.replaceState(null, "", "#" + h);
		} catch (e) {}
		const u = typeof location !== "undefined" ? location.href : h;
		const done = () => {
			searchMsg.textContent = "view link copied ✓";
		};
		if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(u).then(done, () => {
			searchMsg.textContent = u;
		});
		else searchMsg.textContent = u;
	});
	let _sugIdx = null;
	function sugIndex() {
		if (_sugIdx) return _sugIdx;
		const ix = [];
		const add = (n, k) => {
			if (n) ix.push([
				n,
				n.toLowerCase(),
				k
			]);
		};
		SOLAR_BODIES.forEach((b) => {
			add(b.n, b.kind);
			(b.moons || []).forEach((m) => add(m.n, "Moon"));
		});
		add("Sun", "Star");
		PROBES.forEach((p) => add(p.n, "Spacecraft"));
		SMALL.forEach((o) => add(o.n, o.kind));
		DSO.forEach((o) => add(o.n, (DSO_T[o.t] || {}).l || "Deep sky"));
		HYG.forEach((h) => add(h.n, "Star"));
		GAL.forEach((g) => add(g.n, "Galaxy"));
		STARS.forEach((st) => add(st.h, "Exoplanet host"));
		CLUSTERS.forEach((c) => add(c.n, (CLU_T[c.ct || 0] || {}).l || "Cluster"));
		PULSARS.forEach((p) => add(p.n, "Pulsar"));
		return _sugIdx = ix;
	}
	function suggestList(q) {
		q = (q || "").trim().toLowerCase();
		if (!q || q.length < 2) return [];
		const ix = sugIndex(), out = [];
		for (const e of ix) if (e[1].startsWith(q)) {
			out.push(e);
			if (out.length >= 6) break;
		}
		if (out.length < 6) {
			for (const e of ix) if (!e[1].startsWith(q) && e[1].includes(q)) {
				out.push(e);
				if (out.length >= 6) break;
			}
		}
		return out;
	}
	if (document.querySelectorAll) document.querySelectorAll(".ctl-h").forEach((h) => h.addEventListener("click", () => h.parentElement.classList.toggle("closed")));
	(function() {
		const B = document.body;
		const setMini = (v) => {
			if (B.classList) {
				B.classList.toggle("time-mini", v);
				dirty = true;
			}
		};
		if (document.querySelectorAll) document.querySelectorAll(".time-min").forEach((el) => el.addEventListener("click", (e) => {
			if (e.stopPropagation) e.stopPropagation();
			setMini(!(B.classList && B.classList.contains("time-mini")));
		}));
		for (const id of ["hud-time", "hud-soltime"]) {
			const p = document.getElementById(id);
			if (p && p.addEventListener) p.addEventListener("click", () => {
				if (B.classList && B.classList.contains("time-mini")) setMini(false);
			});
		}
	})();
	(function() {
		const B = document.body;
		try {
			if (matchMedia("(max-width:720px)").matches && B.appendChild) B.appendChild(document.getElementById("info"));
		} catch (e) {}
	})();
	api.zoomBy = (f) => {
		let ax = W / 2, ay = H / 2;
		if (S.pinned) {
			const w = objWorld(S.pinned);
			if (w) {
				const p = project(w[0], w[1], w[2]);
				if (p.depth > NEAR && p.x > 0 && p.x < W && p.y > 0 && p.y < H) {
					ax = p.x;
					ay = p.y;
				}
			}
		}
		zoomFactorAt(ax, ay, f);
		dirty = true;
	};
	const uniEl = document.getElementById("uniTime"), uniVal = document.getElementById("uniVal");
	const uniPlayBtn = document.getElementById("uniPlay"), uniNowBtn = document.getElementById("uniNow");
	function setUni(v) {
		const t = Math.sign(v) * Math.pow(Math.abs(v) / 1e3, 3) * 5e4;
		S.pmYears = Math.round(t);
		S.pm = v !== 0;
		S.tOffsetDays = Math.max(-36525, Math.min(36525, t * 365.25));
		if (typeof setSolDate === "function") try {
			setSolDate();
		} catch (err) {}
		if (uniVal) {
			const yr = (/* @__PURE__ */ new Date()).getFullYear() + t;
			uniVal.textContent = v === 0 ? "today" : Math.abs(t) < 200 ? new Date(Date.now() + t * 315576e5).toISOString().slice(0, 10) : (t > 0 ? "+" : "−") + Math.abs(Math.round(t)).toLocaleString("en-US") + " yr (" + Math.round(yr) + ")";
		}
		dirty = true;
	}
	let uniTimer = null;
	if (uniEl && uniEl.addEventListener) {
		uniEl.addEventListener("input", (ev) => setUni(+ev.target.value));
		if (uniPlayBtn) uniPlayBtn.addEventListener("click", () => {
			if (uniTimer) {
				clearInterval(uniTimer);
				uniTimer = null;
				uniPlayBtn.textContent = "▶";
			} else {
				uniPlayBtn.textContent = "⏸";
				uniTimer = setInterval(() => {
					let v = +uniEl.value + 2;
					if (v > 1e3) v = -1e3;
					uniEl.value = v;
					setUni(v);
				}, 120);
			}
		});
		if (uniNowBtn) uniNowBtn.addEventListener("click", () => {
			uniEl.value = 0;
			setUni(0);
			if (uniTimer) {
				clearInterval(uniTimer);
				uniTimer = null;
				if (uniPlayBtn) uniPlayBtn.textContent = "▶";
			}
		});
	}
	api.clickToggle = clickToggle;
	api.doSearch = doSearch;
	api.getS = () => S;
	api.suggest = suggestList;
	api.searchMsgText = () => searchMsg.textContent;
	api.toggleFac = toggleFac;
	api.facColorToggle = facColorToggle;
	api.facList = () => facList;
	api.searchInput = (q) => {
		if (q && q.trim().length > 2) doSearch(q);
	};
	api.liveNeoFocus = (id) => {
		const o = LIVE.neos.find((n) => n.id === id);
		if (!o) return;
		if (o.kd) {
			o._el = keplerSB(o.kd, solarJD());
			o._e = orbPoint(o._el, o._el.E);
			const w = eclToWorld(o._e[0], o._e[1], o._e[2]);
			S.pinned = o;
			aim(w[0], w[1], w[2], scale(2.2 * AU_PC));
		} else {
			S.pinned = null;
			enterSolar();
		}
		dirty = true;
	};
	api.liveStats = () => {
		const y = (/* @__PURE__ */ new Date()).getFullYear();
		let n = 0;
		for (const st of STARS) if (st.fy === y) n++;
		return {
			exoY: n,
			year: y
		};
	};
	LIVE.onUpdate = () => {
		dirty = true;
	};
	if (typeof window !== "undefined") window.__ku = {
		api,
		live: LIVE,
		redraw: () => {
			dirty = true;
		}
	};
	startLive();
	if (UI.fac) UI.fac(facList);
	if (!(typeof location !== "undefined" && location.hash || "").includes("v1_")) clickToggle("t-real");
	applyHash();
	try {
		console.log("Known Universe build 2026-07-12 11:57");
	} catch (e) {}
	initGL();
	loadGaia();
	loadExtragal();
	requestAnimationFrame(frame);
}
function runEngine() {
	__run();
}
//#endregion
//#region src/lib/stores.js
var toggleState = writable({});
var labels = writable({});
var searchMsg = writable("");
var facList = writable([]);
var facHidden = writable(/* @__PURE__ */ new Set());
var facColor = writable(false);
var timeBar = writable(false);
//#endregion
//#region src/components/SearchBox.svelte
var root$12 = /* @__PURE__ */ from_html(`<div> <span> </span></div>`);
var root_1$5 = /* @__PURE__ */ from_html(`<div class="sugbox"></div>`);
var root_2$3 = /* @__PURE__ */ from_html(`<div class="searchMsg"> </div>`);
var root_3$2 = /* @__PURE__ */ from_html(`<div><input class="searchIn" type="text" spellcheck="false" placeholder="Search: Earth, Sirius, TRAPPIST-1, PSR J0332…"/> <!> <!></div>`);
function SearchBox($$anchor, $$props) {
	push($$props, true);
	const $searchMsg = () => store_get(searchMsg, "$searchMsg", $$stores);
	const [$$stores, $$cleanup] = setup_stores();
	let mode = prop($$props, "mode", 3, "desktop"), onpick = prop($$props, "onpick", 3, () => {});
	let q = /* @__PURE__ */ state("");
	let sugs = /* @__PURE__ */ user_derived(() => get(q).trim().length >= 2 && api.suggest ? api.suggest(get(q)) : []);
	function go(name) {
		if (api.doSearch) api.doSearch(name);
		set(q, "");
		onpick()(name);
	}
	function key(e) {
		if (e.key === "Enter" && get(q).trim()) go(get(q).trim());
		if (e.key === "Escape") set(q, "");
	}
	var div = root_3$2();
	var input = child(div);
	remove_input_defaults(input);
	var node = sibling(input, 2);
	var consequent = ($$anchor) => {
		var div_1 = root_1$5();
		each(div_1, 21, () => get(sugs), index, ($$anchor, sg) => {
			var div_2 = root$12();
			var text = child(div_2, true);
			var span = sibling(text);
			var text_1 = child(span, true);
			reset(span);
			reset(div_2);
			template_effect(() => {
				set_text(text, get(sg)[0]);
				set_text(text_1, get(sg)[2]);
			});
			delegated("click", div_2, () => go(get(sg)[0]));
			append($$anchor, div_2);
		});
		reset(div_1);
		append($$anchor, div_1);
	};
	if_block(node, ($$render) => {
		if (get(sugs).length) $$render(consequent);
	});
	var node_1 = sibling(node, 2);
	var consequent_1 = ($$anchor) => {
		var div_3 = root_2$3();
		var text_2 = child(div_3, true);
		reset(div_3);
		template_effect(() => set_text(text_2, $searchMsg()));
		append($$anchor, div_3);
	};
	if_block(node_1, ($$render) => {
		if ($searchMsg()) $$render(consequent_1);
	});
	reset(div);
	template_effect(() => {
		set_class(div, 1, clsx(mode() === "desktop" ? "panel" : ""));
		set_attribute(div, "id", mode() === "desktop" ? "hud-search" : void 0);
	});
	delegated("keydown", input, key);
	bind_value(input, () => get(q), ($$value) => set(q, $$value));
	append($$anchor, div);
	pop();
	$$cleanup();
}
delegate(["keydown", "click"]);
//#endregion
//#region src/components/MwMap.svelte
var root$11 = /* @__PURE__ */ from_html(`<div class="mwcap">Schematic · ~100,000 light-years across</div>`);
var root_1$4 = /* @__PURE__ */ from_html(`<div id="hud-mwmap"><div class="label lbl-btn" role="button" tabindex="0">Milky Way · top-down <span class="caret"> </span></div> <canvas id="mwmap" width="198" height="150"></canvas> <!></div>`);
function MwMap($$anchor) {
	let open = /* @__PURE__ */ state(false);
	var div = root_1$4();
	let classes;
	var div_1 = child(div);
	var span = sibling(child(div_1));
	var text = child(span, true);
	reset(span);
	reset(div_1);
	var canvas = sibling(div_1, 2);
	var node = sibling(canvas, 2);
	var consequent = ($$anchor) => {
		append($$anchor, root$11());
	};
	if_block(node, ($$render) => {
		if (get(open)) $$render(consequent);
	});
	reset(div);
	template_effect(() => {
		classes = set_class(div, 1, "panel", null, classes, { mini: !get(open) });
		set_text(text, get(open) ? "▾" : "▸");
		set_style(canvas, `width:198px;height:150px;display:${get(open) ? "block" : "none"}`);
	});
	delegated("click", div_1, () => set(open, !get(open)));
	delegated("keydown", div_1, (e) => e.key === "Enter" && set(open, !get(open)));
	append($$anchor, div);
}
delegate(["click", "keydown"]);
//#endregion
//#region src/components/Controls.svelte
var root$10 = /* @__PURE__ */ from_html(`<div class="label">Star colour = temperature</div> <div class="spectrum"></div> <div class="spectrum-ax"><span>hot · 30,000 K</span><span>cool · 3,000 K</span></div> <div class="leg-row"><span style="display:flex;align-items:center;gap:5px;flex:0 0 auto"><span class="mk" style="width:4px;height:4px;background:var(--dim)"></span><span class="mk" style="width:11px;height:11px;background:var(--dim)"></span></span>Size = planet radius</div> <div class="leg-row"><span class="mk" style="background:#eafffb;box-shadow:0 0 8px #fff"></span>Sun — you are here</div> <div class="leg-row"><span class="mk" style="background:var(--cyan)"></span>discovered in the selected year</div> <div class="leg-row"><span class="mk" style="background:#e6473c;box-shadow:0 0 8px #e6473c"></span>beyond the neighbourhood</div> <div class="leg-row"><span class="mk" style="width:5px;height:5px;background:#cfe0ff"></span>real stars · HYG catalogue</div> <div class="leg-row" style="margin-top:13px;border-top:1px solid var(--line);padding-top:11px;flex-wrap:wrap"><span style="display:flex;gap:5px;flex:0 0 auto"><span class="mk" style="background:#c7dbff"></span> <span class="mk" style="background:#ffdeb0"></span> <span class="mk" style="background:#acc6ee"></span></span>Galaxies: spiral · elliptical · irregular</div> <div class="leg-row" style="flex-wrap:wrap"><span style="display:flex;gap:5px;flex:0 0 auto"><span class="mk" style="background:#ce966c"></span><span class="mk" style="background:#6ec4b8"></span> <span class="mk" style="background:#6e96e0"></span><span class="mk" style="background:#e2b484"></span></span>Planets: rocky · super-Earth · Neptune · gas giant</div> <div class="leg-row" style="flex-wrap:wrap"><span style="display:flex;gap:5px;flex:0 0 auto"><span class="mk" style="background:#96beff"></span><span class="mk" style="background:#ffe2a0"></span> <span class="mk" style="background:#ff7676"></span><span class="mk" style="background:#6ee6c6"></span></span>Deep-sky: open · globular · nebula · planetary</div>`, 1);
var root_1$3 = /* @__PURE__ */ from_html(`<div><div class="label lbl-btn" role="button" tabindex="0">Legend <span class="caret"> </span></div> <!></div>`);
var root_2$2 = /* @__PURE__ */ from_html(`<div><span></span><span class="sw"></span></div>`);
var root_3$1 = /* @__PURE__ */ from_html(`<div><div class="ctl-h"></div> <!></div>`);
var root_4$1 = /* @__PURE__ */ from_html(`<div><span class="cdot"></span> <span> </span><span class="cn"> </span></div>`);
var root_5$1 = /* @__PURE__ */ from_html(`<!> <div class="panel"><!> <div class="ctl-inst"><div class="label" style="margin-bottom:8px">Discovery instrument</div> <div><span>colour by it</span><span class="sw"></span></div> <div class="chips"></div></div> <div class="hint" style="font-size:10px;color:var(--dim);margin-top:6px;font-style:italic;line-height:1.6">Drag orbit · right/middle-drag pan · Ctrl+drag dolly<br/>Scroll zoom to cursor · dbl-click/tap focus · WASD fly<br/>[.] frame selection · [Home] reset · [Esc] deselect</div></div>`, 1);
function Controls($$anchor, $$props) {
	push($$props, true);
	const $timeBar = () => store_get(timeBar, "$timeBar", $$stores);
	const $toggleState = () => store_get(toggleState, "$toggleState", $$stores);
	const $labels = () => store_get(labels, "$labels", $$stores);
	const $facColor = () => store_get(facColor, "$facColor", $$stores);
	const $facList = () => store_get(facList, "$facList", $$stores);
	const $facHidden = () => store_get(facHidden, "$facHidden", $$stores);
	const [$$stores, $$cleanup] = setup_stores();
	let legend = prop($$props, "legend", 3, true);
	const groups = [
		{
			"h": "☀️ Solar system",
			"items": [
				{
					"id": "t-moons",
					"label": "Moons (solar system)",
					"on": true
				},
				{
					"id": "t-ast",
					"label": "Asteroids &amp; comets",
					"on": true
				},
				{
					"id": "t-belt",
					"label": "Asteroid field",
					"on": true
				},
				{
					"id": "t-tno",
					"label": "Trans-Neptunian &amp; Centaurs",
					"on": true
				},
				{
					"id": "t-probes",
					"label": "Spacecraft (Voyager…)",
					"on": true
				},
				{
					"id": "t-iso",
					"label": "Interstellar visitors (1I·2I·3I)",
					"on": true
				},
				{
					"id": "t-helio",
					"label": "Heliosphere",
					"on": true
				},
				{
					"id": "t-lag",
					"label": "Lagrange points &amp; Hill spheres",
					"on": true
				},
				{
					"id": "t-cme",
					"label": "CME storms (live)",
					"on": true
				},
				{
					"id": "t-neo",
					"label": "NEO flybys (live)",
					"on": true
				},
				{
					"id": "t-sat",
					"label": "Satellites (live)",
					"on": true
				},
				{
					"id": "t-sun",
					"label": "Sunspots (live)",
					"on": true
				},
				{
					"id": "t-size",
					"label": "Size = planet radius",
					"on": true
				}
			]
		},
		{
			"h": "⭐ Stars",
			"items": [
				{
					"id": "t-hyg",
					"label": "Stars (HYG)",
					"on": true
				},
				{
					"id": "t-gpu",
					"label": "GPU stars",
					"on": true
				},
				{
					"id": "t-gaia",
					"label": "Gaia stars (&lt;100 pc)",
					"on": true
				},
				{
					"id": "t-ob",
					"label": "OB stars (arm tracers)",
					"on": true
				},
				{
					"id": "t-var",
					"label": "Variable stars",
					"on": true
				}
			]
		},
		{
			"h": "💫 Deep sky &amp; galaxy",
			"items": [
				{
					"id": "t-dso",
					"label": "Nebulae &amp; clusters",
					"on": true
				},
				{
					"id": "t-oclu",
					"label": "Clusters · globulars · FRBs",
					"on": true
				},
				{
					"id": "t-psr",
					"label": "Pulsars (neutron stars)",
					"on": true
				},
				{
					"id": "t-con",
					"label": "Constellations",
					"on": true
				},
				{
					"id": "t-met",
					"label": "Meteor showers (active)",
					"on": true
				},
				{
					"id": "t-mw",
					"label": "Milky Way · Sgr A*",
					"on": true
				},
				{
					"id": "t-mw3d",
					"label": "Milky Way structure (3D)",
					"on": true
				},
				{
					"id": "t-lens",
					"label": "Lensing at Sgr A*",
					"on": true
				},
				{
					"id": "t-hz",
					"label": "Habitable zone",
					"on": true
				}
			]
		},
		{
			"h": "🔭 Cosmos",
			"items": [
				{
					"id": "t-gal",
					"label": "Show galaxies",
					"on": true
				},
				{
					"id": "t-web",
					"label": "Cosmic web (2MRS)",
					"on": true
				},
				{
					"id": "t-qso",
					"label": "Quasars",
					"on": true
				},
				{
					"id": "t-edge",
					"label": "Observable universe (CMB)",
					"on": true
				}
			]
		},
		{
			"h": "🎛️ View",
			"items": [
				{
					"id": "t-real",
					"label": "Compact view (distances compressed)",
					"on": false,
					"inv": 1
				},
				{
					"id": "t-rot",
					"label": "Auto-rotation",
					"on": false
				},
				{
					"id": "t-freelook",
					"label": "Free-look flight",
					"on": false
				},
				{
					"id": "t-veil",
					"label": "Red veil",
					"on": true
				},
				{
					"id": "t-rings",
					"label": "Distance rings",
					"on": true
				},
				{
					"id": "t-timebar",
					"label": "Time bar",
					"on": false,
					"ui": 1
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
	let legOpen = /* @__PURE__ */ state(false);
	function tgl(id) {
		if (id === "t-timebar") {
			timeBar.update((v) => !v);
			return;
		}
		if (api.clickToggle) api.clickToggle(id);
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
	var fragment = root_5$1();
	var node = first_child(fragment);
	var consequent_1 = ($$anchor) => {
		var div = root_1$3();
		let classes;
		var div_1 = child(div);
		var span = sibling(child(div_1));
		var text = child(span, true);
		reset(span);
		reset(div_1);
		var node_1 = sibling(div_1, 2);
		var consequent = ($$anchor) => {
			var fragment_1 = root$10();
			next(20);
			append($$anchor, fragment_1);
		};
		if_block(node_1, ($$render) => {
			if (get(legOpen)) $$render(consequent);
		});
		reset(div);
		template_effect(() => {
			classes = set_class(div, 1, "panel", null, classes, { mini: !get(legOpen) });
			set_attribute(div, "id", legend() ? "hud-tr" : void 0);
			set_text(text, get(legOpen) ? "▾" : "▸");
		});
		delegated("click", div_1, () => set(legOpen, !get(legOpen)));
		delegated("keydown", div_1, (e) => e.key === "Enter" && set(legOpen, !get(legOpen)));
		append($$anchor, div);
	};
	if_block(node, ($$render) => {
		if (legend()) $$render(consequent_1);
	});
	var div_2 = sibling(node, 2);
	var node_2 = child(div_2);
	each(node_2, 17, () => groups, index, ($$anchor, g, gi) => {
		var div_3 = root_3$1();
		let classes_1;
		var div_4 = child(div_3);
		html(div_4, () => get(g).h, true);
		reset(div_4);
		each(sibling(div_4, 2), 17, () => get(g).items, (d) => d.id, ($$anchor, d) => {
			var div_5 = root_2$2();
			let classes_2;
			var span_1 = child(div_5);
			html(span_1, () => $labels()[get(d).id] ?? get(d).label, true);
			reset(span_1);
			next();
			reset(div_5);
			template_effect(() => classes_2 = set_class(div_5, 1, "toggle", null, classes_2, { on: get(d).ui ? $timeBar() : get(d).inv ? !($toggleState()[get(d).id] ?? get(d).on) : $toggleState()[get(d).id] ?? get(d).on }));
			delegated("click", div_5, () => tgl(get(d).id));
			append($$anchor, div_5);
		});
		reset(div_3);
		template_effect(() => classes_1 = set_class(div_3, 1, "ctl-group", null, classes_1, { closed: closed[gi] }));
		delegated("click", div_4, () => {
			closed[gi] = !closed[gi];
		});
		append($$anchor, div_3);
	});
	var div_6 = sibling(node_2, 2);
	var div_7 = sibling(child(div_6), 2);
	let classes_3;
	var div_8 = sibling(div_7, 2);
	each(div_8, 5, $facList, (f) => f.k, ($$anchor, f) => {
		var div_9 = root_4$1();
		let classes_4;
		var span_2 = child(div_9);
		var span_3 = sibling(span_2, 2);
		var text_1 = child(span_3, true);
		reset(span_3);
		var span_4 = sibling(span_3);
		var text_2 = child(span_4, true);
		reset(span_4);
		reset(div_9);
		template_effect(($0, $1) => {
			classes_4 = set_class(div_9, 1, "chip", null, classes_4, $0);
			set_style(span_2, `background:rgb(${get(f).c[0] ?? ""},${get(f).c[1] ?? ""},${get(f).c[2] ?? ""})`);
			set_text(text_1, get(f).l);
			set_text(text_2, $1);
		}, [() => ({ off: $facHidden().has(get(f).k) }), () => get(f).n.toLocaleString("en-US")]);
		delegated("click", div_9, () => chip(get(f).k));
		append($$anchor, div_9);
	});
	reset(div_8);
	reset(div_6);
	next(2);
	reset(div_2);
	template_effect(() => {
		set_attribute(div_2, "id", legend() ? "hud-ctl" : void 0);
		classes_3 = set_class(div_7, 1, "colby", null, classes_3, { on: $facColor() });
	});
	delegated("click", div_7, colby);
	append($$anchor, fragment);
	pop();
	$$cleanup();
}
delegate(["click", "keydown"]);
//#endregion
//#region src/components/InfoHost.svelte
var root$9 = /* @__PURE__ */ from_html(`<div class="panel" id="info"></div>`);
function InfoHost($$anchor) {
	append($$anchor, root$9());
}
//#endregion
//#region src/components/NavConsole.svelte
var root$8 = /* @__PURE__ */ from_html(`<div class="panel" id="hud-nav" style="display:none"><div class="nav-head"><span class="label" style="margin:0">▸ Navigation · course</span> <span id="navClose" title="Clear course">✕</span></div> <div id="navName">–</div> <div class="nav-cells"><div class="nav-cell"><div id="navDist" class="mono nv">–</div><div class="nl">Distance</div></div> <div class="nav-cell"><div id="navLight" class="mono nv">–</div><div class="nl">Light travel time</div></div> <div class="nav-cell"><div id="navHead" class="mono nv">–</div><div class="nl">Bearing</div></div></div> <button id="navGo">Engage course ▸</button></div>`);
function NavConsole($$anchor) {
	append($$anchor, root$8());
}
//#endregion
//#region src/components/PmPanel.svelte
var root$7 = /* @__PURE__ */ from_html(`<div class="panel" id="hud-pm" style="display:none"><div class="pm-head"><span class="label" style="margin:0">Night sky · proper motion</span> <span class="mono" id="pmVal">today</span></div> <input type="range" id="pmTime" min="-50000" max="50000" value="0" step="100"/> <div class="ticks"><span>−50,000 yr</span><span>today</span><span>+50,000 yr</span></div></div>`);
function PmPanel($$anchor) {
	append($$anchor, root$7());
}
//#endregion
//#region src/components/TimeBars.svelte
var root$6 = /* @__PURE__ */ from_html(`<div class="panel" id="hud-uni"><button id="uniPlay" title="Play time">▶</button> <button id="uniNow" title="Back to today">⟲</button> <span id="uniVal" class="live">today</span> <div class="track" style="flex:1"><input type="range" id="uniTime" min="-1000" max="1000" value="0" step="1"/></div> <span class="uniCap">−50,000 yr&nbsp;·&nbsp;+50,000 yr</span></div> <div style="display:none" aria-hidden="true"><div class="panel" id="hud-time"><div class="time-head"><div class="yr">Year <span class="live" id="yrVal">2026</span></div> <div class="meta" id="yrMeta"></div> <div class="time-min" title="Minimize">–</div></div> <div class="time-row"><button id="play" aria-label="Play time"><svg id="playIcon" viewBox="0 0 16 16"><path d="M3 2l11 6L3 14z"></path></svg></button> <div class="track"><input type="range" id="year" min="1992" max="2026" value="2026" step="1"/> <div class="ticks"><span>1992</span><span>2000</span><span>2009</span><span>2017</span><span>2026</span></div></div></div></div> <div class="panel" id="hud-soltime" style="display:none"><div class="time-head"><div class="yr">Solar system · <span class="live" id="solDate">–</span></div> <div class="meta">Time travel · planets on their orbits</div> <div class="time-min" title="Minimize">–</div></div> <div class="time-row"><button id="solPlay" aria-label="Play time"><svg id="solIcon" viewBox="0 0 16 16"><path d="M3 2l11 6L3 14z"></path></svg></button> <div class="track"><input type="range" id="solTime" min="-36525" max="36525" value="0" step="1"/> <div class="ticks"><span>−100 yr</span><span>−50</span><span>today</span><span>+50</span><span>+100 yr</span></div></div> <button id="solNow">today</button></div></div></div>`, 1);
function TimeBars($$anchor) {
	var fragment = root$6();
	next(2);
	append($$anchor, fragment);
}
//#endregion
//#region src/components/TourPanel.svelte
var root$5 = /* @__PURE__ */ from_html(`<div id="tourPanel" style="display:none;position:fixed;left:50%;bottom:70px;transform:translateX(-50%);z-index:60;
  max-width:520px;background:rgba(10,14,28,.92);border:1px solid rgba(120,140,190,.35);border-radius:10px;
  padding:12px 16px;font-family:ui-monospace,monospace;color:#e9edfa;backdrop-filter:blur(4px)"><div id="tourTitle" style="font-size:13px;color:#ffcf6b;letter-spacing:.06em;margin-bottom:5px"></div> <div id="tourText" style="font-size:11.5px;line-height:1.55;color:#c8cfE2"></div> <div style="display:flex;gap:8px;margin-top:9px;align-items:center"><button id="tourPrev" class="tbtn">◀</button> <span id="tourStep" style="font-size:10px;color:#8a93ad"></span> <button id="tourNext" class="tbtn">Next ▶</button> <span style="flex:1"></span> <button id="tourEnd" class="tbtn">✕ End tour</button></div></div>`);
function TourPanel($$anchor) {
	append($$anchor, root$5());
}
//#endregion
//#region src/components/LivePanel.svelte
var root$4 = /* @__PURE__ */ from_html(`<div class="lv-wx"><span class="lv-chip">Kp <b> </b></span> <span class="lv-chip">wind <b> </b> km/s</span> <span class="lv-chip">Bz <b> </b> nT</span> <span class="lv-chip">X-ray <b> </b></span></div>`);
var root_1$2 = /* @__PURE__ */ from_html(`<div class="lv-sub"><b style="color:#ffab6e">⚠ Earth-directed CME in flight</b></div>`);
var root_2$1 = /* @__PURE__ */ from_html(`<div class="lv-sub"> </div>`);
var root_3 = /* @__PURE__ */ from_html(`<b style="color:#ffab6e">· Earth-directed!</b>`);
var root_4 = /* @__PURE__ */ from_html(`<div class="lv-row"><span class="lv-dot"></span> <span class="lv-nm"> </span> <span class="lv-val"> </span></div>`);
var root_5 = /* @__PURE__ */ from_html(`<div class="lv-sub"> <!></div> <!>`, 1);
var root_6 = /* @__PURE__ */ from_html(`<div class="lv-sub">no CME currently in flight</div>`);
var root_7 = /* @__PURE__ */ from_html(`<div role="button" tabindex="0"><span class="lv-dot"></span> <span class="lv-nm"> </span> <span class="lv-val"> </span></div>`);
var root_8 = /* @__PURE__ */ from_html(`<div class="lv-more" role="button" tabindex="0"> </div>`);
var root_9 = /* @__PURE__ */ from_html(`<div class="label" style="margin-top:10px">☄️ Earth flybys · next 7 days</div> <!> <!>`, 1);
var root_10 = /* @__PURE__ */ from_html(`<div class="lv-row"><span class="lv-dot" style="background:#9fb8ff"></span> <span class="lv-nm"> </span> <span class="lv-val"> </span></div>`);
var root_11 = /* @__PURE__ */ from_html(`<div class="label" style="margin-top:10px">🌊 Gravitational waves</div> <!>`, 1);
var root_12 = /* @__PURE__ */ from_html(`<div class="lv-row"><span class="lv-dot" style="background:#c9d6f2"></span> <span class="lv-nm lv-trunc"> </span> <span class="lv-val"> </span></div>`);
var root_13 = /* @__PURE__ */ from_html(`<div class="label" style="margin-top:10px">🚀 Next launches</div> <!>`, 1);
var root_14 = /* @__PURE__ */ from_html(`<div class="lv-sub" style="margin-top:8px"> </div>`);
var root_15 = /* @__PURE__ */ from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <div class="lv-src">SWPC · DONKI · NeoWs · CelesTrak · GraceDB · CNEOS · LL2</div>`, 1);
var root_16 = /* @__PURE__ */ from_html(`<div><div class="label lbl-btn" role="button" tabindex="0">🌞 Space weather · live <span class="caret"> </span></div> <!> <!> <!></div>`);
function LivePanel($$anchor, $$props) {
	push($$props, true);
	const $liveData = () => store_get(liveData, "$liveData", $$stores);
	const [$$stores, $$cleanup] = setup_stores();
	let onpick = prop($$props, "onpick", 3, null);
	let showAll = /* @__PURE__ */ state(false);
	let open = /* @__PURE__ */ state(false);
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
	var consequent_14 = ($$anchor) => {
		var div = root_16();
		let classes;
		var div_1 = child(div);
		var span = sibling(child(div_1));
		var text = child(span, true);
		reset(span);
		reset(div_1);
		var node_1 = sibling(div_1, 2);
		var consequent = ($$anchor) => {
			var div_2 = root$4();
			var span_1 = child(div_2);
			var b = sibling(child(span_1));
			var text_1 = child(b, true);
			reset(b);
			reset(span_1);
			var span_2 = sibling(span_1, 2);
			var b_1 = sibling(child(span_2));
			var text_2 = child(b_1, true);
			reset(b_1);
			next();
			reset(span_2);
			var span_3 = sibling(span_2, 2);
			var b_2 = sibling(child(span_3));
			var text_3 = child(b_2, true);
			reset(b_2);
			next();
			reset(span_3);
			var span_4 = sibling(span_3, 2);
			var b_3 = sibling(child(span_4));
			var text_4 = child(b_3, true);
			reset(b_3);
			reset(span_4);
			reset(div_2);
			template_effect(($0, $1, $2, $3) => {
				set_style(b, `color:${$0 ?? ""}`);
				set_text(text_1, $1);
				set_text(text_2, $2);
				set_style(b_2, `color:${($liveData().wx.bz ?? 0) <= -5 ? "#ff7676" : "var(--ink)"}`);
				set_text(text_3, $liveData().wx.bz ?? "–");
				set_style(b_3, `color:${$3 ?? ""}`);
				set_text(text_4, $liveData().wx.xray ?? "–");
			}, [
				() => kpCol($liveData().wx.kp ?? 0),
				() => $liveData().wx.kp?.toFixed(1) ?? "–",
				() => $liveData().wx.wind ? Math.round($liveData().wx.wind) : "–",
				() => xrCol($liveData().wx.xray)
			]);
			append($$anchor, div_2);
		};
		if_block(node_1, ($$render) => {
			if ($liveData().wx) $$render(consequent);
		});
		var node_2 = sibling(node_1, 2);
		var consequent_1 = ($$anchor) => {
			append($$anchor, root_1$2());
		};
		var d_1 = /* @__PURE__ */ user_derived(() => !get(open) && get(active).some((c) => c.earthDir));
		if_block(node_2, ($$render) => {
			if (get(d_1)) $$render(consequent_1);
		});
		var node_3 = sibling(node_2, 2);
		var consequent_13 = ($$anchor) => {
			var fragment_1 = root_15();
			var node_4 = first_child(fragment_1);
			var consequent_2 = ($$anchor) => {
				var div_4 = root_2$1();
				var text_5 = child(div_4);
				reset(div_4);
				template_effect(() => set_text(text_5, `☀ ${$liveData().regions.length ?? ""} active regions on the Sun${get(maxM) ? ` · M-flare odds ${get(maxM)}%` : ""}`));
				append($$anchor, div_4);
			};
			if_block(node_4, ($$render) => {
				if ($liveData().regions?.length) $$render(consequent_2);
			});
			var node_5 = sibling(node_4, 2);
			var consequent_4 = ($$anchor) => {
				var fragment_2 = root_5();
				var div_5 = first_child(fragment_2);
				var text_6 = child(div_5);
				var node_6 = sibling(text_6);
				var consequent_3 = ($$anchor) => {
					append($$anchor, root_3());
				};
				var d_2 = /* @__PURE__ */ user_derived(() => get(active).some((c) => c.earthDir));
				if_block(node_6, ($$render) => {
					if (get(d_2)) $$render(consequent_3);
				});
				reset(div_5);
				each(sibling(div_5, 2), 17, () => get(active).slice(0, 3), (c) => c.t + "" + c.lon, ($$anchor, c) => {
					var div_6 = root_4();
					var span_5 = child(div_6);
					var span_6 = sibling(span_5, 2);
					var text_7 = child(span_6, true);
					reset(span_6);
					var span_7 = sibling(span_6, 2);
					var text_8 = child(span_7);
					reset(span_7);
					reset(div_6);
					template_effect(($0, $1, $2) => {
						set_style(span_5, `background:${get(c).v >= 800 ? "#ff6050" : get(c).v >= 500 ? "#ff9650" : "#ffc86e"}`);
						set_text(text_7, $0);
						set_text(text_8, `${$1 ?? ""} km/s${$2 ?? ""}`);
					}, [
						() => dt(get(c).t),
						() => Math.round(get(c).v),
						() => get(c).earthDir ? ` · Earth ~ ${dt(get(c).eta)}` : ""
					]);
					append($$anchor, div_6);
				});
				template_effect(() => set_text(text_6, `${get(active).length ?? ""} CME${get(active).length > 1 ? "s" : ""} in flight `));
				append($$anchor, fragment_2);
			};
			var alternate = ($$anchor) => {
				append($$anchor, root_6());
			};
			if_block(node_5, ($$render) => {
				if (get(active).length) $$render(consequent_4);
				else $$render(alternate, -1);
			});
			var node_8 = sibling(node_5, 2);
			var consequent_6 = ($$anchor) => {
				var fragment_3 = root_9();
				var node_9 = sibling(first_child(fragment_3), 2);
				each(node_9, 17, () => get(neos), (o) => o.id, ($$anchor, o) => {
					var div_8 = root_7();
					let classes_1;
					var span_8 = child(div_8);
					var span_9 = sibling(span_8, 2);
					var text_9 = child(span_9);
					reset(span_9);
					var span_10 = sibling(span_9, 2);
					var text_10 = child(span_10);
					reset(span_10);
					reset(div_8);
					template_effect(($0, $1, $2) => {
						classes_1 = set_class(div_8, 1, "lv-row lv-click", null, classes_1, { "lv-off": !get(o).kd });
						set_style(span_8, `background:${get(o).pha || get(o).sentry ? "#ff6e5a" : "#ffb260"}`);
						set_text(text_9, `${get(o).n ?? ""}${get(o).pha ? " ⚠" : ""}`);
						set_text(text_10, `${$0 ?? ""} · ${$1 ?? ""} LD · ${$2 ?? ""}`);
					}, [
						() => dt(get(o).t),
						() => ldf(get(o).ld),
						() => dia(get(o).dia)
					]);
					delegated("click", div_8, () => go(get(o).id));
					delegated("keydown", div_8, (e) => e.key === "Enter" && go(get(o).id));
					append($$anchor, div_8);
				});
				var node_10 = sibling(node_9, 2);
				var consequent_5 = ($$anchor) => {
					var div_9 = root_8();
					var text_11 = child(div_9, true);
					reset(div_9);
					template_effect(() => set_text(text_11, get(showAll) ? "– fewer" : `+ ${$liveData().neos.length - 5} more`));
					delegated("click", div_9, () => set(showAll, !get(showAll)));
					delegated("keydown", div_9, (e) => e.key === "Enter" && set(showAll, !get(showAll)));
					append($$anchor, div_9);
				};
				if_block(node_10, ($$render) => {
					if ($liveData().neos.length > 5) $$render(consequent_5);
				});
				append($$anchor, fragment_3);
			};
			if_block(node_8, ($$render) => {
				if ($liveData().neos.length) $$render(consequent_6);
			});
			var node_11 = sibling(node_8, 2);
			var consequent_7 = ($$anchor) => {
				var div_10 = root_2$1();
				var text_12 = child(div_10);
				reset(div_10);
				template_effect(() => set_text(text_12, `💥 ${get(fbs).length ?? ""} fireballs in 30 d · biggest ${get(biggestFb) ?? ""} kt — marked on Earth`));
				append($$anchor, div_10);
			};
			if_block(node_11, ($$render) => {
				if (get(fbs).length) $$render(consequent_7);
			});
			var node_12 = sibling(node_11, 2);
			var consequent_8 = ($$anchor) => {
				var fragment_4 = root_11();
				each(sibling(first_child(fragment_4), 2), 17, () => get(gw).slice(0, 3), (g) => g.id, ($$anchor, g) => {
					var div_11 = root_10();
					var span_11 = sibling(child(div_11), 2);
					var text_13 = child(span_11, true);
					reset(span_11);
					var span_12 = sibling(span_11, 2);
					var text_14 = child(span_12);
					reset(span_12);
					reset(div_11);
					template_effect(($0, $1) => {
						set_text(text_13, get(g).id);
						set_text(text_14, `${$0 ?? ""} · FAR ${$1 ?? ""}`);
					}, [() => dts(get(g).t), () => farYr(get(g).far)]);
					append($$anchor, div_11);
				});
				append($$anchor, fragment_4);
			};
			if_block(node_12, ($$render) => {
				if (get(gw).length) $$render(consequent_8);
			});
			var node_14 = sibling(node_12, 2);
			var consequent_9 = ($$anchor) => {
				var fragment_5 = root_13();
				each(sibling(first_child(fragment_5), 2), 1, () => $liveData().launches.slice(0, 3), (l) => l.n + l.t, ($$anchor, l) => {
					var div_12 = root_12();
					var span_13 = sibling(child(div_12), 2);
					var text_15 = child(span_13, true);
					reset(span_13);
					var span_14 = sibling(span_13, 2);
					var text_16 = child(span_14);
					reset(span_14);
					reset(div_12);
					template_effect(($0) => {
						set_text(text_15, get(l).n);
						set_text(text_16, `in ${$0 ?? ""}`);
					}, [() => inRel(get(l).t)]);
					append($$anchor, div_12);
				});
				append($$anchor, fragment_5);
			};
			if_block(node_14, ($$render) => {
				if ($liveData().launches?.length) $$render(consequent_9);
			});
			var node_16 = sibling(node_14, 2);
			var consequent_10 = ($$anchor) => {
				var div_13 = root_14();
				var text_17 = child(div_13);
				reset(div_13);
				template_effect(($0) => set_text(text_17, `🌠 active showers: ${$0 ?? ""}`), [() => get(showers).map((s) => `${s.n} (ZHR ${s.zhr})`).join(" · ")]);
				append($$anchor, div_13);
			};
			if_block(node_16, ($$render) => {
				if (get(showers).length) $$render(consequent_10);
			});
			var node_17 = sibling(node_16, 2);
			var consequent_11 = ($$anchor) => {
				var div_14 = root_2$1();
				var text_18 = child(div_14);
				reset(div_14);
				template_effect(() => set_text(text_18, `🛰 ${$liveData().sats ?? ""} satellites tracked — zoom to Earth`));
				append($$anchor, div_14);
			};
			if_block(node_17, ($$render) => {
				if ($liveData().sats) $$render(consequent_11);
			});
			var node_18 = sibling(node_17, 2);
			var consequent_12 = ($$anchor) => {
				var div_15 = root_2$1();
				var text_19 = child(div_15);
				reset(div_15);
				template_effect(() => set_text(text_19, `🪐 ${get(stats).exoY ?? ""} systems discovered in ${get(stats).year ?? ""}`));
				append($$anchor, div_15);
			};
			if_block(node_18, ($$render) => {
				if (get(stats)?.exoY) $$render(consequent_12);
			});
			next(2);
			append($$anchor, fragment_1);
		};
		if_block(node_3, ($$render) => {
			if (get(open)) $$render(consequent_13);
		});
		reset(div);
		template_effect(() => {
			classes = set_class(div, 1, "panel live-panel", null, classes, { mini: !get(open) });
			set_text(text, get(open) ? "▾" : "▸");
		});
		delegated("click", div_1, () => set(open, !get(open)));
		delegated("keydown", div_1, (e) => e.key === "Enter" && set(open, !get(open)));
		append($$anchor, div);
	};
	if_block(node, ($$render) => {
		if ($liveData()) $$render(consequent_14);
	});
	append($$anchor, fragment);
	pop();
	$$cleanup();
}
delegate(["click", "keydown"]);
//#endregion
//#region src/components/PoiBar.svelte
var root$3 = /* @__PURE__ */ from_html(`<button class="poi"><span> </span> </button>`);
var root_1$1 = /* @__PURE__ */ from_html(`<div></div>`);
function PoiBar($$anchor, $$props) {
	push($$props, true);
	let variant = prop($$props, "variant", 3, ""), onpick = prop($$props, "onpick", 3, () => {});
	const POIS = [
		["☉", "Sun"],
		["🌍", "Earth"],
		["🔴", "Mars"],
		["🟠", "Jupiter"],
		["💍", "Saturn"],
		["🧊", "Pluto"],
		["🛰", "Voyager 1"],
		["🌠", "3I/ATLAS"],
		["✨", "Proxima Centauri"],
		["🪐", "TRAPPIST-1"],
		["⚫", "Sgr A*"],
		["🌀", "Andromeda"]
	];
	function go(n) {
		if (api.doSearch) api.doSearch(n);
		onpick()(n);
	}
	var div = root_1$1();
	each(div, 21, () => POIS, ([ic, n]) => n, ($$anchor, $$item) => {
		var $$array = /* @__PURE__ */ user_derived(() => to_array(get($$item), 2));
		let ic = () => get($$array)[0];
		let n = () => get($$array)[1];
		var button = root$3();
		var span = child(button);
		var text = child(span, true);
		reset(span);
		var text_1 = sibling(span, 1, true);
		reset(button);
		template_effect(() => {
			set_attribute(button, "title", `Fly to ${n() ?? ""}`);
			set_text(text, ic());
			set_text(text_1, n());
		});
		delegated("click", button, () => go(n()));
		append($$anchor, button);
	});
	reset(div);
	template_effect(() => set_class(div, 1, `poibar ${variant() ? "poibar-" + variant() : ""}`));
	append($$anchor, div);
	pop();
}
delegate(["click"]);
//#endregion
//#region src/components/MobileNav.svelte
var root$2 = /* @__PURE__ */ from_html(`<!> <!> <div class="ms-actions"><button>☉ Solar system</button> <button>🧭 Cosmic tour</button> <button>🔗 Share view</button> <button>⟲ Reset view</button></div> <!>`, 1);
var root_1 = /* @__PURE__ */ from_html(`<div id="mobsheet"><div class="ms-head"><span> <small style="opacity:.5"></small></span> <button class="ms-x">✕ Close</button></div> <div class="ms-body"><!></div></div>`);
var root_2 = /* @__PURE__ */ from_html(`<div id="mobbar"><div><span>🔍</span>Search</div> <div><span>☰</span>Layers</div> <div><span>🕐</span>Time</div> <div class="mb"><span>🧭</span>Tour</div></div> <!>`, 1);
function MobileNav($$anchor, $$props) {
	push($$props, true);
	const $timeBar = () => store_get(timeBar, "$timeBar", $$stores);
	const [$$stores, $$cleanup] = setup_stores();
	let mobPanel = /* @__PURE__ */ state(null);
	function openSheet(w) {
		set(mobPanel, get(mobPanel) === w ? null : w, true);
	}
	function toggleTime() {
		timeBar.update((v) => !v);
		set(mobPanel, null);
	}
	user_effect(() => {
		document.body.classList.toggle("show-time", $timeBar());
	});
	function press(id) {
		const b = document.getElementById(id);
		if (b) b.click();
		set(mobPanel, null);
	}
	var fragment = root_2();
	var div = first_child(fragment);
	var div_1 = child(div);
	let classes;
	var div_2 = sibling(div_1, 2);
	let classes_1;
	var div_3 = sibling(div_2, 2);
	let classes_2;
	var div_4 = sibling(div_3, 2);
	reset(div);
	var node = sibling(div, 2);
	var consequent_1 = ($$anchor) => {
		var div_5 = root_1();
		var div_6 = child(div_5);
		var span = child(div_6);
		var text = child(span);
		var small = sibling(text);
		small.textContent = `· b16:31`;
		reset(span);
		var button = sibling(span, 2);
		reset(div_6);
		var div_7 = sibling(div_6, 2);
		var node_1 = child(div_7);
		var consequent = ($$anchor) => {
			Controls($$anchor, { legend: false });
		};
		var alternate = ($$anchor) => {
			var fragment_2 = root$2();
			var node_2 = first_child(fragment_2);
			SearchBox(node_2, {
				mode: "sheet",
				onpick: () => {
					set(mobPanel, null);
				}
			});
			var node_3 = sibling(node_2, 2);
			PoiBar(node_3, { onpick: () => {
				set(mobPanel, null);
			} });
			var div_8 = sibling(node_3, 2);
			var button_1 = child(div_8);
			var button_2 = sibling(button_1, 2);
			var button_3 = sibling(button_2, 2);
			var button_4 = sibling(button_3, 2);
			reset(div_8);
			LivePanel(sibling(div_8, 2), { onpick: () => {
				set(mobPanel, null);
			} });
			delegated("click", button_1, () => press("solarBtn"));
			delegated("click", button_2, () => press("tourBtn"));
			delegated("click", button_3, () => press("shareBtn"));
			delegated("click", button_4, () => press("resetBtn"));
			append($$anchor, fragment_2);
		};
		if_block(node_1, ($$render) => {
			if (get(mobPanel) === "layers") $$render(consequent);
			else $$render(alternate, -1);
		});
		reset(div_7);
		reset(div_5);
		template_effect(() => set_text(text, `${get(mobPanel) === "layers" ? "☰ Layers" : "🔍 Search"} `));
		delegated("click", button, () => {
			set(mobPanel, null);
		});
		append($$anchor, div_5);
	};
	if_block(node, ($$render) => {
		if (get(mobPanel)) $$render(consequent_1);
	});
	template_effect(() => {
		classes = set_class(div_1, 1, "mb", null, classes, { active: get(mobPanel) === "search" });
		classes_1 = set_class(div_2, 1, "mb", null, classes_1, { active: get(mobPanel) === "layers" });
		classes_2 = set_class(div_3, 1, "mb", null, classes_2, { active: $timeBar() });
	});
	delegated("click", div_1, () => openSheet("search"));
	delegated("click", div_2, () => openSheet("layers"));
	delegated("click", div_3, toggleTime);
	delegated("click", div_4, () => press("tourBtn"));
	append($$anchor, fragment);
	pop();
	$$cleanup();
}
delegate(["click"]);
//#endregion
//#region src/components/ZoomControl.svelte
var root$1 = /* @__PURE__ */ from_html(`<div id="zoomctl"><button>＋</button> <div class="jog"><span></span><span></span><span></span><span></span><span></span></div> <button>−</button></div>`);
function ZoomControl($$anchor, $$props) {
	push($$props, false);
	let timer = null;
	let lastY = 0;
	let jogging = false;
	function hold(f) {
		stop();
		api.zoomBy && api.zoomBy(f);
		timer = setInterval(() => api.zoomBy && api.zoomBy(f), 40);
	}
	function stop() {
		if (timer) {
			clearInterval(timer);
			timer = null;
		}
	}
	function jogDown(e) {
		jogging = true;
		lastY = e.clientY;
		e.target.setPointerCapture && e.target.setPointerCapture(e.pointerId);
	}
	function jogMove(e) {
		if (!jogging) return;
		const dy = e.clientY - lastY;
		lastY = e.clientY;
		if (dy && api.zoomBy) api.zoomBy(Math.exp(dy * .006));
	}
	function jogUp() {
		jogging = false;
	}
	init();
	var div = root$1();
	var button = child(div);
	var div_1 = sibling(button, 2);
	var button_1 = sibling(div_1, 2);
	reset(div);
	delegated("pointerdown", button, () => hold(.965));
	delegated("pointerup", button, stop);
	event("pointerleave", button, stop);
	event("pointercancel", button, stop);
	delegated("pointerdown", div_1, jogDown);
	delegated("pointermove", div_1, jogMove);
	delegated("pointerup", div_1, jogUp);
	event("pointercancel", div_1, jogUp);
	delegated("pointerdown", button_1, () => hold(1.036));
	delegated("pointerup", button_1, stop);
	event("pointerleave", button_1, stop);
	event("pointercancel", button_1, stop);
	append($$anchor, div);
	pop();
}
delegate([
	"pointerdown",
	"pointerup",
	"pointermove"
]);
//#endregion
//#region src/App.svelte
var root = /* @__PURE__ */ from_html(`<canvas id="gl"></canvas> <canvas id="sky"></canvas> <!> <div id="left-col"><!> <!> <!> <!> <!></div> <div id="right-col"><!></div> <!> <!> <!> <!> <!> <!> <button id="resetBtn" style="display:none" aria-hidden="true"></button>`, 1);
function App($$anchor) {
	var fragment = root();
	var node = sibling(first_child(fragment), 4);
	PoiBar(node, { variant: "top" });
	var div = sibling(node, 2);
	var node_1 = child(div);
	TopPanel(node_1, {});
	var node_2 = sibling(node_1, 2);
	SearchBox(node_2, {});
	var node_3 = sibling(node_2, 2);
	MwMap(node_3, {});
	var node_4 = sibling(node_3, 2);
	LivePanel(node_4, {});
	InfoHost(sibling(node_4, 2), {});
	reset(div);
	var div_1 = sibling(div, 2);
	Controls(child(div_1), {});
	reset(div_1);
	var node_7 = sibling(div_1, 2);
	NavConsole(node_7, {});
	var node_8 = sibling(node_7, 2);
	PmPanel(node_8, {});
	var node_9 = sibling(node_8, 2);
	TimeBars(node_9, {});
	var node_10 = sibling(node_9, 2);
	TourPanel(node_10, {});
	var node_11 = sibling(node_10, 2);
	ZoomControl(node_11, {});
	MobileNav(sibling(node_11, 2), {});
	next(2);
	append($$anchor, fragment);
}
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
UI.syncToggle = (id, on) => toggleState.update((m) => ({
	...m,
	[id]: on
}));
UI.setLabel = (id, txt) => labels.update((m) => ({
	...m,
	[id]: txt
}));
UI.msg = (txt) => searchMsg.set(txt);
UI.fac = (list) => facList.set(list);
if (window.__DATA__) runEngine();
else fetch("data/data.json").then((r) => r.json()).then((d) => {
	window.__DATA__ = d;
	runEngine();
}).catch((e) => {
	document.body.innerHTML = "<p style=\"color:#e9edfa;font-family:monospace;padding:2em\">Error loading data: " + e + "</p>";
});
//#endregion
