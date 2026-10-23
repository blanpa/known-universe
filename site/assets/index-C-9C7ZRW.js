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
	galaxy: "<circle cx=\"12\" cy=\"12\" r=\"1.7\"/><path d=\"M13.4 10.4c3.4-1.4 6.6.4 6.6 3 0 3.2-4.2 6-8 6-4.6 0-8-2.4-8-5.4\"/><path d=\"M10.6 13.6c-3.4 1.4-6.6-.4-6.6-3 0-3.2 4.2-6 8-6 4.6 0 8 2.4 8 5.4\"/>"
};
function svgIcon(name, size = 13, stroke = 1.7) {
	return "<svg class=\"ic\" viewBox=\"0 0 24 24\" width=\"" + size + "\" height=\"" + size + "\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"" + stroke + "\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\">" + (ICONS[name] || "") + "</svg>";
}
//#endregion
//#region src/components/Icon.svelte
var root$16 = /* @__PURE__ */ from_svg(`<svg class="ic svelte-13so817" viewBox="0 0 24 24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></svg>`);
function Icon($$anchor, $$props) {
	push($$props, true);
	let size = prop($$props, "size", 3, 16), stroke = prop($$props, "stroke", 3, 1.6), fill = prop($$props, "fill", 3, "none"), label = prop($$props, "label", 3, null);
	var svg = root$16();
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
//#region src/components/TopPanel.svelte
var root$15 = /* @__PURE__ */ from_html(`<div class="panel" id="hud-tl"><h1><span class="dot" aria-hidden="true"></span>Known Universe</h1> <div class="stats"><div class="stat"><div class="k mono" id="s-sys">0</div><div class="l">Systems visible</div></div> <div class="stat"><div class="k mono" id="s-pl">0</div><div class="l">Planets</div></div> <div class="stat"><div class="k mono" id="s-near">—</div><div class="l">Nearest (ly)</div></div> <div class="stat"><div class="k mono" id="s-far">—</div><div class="l">Farthest (ly)</div></div></div> <button type="button" id="solarBtn"><!>Into the solar system</button> <div id="btnGrid"><button type="button" id="tourBtn" title="A guided flight from Earth to the edge of the observable universe"><!>Tour</button> <button type="button" id="shareBtn" title="Copy a link to this exact view"><!>Share</button> <button type="button" id="measureBtn" title="Click two objects to measure the real distance between them"><!>Measure</button> <button type="button" id="resetBtn2" title="Back to the full view"><!>Reset</button></div></div>`);
function TopPanel($$anchor) {
	function press(id) {
		const b = document.getElementById(id);
		if (b) b.click();
	}
	var div = root$15();
	var button = sibling(child(div), 4);
	Icon(child(button), {
		name: "sun",
		size: 15
	});
	next();
	reset(button);
	var div_1 = sibling(button, 2);
	var button_1 = child(div_1);
	Icon(child(button_1), {
		name: "compass",
		size: 15
	});
	next();
	reset(button_1);
	var button_2 = sibling(button_1, 2);
	Icon(child(button_2), {
		name: "link",
		size: 15
	});
	next();
	reset(button_2);
	var button_3 = sibling(button_2, 2);
	Icon(child(button_3), {
		name: "ruler",
		size: 15
	});
	next();
	reset(button_3);
	var button_4 = sibling(button_3, 2);
	Icon(child(button_4), {
		name: "reset",
		size: 15
	});
	next();
	reset(button_4);
	reset(div_1);
	reset(div);
	delegated("click", button_4, () => press("resetBtn"));
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
	const CAT = window.__CATALOG__ || {};
	const PC2LY = 3.261564;
	const cv = document.getElementById("sky"), ctx = cv.getContext("2d");
	const _rawFillText = ctx.fillText.bind(ctx);
	const LBL = {
		q: [],
		on: true,
		prio: 50,
		grid: /* @__PURE__ */ new Map(),
		cell: 48
	};
	const LBLW = /* @__PURE__ */ new Map();
	const P_HUD = 100, P_SEL = 92, P_SOLAR = 80, P_PROBE = 70, P_DEEP = 62, P_STAR = 52, P_SMALL = 40, P_GAL = 30, P_GRID = 14;
	function _paint(s, x, y, mw, st) {
		ctx.font = st.f;
		ctx.fillStyle = st.c;
		ctx.textAlign = st.a;
		ctx.textBaseline = st.b;
		ctx.globalAlpha = st.g;
		const pw = ctx.lineWidth, ps = ctx.strokeStyle, pj = ctx.lineJoin;
		ctx.lineWidth = 2.4;
		ctx.lineJoin = "round";
		ctx.strokeStyle = "rgba(5,7,14,0.75)";
		mw === void 0 ? ctx.strokeText(s, x, y) : ctx.strokeText(s, x, y, mw);
		ctx.lineWidth = pw;
		ctx.strokeStyle = ps;
		ctx.lineJoin = pj;
		mw === void 0 ? _rawFillText(s, x, y) : _rawFillText(s, x, y, mw);
	}
	ctx.fillText = (s, x, y, mw) => {
		if (!S.labels) return;
		const st = {
			f: ctx.font,
			c: ctx.fillStyle,
			a: ctx.textAlign,
			b: ctx.textBaseline,
			g: ctx.globalAlpha
		};
		if (!LBL.on) {
			_paint(s, x, y, mw, st);
			ctx.globalAlpha = st.g;
			return;
		}
		LBL.q.push({
			s,
			x,
			y,
			mw,
			p: LBL.prio,
			st
		});
	};
	function lblReset() {
		LBL.q.length = 0;
		LBL.grid.clear();
		LBL.prio = P_STAR;
	}
	function lblFits(x0, y0, x1, y1, place) {
		const c = LBL.cell;
		const gx0 = Math.floor(x0 / c), gx1 = Math.floor(x1 / c), gy0 = Math.floor(y0 / c), gy1 = Math.floor(y1 / c);
		for (let gx = gx0; gx <= gx1; gx++) for (let gy = gy0; gy <= gy1; gy++) {
			const bucket = LBL.grid.get(gx * 8192 + gy);
			if (!bucket) continue;
			for (let i = 0; i < bucket.length; i++) {
				const b = bucket[i];
				if (x0 < b[2] && x1 > b[0] && y0 < b[3] && y1 > b[1]) return false;
			}
		}
		if (place) {
			const box = [
				x0,
				y0,
				x1,
				y1
			];
			for (let gx = gx0; gx <= gx1; gx++) for (let gy = gy0; gy <= gy1; gy++) {
				const k = gx * 8192 + gy;
				let bucket = LBL.grid.get(k);
				if (!bucket) LBL.grid.set(k, bucket = []);
				bucket.push(box);
			}
		}
		return true;
	}
	function lblFlush() {
		if (!LBL.q.length) return;
		const q = LBL.q;
		for (let i = 0; i < q.length; i++) q[i]._i = i;
		q.sort((a, b) => b.p - a.p || a._i - b._i);
		const pf = ctx.font, pc = ctx.fillStyle, pa = ctx.textAlign, pb = ctx.textBaseline, pg = ctx.globalAlpha;
		for (let i = 0; i < q.length; i++) {
			const it = q[i], st = it.st;
			ctx.font = st.f;
			const fs = parseFloat(st.f) || 10;
			const mk = st.f + "\0" + it.s;
			let w = LBLW.get(mk);
			if (w === void 0) {
				if (LBLW.size > 4e3) LBLW.clear();
				w = ctx.measureText(it.s).width;
				LBLW.set(mk, w);
			}
			if (it.mw !== void 0 && w > it.mw) w = it.mw;
			let x0 = it.x;
			if (st.a === "center") x0 = it.x - w / 2;
			else if (st.a === "right" || st.a === "end") x0 = it.x - w;
			let y0 = it.y - fs * .8, y1 = it.y + fs * .26;
			if (st.b === "top" || st.b === "hanging") {
				y0 = it.y;
				y1 = it.y + fs * 1.06;
			} else if (st.b === "middle") {
				y0 = it.y - fs * .53;
				y1 = it.y + fs * .53;
			}
			if (x0 > W || x0 + w < 0 || y0 > H || y1 < 0) continue;
			if (it.p < P_HUD && (x0 + w > W - 2 || x0 < -2)) continue;
			if (!lblFits(x0 - 1, y0 - 1, x0 + w + 1, y1 + 1, true) && it.p < P_HUD) continue;
			_paint(it.s, it.x, it.y, it.mw, st);
		}
		ctx.font = pf;
		ctx.fillStyle = pc;
		ctx.textAlign = pa;
		ctx.textBaseline = pb;
		ctx.globalAlpha = pg;
	}
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
		s._sr = starRadius(s);
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
		eht: false,
		labels: true,
		radio: true,
		bubble: true,
		grid: false,
		ggrid: false,
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
		kind: "Star"
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
	const COMETS2 = CAT.comets;
	COMETS2.forEach((o) => {
		o.kind = "Comet";
	});
	SMALL.push.apply(SMALL, COMETS2);
	const PROBES = CAT.probes;
	const TNOS = CAT.tnos;
	TNOS.forEach((t) => {
		t.kind = /Chariklo|Chiron|Pholus/.test(t.n) ? "Centaur" : "Trans-Neptunian object";
		t.moons = [];
		t.slug = "dwarf-planets";
	});
	PROBES.forEach((p) => {
		p.kind = "Spacecraft";
		p.moons = [];
	});
	const MOON_EPH = CAT.moonEph;
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
		camTrig();
		const x1 = v[0] * _cyw + v[2] * _syw, z1 = -v[0] * _syw + v[2] * _cyw;
		return [x1, -(v[1] * _cp2 - z1 * _sp2)];
	}
	let _d2x = 0, _d2y = 0;
	function camDir2i(vx, vy, vz) {
		const x1 = vx * _cyw + vz * _syw, z1 = -vx * _syw + vz * _cyw;
		_d2x = x1;
		_d2y = -(vy * _cp2 - z1 * _sp2);
	}
	const EXTRA_MOONS = CAT.extraMoons;
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
		BD: {
			c: [
				216,
				130,
				96
			],
			l: "Brown dwarf"
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
			n: "Luhman 16 AB",
			t: "BD",
			ra: 162.328,
			dec: -53.319,
			d: 2
		},
		{
			n: "WISE 0855−0714",
			t: "BD",
			ra: 133.79,
			dec: -7.24,
			d: 2.28
		},
		{
			n: "Epsilon Indi Ba",
			t: "BD",
			ra: 330.87,
			dec: -56.79,
			d: 3.62
		},
		{
			n: "SCR 1845−6357 B",
			t: "BD",
			ra: 281.3,
			dec: -63.96,
			d: 3.85
		},
		{
			n: "DENIS 1048−3956",
			t: "BD",
			ra: 162.07,
			dec: -39.94,
			d: 4
		},
		{
			n: "UGPS 0722−05",
			t: "BD",
			ra: 110.61,
			dec: -5.68,
			d: 4.1
		},
		{
			n: "Gliese 229 B",
			t: "BD",
			ra: 92.64,
			dec: -21.86,
			d: 5.76
		},
		{
			n: "GJ 570 D",
			t: "BD",
			ra: 224.36,
			dec: -21.41,
			d: 5.88
		},
		{
			n: "SIMP 0136+0933",
			t: "BD",
			ra: 24.24,
			dec: 9.56,
			d: 6.1
		},
		{
			n: "2MASS 1507−1627",
			t: "BD",
			ra: 226.95,
			dec: -16.46,
			d: 7.4
		},
		{
			n: "2M1207 · has a planet",
			t: "BD",
			ra: 181.89,
			dec: -39.55,
			d: 52.4
		},
		{
			n: "Teide 1 · Pleiades",
			t: "BD",
			ra: 56.9,
			dec: 24.36,
			d: 120
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
	const PULSARS = CAT.pulsars;
	PULSARS.forEach((q) => {
		q.psr = true;
		q._dir = dirOf(q[0], q[1]);
		q.n = q[3];
		q.d = q[2];
	});
	const CLUSTERS = CAT.clusters;
	CLUSTERS.forEach((c) => {
		c.oclu = true;
		c.ct = 0;
		c._dir = dirOf(c[0], c[1]);
		c.n = c[3];
		c.d = c[2];
	});
	const GLOBS = CAT.globs;
	const FRBS = CAT.frbs;
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
	let _cyw = 1, _syw = 0, _cp2 = 1, _sp2 = 0, _trigY = NaN, _trigP = NaN;
	function camTrig() {
		if (_trigY === S.yaw && _trigP === S.pitch) return;
		_trigY = S.yaw;
		_trigP = S.pitch;
		_cyw = Math.cos(S.yaw);
		_syw = Math.sin(S.yaw);
		_cp2 = Math.cos(S.pitch);
		_sp2 = Math.sin(S.pitch);
	}
	function camBasis() {
		const c = Math.cos(S.yaw), s = Math.sin(S.yaw), cp = Math.cos(S.pitch), sp = Math.sin(S.pitch);
		_cyw = c;
		_syw = s;
		_cp2 = cp;
		_sp2 = sp;
		_trigY = S.yaw;
		_trigP = S.pitch;
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
	function starRadius(s) {
		if (s.lum > 0 && s.t > 0) return Math.sqrt(s.lum) / Math.pow(s.t / 5772, 2);
		if (s.t > 0) return Math.pow(s.t / 5772, 2);
		return 1;
	}
	let _pcYear = -1;
	function planetsBy(s, year) {
		if (_pcYear !== year) {
			_pcYear = year;
			for (let i = 0; i < STARS.length; i++) STARS[i]._pcN = -1;
		}
		let n = s._pcN;
		if (n < 0) {
			n = 0;
			const ps = s.p;
			for (let k = 0; k < ps.length; k++) {
				const y = ps[k].y;
				if (y <= year || y === 0) n++;
			}
			s._pcN = n;
		}
		return n;
	}
	function radiusScale(sr) {
		if (!S.size || !sr) return 1;
		return Math.max(.3, Math.min(4.2, Math.pow(sr, .7)));
	}
	let cy, cx, foc;
	function project(px, py, pz) {
		return projectInto(px, py, pz, {});
	}
	const _pj = {
		x: 0,
		y: 0,
		depth: 0,
		z2: 0
	};
	function projectInto(px, py, pz, o) {
		camTrig();
		px -= ctr.x;
		py -= ctr.y;
		pz -= ctr.z;
		const x1 = px * _cyw + pz * _syw, z1 = -px * _syw + pz * _cyw, y1 = py;
		const y2 = y1 * _cp2 - z1 * _sp2, z2 = y1 * _sp2 + z1 * _cp2;
		const depth = S.camZ - z2;
		o.x = cx + foc * x1 / depth;
		o.y = cy - foc * y2 / depth;
		o.depth = depth;
		o.z2 = z2;
		return o;
	}
	let visSys = 0, visPl = 0, nearD = Infinity, farD = 0;
	const order = [];
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
	const _halos = {};
	function haloSprite(key, stops, size) {
		let sp = _halos[key];
		if (sp) return sp;
		sp = document.createElement("canvas");
		sp.width = sp.height = size || 256;
		const h = sp.width / 2, c2 = sp.getContext("2d"), gr = c2.createRadialGradient(h, h, 0, h, h, h);
		for (const [t, col] of stops) gr.addColorStop(t, col);
		c2.fillStyle = gr;
		c2.beginPath();
		c2.arc(h, h, h, 0, 6.2832);
		c2.fill();
		_halos[key] = sp;
		return sp;
	}
	function drawHalo(sp, x, y, r, alpha) {
		if (!(r > .5)) return;
		if (r > 4 * Math.max(W, H)) return;
		const ga = ctx.globalAlpha;
		ctx.globalAlpha = ga * alpha;
		ctx.drawImage(sp, x - r, y - r, r * 2, r * 2);
		ctx.globalAlpha = ga;
	}
	const PLIM = 32768;
	function offscr(p) {
		return p.depth <= NEAR || Math.abs(p.x - cx) > PLIM || Math.abs(p.y - cy) > PLIM;
	}
	const PROF = {
		on: false,
		t: Object.create(null),
		frames: 0
	};
	function P(k, fn) {
		if (!PROF.on) return fn();
		const a = performance.now();
		const r = fn();
		PROF.t[k] = (PROF.t[k] || 0) + (performance.now() - a);
		return r;
	}
	api.prof = (on) => {
		if (on) {
			PROF.on = true;
			PROF.t = Object.create(null);
			PROF.frames = 0;
			return null;
		}
		PROF.on = false;
		const f = PROF.frames || 1;
		return {
			frames: PROF.frames,
			ms: Object.fromEntries(Object.entries(PROF.t).map(([k, v]) => [k, +(v / f).toFixed(2)]).sort((a, b) => b[1] - a[1]))
		};
	};
	function render() {
		cx = W / 2;
		cy = H / 2;
		foc = Math.min(W, H) * .62;
		gwOnScreen = false;
		ctx.clearRect(0, 0, W, H);
		lblReset();
		if (surfUpdate()) {
			drawSurface();
			lblFlush();
			updateHUD();
			return;
		}
		camBasis();
		NEAR = S.realScale ? Math.max(1e-13, S.camZ * .02) : Math.min(.05, Math.max(.001, S.camZ * .35));
		solarA = lodA(camDist, .001, .1);
		sysA = 0;
		if (focusSys && focusSysW) sysA = lodA(Math.hypot(camPos[0] - focusSysW[0], camPos[1] - focusSysW[1], camPos[2] - focusSysW[2]), 8e-6, 8e-4);
		calcLens();
		if (S.rings) P("rings", drawRings);
		if (S.veil) P("veil", drawVeilSphere);
		if (S.radio) P("radio", drawRadioSphere);
		if (S.bubble) P("bubble", drawBubble);
		if (S.grid) P("grid", drawSkyGrid);
		if (S.ggrid) P("ggrid", drawGalGrid);
		P("gal:project", projectGalaxies);
		const backG = [], frontG = [];
		for (const g of galProj) (g._z2 < 0 ? backG : frontG).push(g);
		P("gal:back", () => drawGalaxies(backG));
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
			const p = projectInto(s._dx * dr, s._dy * dr, s._dz * dr, _pj);
			if (p.depth <= NEAR) continue;
			if (p.x < -90 || p.x > W + 90 || p.y < -90 || p.y > H + 90) continue;
			s._sx = p.x;
			s._sy = p.y;
			s._depth = p.depth;
			s._z2 = p.z2;
			order.push(s);
			visSys++;
			visPl += planetsBy(s, S.year);
			if (s._r < nearD) nearD = s._r;
			if (s._r > farD) farD = s._r;
		}
		P("stars:sort", () => order.sort((a, b) => a._z2 - b._z2));
		P("hyg:project", projectHyg);
		if (glStars()) P("gl:render", glRender);
		else {
			glClearCanvas();
			P("hyg:draw", drawHyg);
		}
		const sp = project(0, 0, 0);
		const gpuH = glStars() && glBufH;
		for (const s of order) {
			const size = Math.max(.7, foc * .0075 / s._depth * radiusScale(s._sr));
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
				ctx.fillText("click → into the solar system", sp.x + 14, sp.y + 4);
			}
			ctx.globalAlpha = 1;
		}
		lastSun.x = sp.x;
		lastSun.y = sp.y;
		lastSun.depth = sp.depth;
		if (solarA > .01) P("solar", () => drawSolar(solarA));
		if (sysA > .01) P("system", () => drawSystem(sysA));
		else sysProj.length = 0;
		if (measureMode) drawMeasure();
		if (ROUTE) drawRoute();
		P("nav", drawNav);
		drawScaleBar();
		P("labels:flush", lblFlush);
		P("hud", updateHUD);
		PROF.frames++;
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
			const p = projectInto(g._x, g._y, g._z, _pj);
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
		LBL.prio = P_GAL;
		for (const g of list) {
			const s = Math.max(1.4, foc * .011 / g._depth * g._gs);
			const c = g.c, a = Math.max(.25, Math.min(.95, 1.7 - g._depth * .045));
			if (s > 4) {
				const ba = g.ba && g.ba > .05 ? g.ba : 1;
				const sprite = blobSprite(c[0], c[1], c[2], .85, .3);
				ctx.globalAlpha = a;
				if (ba > .985 || g.pa === void 0) ctx.drawImage(sprite, g._sx - s, g._sy - s, s * 2, s * 2);
				else {
					const dx3 = g.dx, dy3 = g.dy, dz3 = g.dz, cd3 = Math.max(1e-6, Math.hypot(dx3, dy3));
					camDir2i(-dy3 / cd3, dx3 / cd3, 0);
					const e2x = _d2x, e2y = _d2y;
					camDir2i(-dz3 * dx3 / cd3, -dz3 * dy3 / cd3, cd3);
					const n2x = _d2x, n2y = _d2y;
					const pa = g.pa * .0174533, cpa = Math.cos(pa), spa = Math.sin(pa);
					const th = Math.atan2(n2y * cpa + e2y * spa, n2x * cpa + e2x * spa);
					const ct = Math.cos(th), stt = Math.sin(th);
					ctx.setTransform(DPR * ct, DPR * stt, -DPR * stt * ba, DPR * ct * ba, DPR * g._sx, cv.height / H * g._sy);
					ctx.drawImage(sprite, -s, -s, s * 2, s * 2);
					ctx.setTransform(DPR, 0, 0, cv.height / H, 0, 0);
				}
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
				LBL.prio = sel ? P_SEL : P_GAL;
				ctx.fillText(g.n, g._sx + s + 4, g._sy + 3);
				LBL.prio = P_GAL;
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
		LBL.prio = P_GRID;
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
	function drawSkyGrid() {
		LBL.prio = P_GRID;
		const R = scale(BND * 3);
		ctx.save();
		ctx.setLineDash([1, 4]);
		for (const dec of [
			-60,
			-30,
			0,
			30,
			60
		]) {
			ctx.beginPath();
			let first = true;
			for (let k = 0; k <= 96; k++) {
				const d = dirOf(k / 96 * 360, dec);
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
			ctx.strokeStyle = dec === 0 ? "rgba(150,175,215,.34)" : "rgba(130,150,190,.15)";
			ctx.lineWidth = dec === 0 ? 1.2 : 1;
			ctx.stroke();
		}
		for (let h = 0; h < 12; h++) {
			ctx.beginPath();
			let first = true;
			for (let k = 0; k <= 48; k++) {
				const d = dirOf(h * 30, -90 + k / 48 * 180);
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
			ctx.strokeStyle = "rgba(130,150,190,.13)";
			ctx.lineWidth = 1;
			ctx.stroke();
		}
		ctx.setLineDash([]);
		ctx.font = "9px ui-monospace,monospace";
		ctx.fillStyle = "rgba(150,175,215,.6)";
		for (let h = 0; h < 24; h += 6) {
			const d = dirOf(h * 15, 2), p = project(d[0] * R, d[1] * R, d[2] * R);
			if (p.depth > NEAR && !offscr(p)) ctx.fillText(h + "h", p.x + 3, p.y - 4);
		}
		const np = dirOf(0, 90), pp = project(np[0] * R, np[1] * R, np[2] * R);
		if (pp.depth > NEAR && !offscr(pp)) ctx.fillText("celestial N pole", pp.x + 4, pp.y);
		ctx.restore();
	}
	function drawGalGrid() {
		LBL.prio = P_GRID;
		const R = scale(BND * 3.2);
		const gx = GC, gz = NGP, gy = [
			gz[1] * gx[2] - gz[2] * gx[1],
			gz[2] * gx[0] - gz[0] * gx[2],
			gz[0] * gx[1] - gz[1] * gx[0]
		];
		const dir = (l, b) => {
			const cl = Math.cos(l), sl = Math.sin(l), cb = Math.cos(b), sb = Math.sin(b);
			return [
				gx[0] * cb * cl + gy[0] * cb * sl + gz[0] * sb,
				gx[1] * cb * cl + gy[1] * cb * sl + gz[1] * sb,
				gx[2] * cb * cl + gy[2] * cb * sl + gz[2] * sb
			];
		};
		ctx.save();
		ctx.setLineDash([1, 4]);
		for (const b of [
			-60,
			-30,
			0,
			30,
			60
		]) {
			ctx.beginPath();
			let first = true;
			for (let k = 0; k <= 96; k++) {
				const d = dir(k / 96 * 6.2832, b * D2R);
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
			ctx.strokeStyle = b === 0 ? "rgba(235,200,150,.32)" : "rgba(215,180,135,.14)";
			ctx.lineWidth = b === 0 ? 1.2 : 1;
			ctx.stroke();
		}
		for (let i = 0; i < 12; i++) {
			ctx.beginPath();
			let first = true;
			for (let k = 0; k <= 48; k++) {
				const d = dir(i / 12 * 6.2832, (-90 + k / 48 * 180) * D2R);
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
			ctx.strokeStyle = "rgba(215,180,135,.12)";
			ctx.lineWidth = 1;
			ctx.stroke();
		}
		ctx.setLineDash([]);
		ctx.font = "9px ui-monospace,monospace";
		ctx.fillStyle = "rgba(235,200,150,.6)";
		for (const l of [
			0,
			90,
			180,
			270
		]) {
			const d = dir(l * D2R, .03), p = project(d[0] * R, d[1] * R, d[2] * R);
			if (p.depth > NEAR && !offscr(p)) ctx.fillText("l=" + l + "°", p.x + 3, p.y - 4);
		}
		const np = dir(0, Math.PI / 2), pp = project(np[0] * R, np[1] * R, np[2] * R);
		if (pp.depth > NEAR && !offscr(pp)) ctx.fillText("galactic N pole", pp.x + 4, pp.y);
		ctx.restore();
	}
	function drawRadioSphere() {
		LBL.prio = P_GRID;
		const lyr = 2e3 + (solarJD() - 2451545) / 365.25 - 1901;
		if (lyr < 1) return;
		const R = scale(lyr * .306601);
		ctx.save();
		for (const [ax, ay] of [
			[0, 1],
			[0, 2],
			[1, 2]
		]) {
			ctx.beginPath();
			let first = true;
			for (let a = 0; a <= 72; a++) {
				const th = a / 72 * 6.2832, v = [
					0,
					0,
					0
				];
				v[ax] = Math.cos(th) * R;
				v[ay] = Math.sin(th) * R;
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
			ctx.setLineDash([2, 5]);
			ctx.strokeStyle = "rgba(120,225,235,.22)";
			ctx.lineWidth = 1;
			ctx.stroke();
		}
		ctx.setLineDash([]);
		const lp = project(R * .71, R * .71, 0);
		if (lp.depth > NEAR && !offscr(lp)) {
			ctx.font = "9px ui-monospace,monospace";
			ctx.fillStyle = "rgba(130,225,235,.6)";
			ctx.fillText("our radio signals · " + Math.round(lyr) + " ly out", lp.x + 4, lp.y - 3);
		}
		ctx.restore();
	}
	function drawBubble() {
		LBL.prio = P_GRID;
		ctx.save();
		ctx.setLineDash([3, 6]);
		for (const [e1, e2, a, b] of [
			[
				GPu,
				GPv,
				95,
				95
			],
			[
				GPu,
				NGP,
				95,
				150
			],
			[
				GPv,
				NGP,
				95,
				150
			]
		]) {
			ctx.beginPath();
			let first = true;
			for (let k = 0; k <= 72; k++) {
				const th = k / 72 * 6.2832, ca = Math.cos(th) * a, sb = Math.sin(th) * b;
				const v = [
					e1[0] * ca + e2[0] * sb,
					e1[1] * ca + e2[1] * sb,
					e1[2] * ca + e2[2] * sb
				];
				const len = Math.hypot(v[0], v[1], v[2]) || 1, R = scale(len);
				const p = project(v[0] / len * R, v[1] / len * R, v[2] / len * R);
				if (offscr(p)) {
					first = true;
					continue;
				}
				if (first) {
					ctx.moveTo(p.x, p.y);
					first = false;
				} else ctx.lineTo(p.x, p.y);
			}
			ctx.strokeStyle = "rgba(150,190,255,.17)";
			ctx.lineWidth = 1;
			ctx.stroke();
		}
		ctx.setLineDash([]);
		const lt = scale(150), lp = project(NGP[0] * lt, NGP[1] * lt, NGP[2] * lt);
		if (lp.depth > NEAR && !offscr(lp)) {
			ctx.font = "9px ui-monospace,monospace";
			ctx.fillStyle = "rgba(160,195,255,.55)";
			ctx.fillText("Local Bubble · blown clear by ~15 supernovae", lp.x + 4, lp.y - 3);
		}
		ctx.restore();
	}
	function drawVeilSphere() {
		LBL.prio = P_GRID;
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
			const p = projectInto(dx * dr, dy * dr, dz * dr, _pj);
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
		LBL.prio = P_STAR;
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
				LBL.prio = sel ? P_SEL : P_STAR;
				ctx.fillText(s.n, s._sx + size + 4, s._sy + 3);
				LBL.prio = P_STAR;
			}
		}
	}
	let solarProj = [];
	function orbitR(a) {
		return scale(a * AU_PC);
	}
	const BODY_K = .094;
	function bodyPx(rk, depth) {
		const ratio = rk / 6371;
		const de = S.realScale ? depth / S.camZ * 3.2 : depth;
		const sym = Math.max(1.7, Math.min(Math.min(W, H) * 4, ratio * BODY_K * foc * .02 / de));
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
	let _suvi = {
		im: null,
		ok: false,
		t: 0,
		loading: false
	};
	function suviImage() {
		if (!_suvi.loading && Date.now() - _suvi.t > 10 * 6e4) {
			_suvi.loading = true;
			const im = new Image();
			im.crossOrigin = "anonymous";
			im.onload = () => {
				_suvi.im = im;
				_suvi.ok = true;
				_suvi.t = Date.now();
				_suvi.loading = false;
				dirty = true;
			};
			im.onerror = () => {
				_suvi.t = Date.now();
				_suvi.loading = false;
			};
			im.src = "https://services.swpc.noaa.gov/images/animations/suvi/primary/304/latest.png";
		}
		return _suvi.ok ? _suvi.im : null;
	}
	function drawSolar(alpha) {
		LBL.prio = P_SOLAR;
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
			drawHalo(haloSprite("sun", [
				[0, "rgba(255,240,190,0.9)"],
				[.4, "rgba(255,210,120,0.35)"],
				[1, "rgba(255,180,80,0)"]
			], 512), sp.x, sp.y, spx * 3.2, A);
			ctx.beginPath();
			ctx.arc(sp.x, sp.y, spx, 0, 6.2832);
			ctx.fillStyle = `rgba(255,240,190,${A})`;
			ctx.fill();
			if (spx >= 14) {
				const im = suviImage();
				if (im) {
					const s = im.width * .3;
					ctx.save();
					ctx.beginPath();
					ctx.arc(sp.x, sp.y, spx, 0, 6.2832);
					ctx.clip();
					ctx.drawImage(im, im.width / 2 - s, im.height / 2 - s, s * 2, s * 2, sp.x - spx, sp.y - spx, spx * 2, spx * 2);
					ctx.restore();
					if (spx > 46) {
						ctx.font = "9px ui-monospace,monospace";
						ctx.fillStyle = `rgba(255,200,140,${A * .7})`;
						ctx.fillText("GOES SUVI 304 Å · live (~4 min)", sp.x + spx + 4, sp.y + 16);
					}
				}
			}
			solarProj.push({
				o: SUN,
				x: sp.x,
				y: sp.y,
				px: spx
			});
			window.__solarProj = solarProj;
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
				if (!b._ms) {
					b._ms = b.moons.slice().sort((x, y) => x.am - y.am);
					b._amMax = b.moons.reduce((a, m) => m.am > a ? m.am : a, 0);
				}
				const amMax = b._amMax, ms = b._ms;
				const jdM = solarJD();
				if (!S.realScale || foc * (amMax * 32408e-15) / p.depth > 1.2 || S.pinned && S.pinned.parent === b.n || S.hover && S.hover.parent === b.n) ms.forEach((m, mi) => {
					const msel0 = m === S.hover || m === S.pinned;
					if (m.minor && px < 13 && !msel0) return;
					const t = Math.log10(m.am + 1) / Math.log10(amMax + 1);
					const rr = px + 12 + t * Math.min(130, px * 3.2 + 80);
					const sepPx = Math.min(S.realScale ? foc * (m.am * 32408e-15) / p.depth : rr, 8 * Math.max(W, H));
					const eph = MOON_EPH[m.n];
					let mx, my;
					if (eph) {
						const dm = moonDirAt(eph, eph.w * (jdM - eph.ep));
						camDir2i(dm[0], dm[1], dm[2]);
						mx = p.x + _d2x * sepPx;
						my = p.y + _d2y * sepPx;
						const seg = sepPx < 7 ? 0 : sepPx < 40 ? 12 : 24;
						if (seg) {
							ctx.beginPath();
							for (let k = 0; k <= seg; k++) {
								const rp = moonDirAt(eph, k / seg * 6.2832);
								camDir2i(rp[0], rp[1], rp[2]);
								const qx = p.x + _d2x * sepPx, qy = p.y + _d2y * sepPx;
								if (k === 0) ctx.moveTo(qx, qy);
								else ctx.lineTo(qx, qy);
							}
							ctx.strokeStyle = `rgba(160,175,205,${A * .15})`;
							ctx.lineWidth = .6;
							ctx.stroke();
						}
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
					let mpx = Math.max(1.1, Math.min(Math.min(W, H) * 4, m.rk / 6371 * BODY_K * foc * .02 / mde));
					if (S.realScale) mpx = Math.min(Math.max(mpx, foc * (m.rk * 32408e-18) / p.depth), Math.min(W, H) * 4);
					ballFill(mx, my, mpx, m.c, A);
					if (m.n === "Moon" && mpx >= 26) {
						const gcv = bodyGlobe({
							n: "Moon",
							_e: b._e
						}, mpx, jdM);
						if (gcv) ctx.drawImage(gcv, mx - mpx, my - mpx, mpx * 2, mpx * 2);
					}
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
				drawHalo(haloSprite("helio", [
					[0, "rgba(90,140,220,0)"],
					[.72, "rgba(90,150,225,0.05)"],
					[1, "rgba(120,170,235,0.11)"]
				]), sunp.x, sunp.y, rr, A);
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
		LBL.prio = P_PROBE;
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
		LBL.prio = P_PROBE;
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
		LBL.prio = P_SMALL;
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
				LBL.prio = sel ? P_SEL : P_SMALL;
				ctx.fillText(o.n, p.x + px + 3, p.y + 3);
				LBL.prio = P_SMALL;
			}
		}
	}
	function cmeSolarMs() {
		return (solarJD() - 2440587.5) * 864e5;
	}
	function drawCME(A) {
		LBL.prio = P_SMALL;
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
		LBL.prio = P_SMALL;
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
		Moon: [
			"moon",
			27.322,
			.116
		],
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
		LBL.prio = P_HUD;
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
		LBL.prio = P_SMALL;
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
		LBL.prio = P_SMALL;
		if (!LIVE.sats.length) return;
		const earth = PLANETS.find((p) => p.n === "Earth");
		if (!earth || !earth._e || !earth._p) return;
		const ep = earth._p, px = bodyPx(earth.rk, ep.depth);
		if (px < 10) return;
		const jd = solarJD();
		let drawn = 0, nSl = 0, nDeb = 0;
		const LOG_LO = Math.log10(6600), LOG_HI = Math.log10(5e4);
		const N = LIVE.sats.length, BUD = Math.min(N, 1500);
		const cNamed = `rgba(150,235,255,${A})`, cDef = `rgba(140,215,250,${A * .7})`, cSl = `rgba(168,196,232,${A * .5})`, cOw = `rgba(196,176,232,${A * .55})`, cDeb = `rgba(160,158,168,${A * .38})`;
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
			if (s.deb) nDeb++;
			if (named) {
				ctx.beginPath();
				ctx.arc(x, y, 2.4, 0, 6.2832);
				ctx.fillStyle = cNamed;
				ctx.fill();
			} else {
				ctx.fillStyle = s.deb ? cDeb : s.sl ? cSl : s.ow ? cOw : cDef;
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
				ctx.fillText(drawn.toLocaleString("en-US") + " satellites · live" + (nSl ? " · " + nSl.toLocaleString("en-US") + " Starlink" : "") + (nDeb ? " · " + nDeb.toLocaleString("en-US") + " debris" : ""), ep.x + px + 4, ep.y + 16);
			}
			dirty = true;
		}
	}
	function drawFireballs(A) {
		LBL.prio = P_SMALL;
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
		if (UI.msg) UI.msg(`launch ${dateStr(w.dep)} · ${Math.round(w.tof)} d · Δv ${w.dv.toFixed(1)} km/s — ride the time slider`);
		lastInfo = void 0;
		dirty = true;
	}
	function drawTransfer(A) {
		LBL.prio = P_PROBE;
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
		if (UI.msg) UI.msg(`1g starship: ${fmtYears(r.T)} Earth time · ${fmtYears(r.TAU)} ship time — ride the time slider`);
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
		LBL.prio = P_SEL;
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
		LBL.prio = P_SMALL;
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
		LBL.prio = P_SOLAR;
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
		LBL.prio = P_GRID;
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
		LBL.prio = P_SMALL;
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
		LBL.prio = P_DEEP;
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
		LBL.prio = P_DEEP;
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
		LBL.prio = P_SMALL;
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
		LBL.prio = P_DEEP;
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
		LBL.prio = P_GRID;
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
		LBL.prio = P_GAL;
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
    uniform highp mat3 uT; uniform sampler2D uBg; uniform float uBgOk, uMode;
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
        if(uMode>0.5){                       // EHT: hot puffy torus (RIAF), integrated volumetrically
          float rc=length(pos.xz);
          float em=exp(-pow((rc-4.6)/1.5,2.0)-pow(pos.y/1.6,2.0));
          if(em>0.002){
            float th=atan(pos.z,pos.x);
            em*=0.72+0.4*sin(3.0*th+0.9);    // the three bright knots
            float v=0.35*clamp(sqrt(3.0/max(rc,2.0)),0.0,1.0);
            vec3 vel=normalize(vec3(-pos.z,0.0,pos.x))*v;
            float g=clamp(1.0/(1.0-dot(vel,normalize(dir))),0.6,1.7);
            col+=trans*vec3(1.0,0.42,0.08)*em*dt*0.6*pow(g,2.0);
            trans*=exp(-em*dt*0.16);
            if(trans<0.04) break;
          }
        }
        else if(py*ny<0.0){                  // Gargantua: crossed the thin-disk plane
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
			uBgOk: gl.getUniformLocation(pr, "uBgOk"),
			uMode: gl.getUniformLocation(pr, "uMode")
		};
		_bhFails = 0;
		return _bhgl;
	}
	function bhRender(x, y, rpx, eht) {
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
		const n = eht ? GC : NGP, u = eht ? NGP : GC;
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
		gl.uniform1f(g.uMode, eht ? 1 : 0);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		return g.cv;
	}
	function drawEHT(x, y, r, A) {
		ctx.save();
		let bg = ctx.createRadialGradient(x, y, 0, x, y, r * 2.3);
		bg.addColorStop(0, `rgba(8,3,1,${A * .9})`);
		bg.addColorStop(.72, `rgba(8,3,1,${A * .55})`);
		bg.addColorStop(1, "rgba(8,3,1,0)");
		ctx.fillStyle = bg;
		ctx.beginPath();
		ctx.arc(x, y, r * 2.3, 0, 6.2832);
		ctx.fill();
		const ring = ctx.createRadialGradient(x, y, r * .25, x, y, r * 1.8);
		ring.addColorStop(0, "rgba(30,6,0,0)");
		ring.addColorStop(.32, `rgba(120,30,4,${A * .5})`);
		ring.addColorStop(.5, `rgba(255,118,18,${A * .9})`);
		ring.addColorStop(.62, `rgba(255,170,48,${A * .95})`);
		ring.addColorStop(.8, `rgba(150,40,6,${A * .5})`);
		ring.addColorStop(1, "rgba(60,10,0,0)");
		ctx.fillStyle = ring;
		ctx.beginPath();
		ctx.arc(x, y, r * 1.8, 0, 6.2832);
		ctx.fill();
		ctx.globalCompositeOperation = "lighter";
		for (const [ang, s, b] of [
			[
				1.9,
				1,
				1
			],
			[
				3.6,
				.85,
				.8
			],
			[
				.2,
				.8,
				.7
			]
		]) {
			const kx = x + Math.cos(ang) * r, ky = y + Math.sin(ang) * r;
			const kg = ctx.createRadialGradient(kx, ky, 0, kx, ky, r * .55 * s);
			kg.addColorStop(0, `rgba(255,225,140,${A * .7 * b})`);
			kg.addColorStop(.5, `rgba(255,150,40,${A * .38 * b})`);
			kg.addColorStop(1, "rgba(255,120,30,0)");
			ctx.fillStyle = kg;
			ctx.beginPath();
			ctx.arc(kx, ky, r * .55 * s, 0, 6.2832);
			ctx.fill();
		}
		ctx.globalCompositeOperation = "source-over";
		ctx.restore();
	}
	function drawBlackHole(x, y, r, A, eht) {
		const patch = bhRender(x, y, r, !!eht);
		if (patch) {
			ctx.drawImage(patch, x - r * 3.7, y - r * 3.7, r * 7.4, r * 7.4);
			return;
		}
		if (eht) drawEHT(x, y, r, A);
		else drawBlackHolePainted(x, y, r, A);
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
		LBL.prio = P_DEEP;
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
			const rbh = Math.min(Math.min(W, H) * .28, foc * (S.realScale ? 500 : .35) / sp.depth);
			if (rbh >= 10) {
				drawBlackHole(sp.x, sp.y, rbh, 1, S.eht);
				ctx.font = "10px ui-monospace,monospace";
				ctx.fillStyle = "rgba(255,205,150,0.92)";
				ctx.fillText(S.eht ? "Sagittarius A* · hot accretion flow (EHT 2022 geometry)" : "Sagittarius A* · 4.15 million M☉", sp.x + rbh * 1.15, sp.y - rbh * 1.35);
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
	function fmtDist(pc) {
		if (!isFinite(pc) || pc <= 0) return "0";
		const au = pc / AU_PC;
		if (au < .02) return (au * 1496e5).toFixed(0) + " km";
		if (au < 2e3) return (au < 10 ? au.toFixed(2) : fmt(au)) + " AU";
		const ly = pc * PC2LY;
		if (ly < 1e3) return (ly < 10 ? ly.toFixed(2) : fmt(ly)) + " ly";
		if (ly < 1e6) return (ly / 1e3).toFixed(ly < 1e4 ? 2 : 1) + " kly";
		if (ly < 1e9) return (ly / 1e6).toFixed(ly < 1e7 ? 2 : 1) + " Mly";
		return (ly / 1e9).toFixed(2) + " Gly";
	}
	function niceLen(v) {
		const e = Math.pow(10, Math.floor(Math.log10(v))), m = v / e;
		return (m >= 5 ? 5 : m >= 2 ? 2 : 1) * e;
	}
	function drawScaleBar() {
		if (!S.labels) return;
		const narrow = W <= 720;
		const strip = document.body.classList.contains("show-time") ? 48 : 0;
		const x0 = 16, y0 = H - (narrow ? 92 : 30) - strip;
		const dim = "rgba(154,163,184,0.85)", ink = "rgba(232,235,244,0.95)";
		LBL.prio = P_HUD;
		ctx.textAlign = "left";
		ctx.textBaseline = "alphabetic";
		const here = camDist > 1e-9 ? invScale(camDist) : 0;
		ctx.font = "10px ui-monospace,monospace";
		ctx.fillStyle = dim;
		ctx.fillText(here > 0 ? "eye · " + fmtDist(here) + " from the Sun" : "eye · at the Sun", x0, y0 - 22);
		if (S.realScale) {
			const pcPerPx = S.camZ / foc;
			let L = niceLen(pcPerPx * (narrow ? 90 : 150));
			let px = L / pcPerPx;
			if (px < 40) {
				L = niceLen(pcPerPx * 220);
				px = L / pcPerPx;
			}
			if (!isFinite(px) || px < 8) return;
			px = Math.min(px, W * .4);
			ctx.strokeStyle = dim;
			ctx.lineWidth = 1.2;
			ctx.beginPath();
			ctx.moveTo(x0, y0 - 9);
			ctx.lineTo(x0, y0 - 3);
			ctx.lineTo(x0 + px, y0 - 3);
			ctx.lineTo(x0 + px, y0 - 9);
			ctx.stroke();
			ctx.font = "11px ui-monospace,monospace";
			ctx.fillStyle = ink;
			ctx.fillText(fmtDist(L), x0, y0 + 9);
		} else {
			const dec = KDEC * foc / S.camZ;
			if (!isFinite(dec) || dec < 2) return;
			let k = 1;
			while (dec * k < 64 && k < 12) k++;
			let px = dec * k;
			if (px > W * .42) {
				px = dec;
				k = 1;
			}
			if (px < 18) return;
			ctx.strokeStyle = dim;
			ctx.lineWidth = 1.2;
			ctx.beginPath();
			ctx.moveTo(x0, y0 - 9);
			ctx.lineTo(x0, y0 - 3);
			ctx.lineTo(x0 + px, y0 - 3);
			ctx.lineTo(x0 + px, y0 - 9);
			ctx.stroke();
			if (k === 1 && dec > 26) for (let i = 1; i < 10; i++) {
				const tx = x0 + Math.log10(i + 1) * dec;
				ctx.beginPath();
				ctx.moveTo(tx, y0 - 3);
				ctx.lineTo(tx, y0 - 6.5);
				ctx.stroke();
			}
			ctx.font = "11px ui-monospace,monospace";
			ctx.fillStyle = ink;
			ctx.fillText("×" + (k === 1 ? "10" : "10^" + k) + " distance", x0, y0 + 9);
		}
		LBL.prio = P_STAR;
	}
	function drawNav() {
		LBL.prio = P_HUD;
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
				if (s === SUN || navWorld(s)) info.insertAdjacentHTML("beforeend", `<button class="lockset">${FOLLOW === s ? svgIcon("unlock") + "Unlock view" : svgIcon("lock") + "Lock & zoom"}</button>`);
				if (navPhys(s)) info.insertAdjacentHTML("beforeend", `<button class="navset">${isNav ? svgIcon("check") + "Target set" : svgIcon("scope") + "Set course"}</button>`);
				if (navPhys(s) && s._e === void 0 && s.rk === void 0 && !s.lp && !s.iroute && !s.xfer) info.insertAdjacentHTML("beforeend", `<button class="transferset">${ROUTE && ROUTE.o === s ? svgIcon("close") + "Clear route" : svgIcon("probe") + "Route from Earth · 1g ship"}</button>`);
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
			const c = s.c || [
				190,
				215,
				235
			], er = s.rk / 6371, probe = s.kind === "Spacecraft";
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
			if ((s.k || s.kd) && s.n !== "Earth" && s.kind !== "Moon" && s.kind !== "Spacecraft") h += `<button class="transferset">${TRANSFER && TRANSFER.to === s ? svgIcon("close") + "Clear transfer orbit" : svgIcon("probe") + "Transfer Earth → " + s.n}</button>`;
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
        ${radecRow(s._dir[0], s._dir[1], s._dir[2])}
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
        ${radecRow(s.dx, s.dy, s.dz)}
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
	function radecRow(dx, dy, dz) {
		const [ra, dec] = radec(dx, dy, dz);
		const hh = Math.floor(ra / 15), mm = Math.round((ra / 15 - hh) * 60);
		return `<div class="r"><span class="rk">RA / Dec</span><span class="rv">${hh}h ${String(mm).padStart(2, "0")}m · ${dec >= 0 ? "+" : "−"}${Math.abs(dec).toFixed(1)}°</span></div>`;
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
	function zoomRange() {
		return S.realScale ? [1e-12, 6e7] : [1e-4, 16];
	}
	function zoomFactorAt(mx, my, f) {
		let [zmin, zmax] = zoomRange();
		if (tgtCamZ * f > zmax && f > 1 && S.realScale || tgtCamZ * f < zmin && f < 1 && !S.realScale) {
			clickToggle("t-real");
			S.camZ = tgtCamZ;
			[zmin, zmax] = zoomRange();
		}
		const before = tgtCamZ;
		tgtCamZ *= f;
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
	function setToggle(id, on) {
		const t = TOGGLE_ACT[id];
		if (!t) return;
		if (!!S[t.key] === !!on) return;
		clickToggle(id);
	}
	api.setToggle = setToggle;
	api.toggleIds = () => Object.keys(TOGGLE_ACT);
	api.readToggles = () => {
		const o = {};
		for (const id in TOGGLE_ACT) o[id] = !!S[TOGGLE_ACT[id].key];
		return o;
	};
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
		const physCam = inv(S.camZ), physTgt = inv(tgtCamZ);
		const cm = Math.hypot(ctr.x, ctr.y, ctr.z), physCtr = cm > 0 ? inv(cm) : 0;
		const zr = zoomRange(), cl = (v) => Math.max(zr[0], Math.min(zr[1], v));
		S.camZ = cl(scale(physCam));
		tgtCamZ = cl(scale(physTgt));
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
	bindToggle("t-eht", "eht");
	bindToggle("t-labels", "labels");
	bindToggle("t-radio", "radio");
	bindToggle("t-bubble", "bubble");
	bindToggle("t-grid", "grid");
	bindToggle("t-ggrid", "ggrid");
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
		const el = document.getElementById("hud-mwmap");
		if (el) el.style.display = S.mw ? "block" : "none";
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
	function goCosmos() {
		if (S.realScale) clickToggle("t-real");
		tgtCamZ = camCosmos();
	}
	document.getElementById("resetBtn").addEventListener("click", () => {
		tgtYaw = .5;
		tgtPitch = -.35;
		S.focusStar = null;
		S.pinned = null;
		focusSys = null;
		tgtCtr.x = tgtCtr.y = tgtCtr.z = 0;
		goCosmos();
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
			goCosmos();
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
				const sr2 = st2._sr !== void 0 ? st2._sr : starRadius(st2);
				ha[o] = st2._dx;
				ha[o + 1] = st2._dy;
				ha[o + 2] = st2._dz;
				ha[o + 3] = st2._r;
				ha[o + 4] = sr2 ? Math.max(.3, Math.min(4.2, Math.pow(sr2, .7))) : 1;
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
			S.camZ = S.camZ > 0 && tgtCamZ > 0 ? S.camZ * Math.pow(tgtCamZ / S.camZ, .12) : S.camZ + (tgtCamZ - S.camZ) * .12;
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
		LBL.prio = P_HUD;
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
			searchMsg.textContent = measName(hit) + " — pick a second object";
		} else {
			measB = {
				o: hit,
				P
			};
			const dpc = Math.hypot(measA.P[0] - P[0], measA.P[1] - P[1], measA.P[2] - P[2]);
			searchMsg.textContent = measName(measA.o) + " ↔ " + measName(hit) + " = " + (dpc < .001 ? (dpc / AU_PC).toFixed(2) + " AU" : fmt(dpc * PC2LY) + " ly");
		}
		dirty = true;
	}
	document.getElementById("measureBtn").addEventListener("click", () => {
		measureMode = !measureMode;
		measA = measB = null;
		document.getElementById("measureBtn").classList.toggle("active", measureMode);
		searchMsg.textContent = measureMode ? "Measure: click the first object" : "";
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
		"iso",
		"eht",
		"radio",
		"bubble",
		"grid",
		"ggrid"
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
				uniPlayBtn.innerHTML = svgIcon("play", 14);
			} else {
				uniPlayBtn.innerHTML = svgIcon("pause", 14);
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
				if (uniPlayBtn) uniPlayBtn.innerHTML = svgIcon("play", 14);
			}
		});
	}
	api.clickToggle = clickToggle;
	api.doSearch = doSearch;
	api.getS = () => S;
	api.suggest = suggestList;
	api.getCam = () => ({
		camZ: S.camZ,
		tgt: tgtCamZ,
		real: S.realScale
	});
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
	window.__kuapi = api;
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
var root$14 = /* @__PURE__ */ from_html(`<button type="button" class="s-x" aria-label="Clear search"><!></button>`);
var root_1$7 = /* @__PURE__ */ from_html(`<button type="button" role="option"><span class="sg-n"> </span><span class="sg-k"> </span></button>`);
var root_2$5 = /* @__PURE__ */ from_html(`<div class="sugbox" id="search-sugs" role="listbox"></div>`);
var root_3$4 = /* @__PURE__ */ from_html(`<div class="searchMsg" role="status"> </div>`);
var root_4$2 = /* @__PURE__ */ from_html(`<div class="searchwrap"><div class="searchfield"><!> <input class="searchIn" type="text" spellcheck="false" role="combobox" aria-controls="search-sugs" aria-autocomplete="list" aria-label="Search for an object" placeholder="Search Earth, Sirius, TRAPPIST-1…"/> <!></div> <!> <!></div>`);
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
	var div = root_4$2();
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
		var button = root$14();
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
		var div_2 = root_2$5();
		each(div_2, 21, () => get(sugs), index, ($$anchor, sg, si) => {
			var button_1 = root_1$7();
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
		var div_3 = root_3$4();
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
//#region src/components/MwMap.svelte
var root$13 = /* @__PURE__ */ from_html(`<button type="button" class="label lbl-btn"><span>Milky Way · top-down</span> <span><!></span></button>`);
var root_1$6 = /* @__PURE__ */ from_html(`<div class="label">Milky Way · top-down</div>`);
var root_2$4 = /* @__PURE__ */ from_html(`<div class="mwcap">Schematic · ~100,000 light-years across</div>`);
var root_3$3 = /* @__PURE__ */ from_html(`<div id="hud-mwmap"><!> <canvas id="mwmap" width="198" height="150" aria-label="Schematic top-down map of the Milky Way with the Sun marked"></canvas> <!></div>`);
function MwMap($$anchor, $$props) {
	push($$props, true);
	let collapsible = prop($$props, "collapsible", 3, true);
	let open = /* @__PURE__ */ state(proxy(untrack(() => !collapsible())));
	var div = root_3$3();
	let classes;
	var node = child(div);
	var consequent = ($$anchor) => {
		var button = root$13();
		var span = sibling(child(button), 2);
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
		append($$anchor, root_1$6());
	};
	if_block(node, ($$render) => {
		if (collapsible()) $$render(consequent);
		else $$render(alternate, -1);
	});
	var canvas = sibling(node, 2);
	var node_2 = sibling(canvas, 2);
	var consequent_1 = ($$anchor) => {
		append($$anchor, root_2$4());
	};
	if_block(node_2, ($$render) => {
		if (get(open)) $$render(consequent_1);
	});
	reset(div);
	template_effect(() => {
		classes = set_class(div, 1, "panel", null, classes, { mini: collapsible() && !get(open) });
		set_style(canvas, `width:198px;height:150px;display:${get(open) ? "block" : "none"}`);
	});
	append($$anchor, div);
	pop();
}
delegate(["click"]);
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
var root$12 = /* @__PURE__ */ from_html(`<button type="button" role="switch"><span class="tg-l"></span> <span class="sw" aria-hidden="true"></span></button>`);
function Toggle($$anchor, $$props) {
	let checked = prop($$props, "checked", 3, false), label = prop($$props, "label", 3, ""), onchange = prop($$props, "onchange", 3, () => {});
	var button = root$12();
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
var root$11 = /* @__PURE__ */ from_html(`<button type="button"><!><span> </span></button>`);
var root_1$5 = /* @__PURE__ */ from_html(`<button type="button" class="lf-x" aria-label="Clear filter"><!></button>`);
var root_2$3 = /* @__PURE__ */ from_html(`<div><button type="button" class="ctl-h"><span class="ctl-hl"><!><!></span> <span class="caret"><!></span></button> <!></div>`);
var root_3$2 = /* @__PURE__ */ from_html(`<div class="lf-none"> </div>`);
var root_4$1 = /* @__PURE__ */ from_html(`<button type="button"><span class="cdot"></span> <span class="cl"> </span><span class="cn"> </span></button>`);
var root_5$1 = /* @__PURE__ */ from_html(`<div class="panel"><div class="presets" role="group" aria-label="Layer presets"></div> <div class="lfilter"><!> <input type="text" spellcheck="false" placeholder="Filter layers…" aria-label="Filter layers"/> <!></div> <!> <!> <div class="ctl-inst"><div class="label" style="margin-bottom:8px">Discovery instrument</div> <button type="button" role="switch"><span>colour by it</span><span class="sw" aria-hidden="true"></span></button> <div class="chips"></div></div> <div class="hint">Drag orbit · right/middle-drag pan · Ctrl+drag dolly<br/>Scroll zoom to cursor · dbl-click/tap focus · WASD fly<br/>[.] frame selection · [Home] reset · [Esc] deselect</div></div>`);
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
					label: "Moons (solar system)",
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
					label: "Trans-Neptunian &amp; Centaurs",
					on: true
				},
				{
					id: "t-probes",
					label: "Spacecraft (Voyager…)",
					on: true
				},
				{
					id: "t-iso",
					label: "Interstellar visitors (1I·2I·3I)",
					on: true
				},
				{
					id: "t-helio",
					label: "Heliosphere",
					on: true
				},
				{
					id: "t-lag",
					label: "Lagrange points &amp; Hill spheres",
					on: true
				},
				{
					id: "t-cme",
					label: "CME storms (live)",
					on: true
				},
				{
					id: "t-neo",
					label: "NEO flybys (live)",
					on: true
				},
				{
					id: "t-sat",
					label: "Satellites (live)",
					on: true
				},
				{
					id: "t-sun",
					label: "Sunspots (live)",
					on: true
				},
				{
					id: "t-size",
					label: "Size = planet radius",
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
					label: "Stars (HYG)",
					on: true
				},
				{
					id: "t-gpu",
					label: "GPU stars",
					on: true
				},
				{
					id: "t-gaia",
					label: "Gaia stars (&lt;100 pc)",
					on: true
				},
				{
					id: "t-ob",
					label: "OB stars (arm tracers)",
					on: true
				},
				{
					id: "t-var",
					label: "Variable stars",
					on: true
				},
				{
					id: "t-radio",
					label: "Radio bubble (our signals)",
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
					label: "Nebulae &amp; clusters",
					on: true
				},
				{
					id: "t-oclu",
					label: "Clusters · globulars · FRBs",
					on: true
				},
				{
					id: "t-psr",
					label: "Pulsars (neutron stars)",
					on: true
				},
				{
					id: "t-con",
					label: "Constellations",
					on: true
				},
				{
					id: "t-met",
					label: "Meteor showers (active)",
					on: true
				},
				{
					id: "t-bubble",
					label: "Local Bubble (ISM)",
					on: true
				},
				{
					id: "t-mw",
					label: "Milky Way · Sgr A*",
					on: true
				},
				{
					id: "t-mw3d",
					label: "Milky Way structure (3D)",
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
					label: "Show galaxies",
					on: true
				},
				{
					id: "t-web",
					label: "Cosmic web (2MRS)",
					on: true
				},
				{
					id: "t-qso",
					label: "Quasars",
					on: true
				},
				{
					id: "t-edge",
					label: "Observable universe (CMB)",
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
					label: "Compact view (distances compressed)",
					on: false,
					inv: 1
				},
				{
					id: "t-rot",
					label: "Auto-rotation",
					on: false
				},
				{
					id: "t-freelook",
					label: "Free-look flight",
					on: false
				},
				{
					id: "t-veil",
					label: "Red veil",
					on: true
				},
				{
					id: "t-rings",
					label: "Distance rings",
					on: true
				},
				{
					id: "t-labels",
					label: "Labels &amp; text",
					on: true
				},
				{
					id: "t-grid",
					label: "Celestial grid (RA·Dec)",
					on: false
				},
				{
					id: "t-ggrid",
					label: "Galactic grid (l·b)",
					on: false
				},
				{
					id: "t-eht",
					label: "Sgr A*: real EHT image (2022)",
					on: false
				},
				{
					id: "t-timebar",
					label: "Time bar",
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
	var div = root_5$1();
	var div_1 = child(div);
	each(div_1, 21, () => PRESETS, (p) => p.k, ($$anchor, p) => {
		var button = root$11();
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
		var button_1 = root_1$5();
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
			var div_3 = root_2$3();
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
		var div_4 = root_3$2();
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
		var button_4 = root_4$1();
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
var root$10 = /* @__PURE__ */ from_html(`<button type="button" class="label lbl-btn"><span>Legend</span><span><!></span></button>`);
var root_1$4 = /* @__PURE__ */ from_html(`<div class="label">Legend</div>`);
var root_2$2 = /* @__PURE__ */ from_html(`<div class="label lg-sub">Star colour = temperature</div> <div class="spectrum"></div> <div class="spectrum-ax"><span>hot · 30,000 K</span><span>cool · 3,000 K</span></div> <div class="leg-row"><span style="display:flex;align-items:center;gap:5px;flex:0 0 auto"><span class="mk" style="width:4px;height:4px;background:var(--txt-2)"></span><span class="mk" style="width:11px;height:11px;background:var(--txt-2)"></span></span>Size = planet radius</div> <div class="leg-row"><span class="mk" style="background:#eafffb;box-shadow:0 0 8px #fff"></span>Sun — you are here</div> <div class="leg-row"><span class="mk" style="background:var(--cyan)"></span>discovered in the selected year</div> <div class="leg-row"><span class="mk" style="background:#e6473c;box-shadow:0 0 8px #e6473c"></span>beyond the neighbourhood</div> <div class="leg-row"><span class="mk" style="width:5px;height:5px;background:#cfe0ff"></span>real stars · HYG catalogue</div> <div class="leg-row lg-grp"><span style="display:flex;gap:5px;flex:0 0 auto"><span class="mk" style="background:#c7dbff"></span> <span class="mk" style="background:#ffdeb0"></span> <span class="mk" style="background:#acc6ee"></span></span>Galaxies: spiral · elliptical · irregular</div> <div class="leg-row" style="flex-wrap:wrap"><span style="display:flex;gap:5px;flex:0 0 auto"><span class="mk" style="background:#ce966c"></span><span class="mk" style="background:#6ec4b8"></span> <span class="mk" style="background:#6e96e0"></span><span class="mk" style="background:#e2b484"></span></span>Planets: rocky · super-Earth · Neptune · gas giant</div> <div class="leg-row" style="flex-wrap:wrap"><span style="display:flex;gap:5px;flex:0 0 auto"><span class="mk" style="background:#96beff"></span><span class="mk" style="background:#ffe2a0"></span> <span class="mk" style="background:#ff7676"></span><span class="mk" style="background:#6ee6c6"></span></span>Deep-sky: open · globular · nebula · planetary</div>`, 1);
var root_3$1 = /* @__PURE__ */ from_html(`<div id="hud-tr"><!> <!></div>`);
function Legend($$anchor, $$props) {
	push($$props, true);
	let collapsible = prop($$props, "collapsible", 3, false);
	let open = /* @__PURE__ */ state(proxy(untrack(() => !collapsible())));
	var div = root_3$1();
	let classes;
	var node = child(div);
	var consequent = ($$anchor) => {
		var button = root$10();
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
		append($$anchor, root_1$4());
	};
	if_block(node, ($$render) => {
		if (collapsible()) $$render(consequent);
		else $$render(alternate, -1);
	});
	var node_2 = sibling(node, 2);
	var consequent_1 = ($$anchor) => {
		var fragment = root_2$2();
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
var root$6 = /* @__PURE__ */ from_html(`<div class="panel" id="hud-uni"><button type="button" id="uniPlay" aria-label="Play time"><!></button> <button type="button" id="uniNow" aria-label="Back to today"><!></button> <span id="uniVal" class="live">today</span> <div class="track" style="flex:1"><input type="range" id="uniTime" min="-1000" max="1000" value="0" step="1" aria-label="Time"/></div> <span class="uniCap">−50,000 yr&nbsp;·&nbsp;+50,000 yr</span></div> <div style="display:none" aria-hidden="true"><div class="panel" id="hud-time"><div class="time-head"><div class="yr">Year <span class="live" id="yrVal">2026</span></div> <div class="meta" id="yrMeta"></div> <div class="time-min" title="Minimize">–</div></div> <div class="time-row"><button id="play" aria-label="Play time" tabindex="-1"><svg id="playIcon" viewBox="0 0 16 16"><path d="M3 2l11 6L3 14z"></path></svg></button> <div class="track"><input type="range" id="year" min="1992" max="2026" value="2026" step="1" tabindex="-1"/> <div class="ticks"><span>1992</span><span>2000</span><span>2009</span><span>2017</span><span>2026</span></div></div></div></div> <div class="panel" id="hud-soltime" style="display:none"><div class="time-head"><div class="yr">Solar system · <span class="live" id="solDate">–</span></div> <div class="meta">Time travel · planets on their orbits</div> <div class="time-min" title="Minimize">–</div></div> <div class="time-row"><button id="solPlay" aria-label="Play time" tabindex="-1"><svg id="solIcon" viewBox="0 0 16 16"><path d="M3 2l11 6L3 14z"></path></svg></button> <div class="track"><input type="range" id="solTime" min="-36525" max="36525" value="0" step="1" tabindex="-1"/> <div class="ticks"><span>−100 yr</span><span>−50</span><span>today</span><span>+50</span><span>+100 yr</span></div></div> <button id="solNow" tabindex="-1">today</button></div></div></div>`, 1);
function TimeBars($$anchor) {
	var fragment = root$6();
	var div = first_child(fragment);
	var button = child(div);
	Icon(child(button), {
		name: "play",
		size: 14
	});
	reset(button);
	var button_1 = sibling(button, 2);
	Icon(child(button_1), {
		name: "reset",
		size: 14
	});
	reset(button_1);
	next(6);
	reset(div);
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
var root$4 = /* @__PURE__ */ from_html(`<button type="button" class="label lbl-btn"><span class="lb-t"><!>Space weather · live</span> <span><!></span></button>`);
var root_1$3 = /* @__PURE__ */ from_html(`<div class="label"><span class="lb-t"><!>Space weather · live</span></div>`);
var root_2$1 = /* @__PURE__ */ from_html(`<div class="lv-wx"><span class="lv-chip">Kp <b> </b></span> <span class="lv-chip">wind <b> </b> km/s</span> <span class="lv-chip">Bz <b> </b> nT</span> <span class="lv-chip">X-ray <b> </b></span></div>`);
var root_3 = /* @__PURE__ */ from_html(`<div class="lv-sub"><b style="color:#ffab6e">Earth-directed CME in flight</b></div>`);
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
			var div_1 = root_1$3();
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
			var div_2 = root_2$1();
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
			append($$anchor, root_3());
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
var root_1$2 = /* @__PURE__ */ from_html(`<div role="group" aria-label="Jump to"></div>`);
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
	var div = root_1$2();
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
	template_effect(() => set_class(div, 1, `poibar ${variant() ? "poibar-" + variant() : ""}`));
	append($$anchor, div);
	pop();
}
delegate(["click"]);
//#endregion
//#region src/components/MobileNav.svelte
var root$2 = /* @__PURE__ */ from_html(`<!> <!> <div class="ms-actions"><button type="button"><!>Solar system</button> <button type="button"><!>Cosmic tour</button> <button type="button"><!>Share view</button> <button type="button"><!>Reset view</button></div> <!>`, 1);
var root_1$1 = /* @__PURE__ */ from_html(`<div id="mobsheet" role="dialog" aria-modal="false"><div class="ms-head"><button type="button" class="ms-grab" aria-label="Sheet size — drag, or press to cycle"><span></span></button> <div class="ms-headrow"><span class="ms-title"><!> <small></small></span> <span class="ms-btns"><button type="button" class="ms-x" aria-label="Expand or collapse"><!></button> <button type="button" class="ms-x" aria-label="Close"><!></button></span></div></div> <div class="ms-body"><!></div></div>`);
var root_2 = /* @__PURE__ */ from_html(`<nav id="mobbar" aria-label="Main"><button type="button"><!>Search</button> <button type="button"><!>Layers</button> <button type="button"><!>Time</button> <button type="button" class="mb"><!>Tour</button></nav> <!>`, 1);
function MobileNav($$anchor, $$props) {
	push($$props, true);
	const $timeBar = () => store_get(timeBar, "$timeBar", $$stores);
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
	user_effect(() => {
		document.body.classList.toggle("show-time", $timeBar());
	});
	function press(id) {
		const b = document.getElementById(id);
		if (b) b.click();
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
	var fragment = root_2();
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
		name: "clock",
		size: 20
	});
	next();
	reset(button_2);
	var button_3 = sibling(button_2, 2);
	Icon(child(button_3), {
		name: "compass",
		size: 20
	});
	next();
	reset(button_3);
	reset(nav);
	var node_4 = sibling(nav, 2);
	var consequent_1 = ($$anchor) => {
		var div = root_1$1();
		let classes_3;
		var div_1 = child(div);
		var button_4 = child(div_1);
		var div_2 = sibling(button_4, 2);
		var span = child(div_2);
		var node_5 = child(span);
		{
			let $0 = /* @__PURE__ */ user_derived(() => get(mobPanel) === "layers" ? "layers" : "search");
			Icon(node_5, {
				get name() {
					return get($0);
				},
				size: 15
			});
		}
		var text = sibling(node_5);
		var small = sibling(text);
		small.textContent = `· b16:28`;
		reset(span);
		var span_1 = sibling(span, 2);
		var button_5 = child(span_1);
		Icon(child(button_5), {
			name: "chevron",
			size: 15
		});
		reset(button_5);
		var button_6 = sibling(button_5, 2);
		Icon(child(button_6), {
			name: "close",
			size: 15
		});
		reset(button_6);
		reset(span_1);
		reset(div_2);
		reset(div_1);
		var div_3 = sibling(div_1, 2);
		var node_8 = child(div_3);
		var consequent = ($$anchor) => {
			Controls($$anchor, { legend: false });
		};
		var alternate = ($$anchor) => {
			var fragment_2 = root$2();
			var node_9 = first_child(fragment_2);
			SearchBox(node_9, {
				mode: "sheet",
				onpick: () => {
					set(mobPanel, null);
				}
			});
			var node_10 = sibling(node_9, 2);
			PoiBar(node_10, { onpick: () => {
				set(mobPanel, null);
			} });
			var div_4 = sibling(node_10, 2);
			var button_7 = child(div_4);
			Icon(child(button_7), {
				name: "sun",
				size: 15
			});
			next();
			reset(button_7);
			var button_8 = sibling(button_7, 2);
			Icon(child(button_8), {
				name: "compass",
				size: 15
			});
			next();
			reset(button_8);
			var button_9 = sibling(button_8, 2);
			Icon(child(button_9), {
				name: "link",
				size: 15
			});
			next();
			reset(button_9);
			var button_10 = sibling(button_9, 2);
			Icon(child(button_10), {
				name: "reset",
				size: 15
			});
			next();
			reset(button_10);
			reset(div_4);
			LivePanel(sibling(div_4, 2), { onpick: () => {
				set(mobPanel, null);
			} });
			delegated("click", button_7, () => press("solarBtn"));
			delegated("click", button_8, () => press("tourBtn"));
			delegated("click", button_9, () => press("shareBtn"));
			delegated("click", button_10, () => press("resetBtn"));
			append($$anchor, fragment_2);
		};
		if_block(node_8, ($$render) => {
			if (get(mobPanel) === "layers") $$render(consequent);
			else $$render(alternate, -1);
		});
		reset(div_3);
		reset(div);
		template_effect(() => {
			set_style(div, `transform:translateY(${get(shiftPx) ?? ""}px)`);
			set_attribute(div, "aria-label", get(mobPanel) === "layers" ? "Layers" : "Search");
			classes_3 = set_class(div, 1, "", null, classes_3, {
				full: get(snap) === "full",
				dragging: get(dragging)
			});
			set_text(text, ` ${get(mobPanel) === "layers" ? "Layers" : "Search"} `);
		});
		delegated("pointerdown", button_4, down);
		delegated("pointermove", button_4, move);
		delegated("pointerup", button_4, up);
		event("pointercancel", button_4, up);
		delegated("click", button_4, grabClick);
		delegated("keydown", button_4, grabKey);
		delegated("click", button_5, cycle);
		delegated("click", button_6, () => {
			set(mobPanel, null);
		});
		append($$anchor, div);
	};
	if_block(node_4, ($$render) => {
		if (get(mobPanel)) $$render(consequent_1);
	});
	template_effect(() => {
		classes = set_class(button, 1, "mb", null, classes, { active: get(mobPanel) === "search" });
		set_attribute(button, "aria-pressed", get(mobPanel) === "search");
		classes_1 = set_class(button_1, 1, "mb", null, classes_1, { active: get(mobPanel) === "layers" });
		set_attribute(button_1, "aria-pressed", get(mobPanel) === "layers");
		classes_2 = set_class(button_2, 1, "mb", null, classes_2, { active: $timeBar() });
		set_attribute(button_2, "aria-pressed", $timeBar());
	});
	delegated("click", button, () => openSheet("search"));
	delegated("click", button_1, () => openSheet("layers"));
	delegated("click", button_2, toggleTime);
	delegated("click", button_3, () => press("tourBtn"));
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
//#region src/components/ZoomControl.svelte
var root$1 = /* @__PURE__ */ from_html(`<div role="group" aria-label="Zoom"><button type="button" aria-label="Zoom in"><!></button> <div class="jog" role="slider" tabindex="0" aria-label="Zoom wheel" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"><span></span><span></span><span></span><span></span><span></span></div> <button type="button" aria-label="Zoom out"><!></button></div>`);
function ZoomControl($$anchor, $$props) {
	push($$props, true);
	let variant = prop($$props, "variant", 3, "float");
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
	function key(e, f) {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			api.zoomBy && api.zoomBy(f);
		}
	}
	var div = root$1();
	var button = child(div);
	Icon(child(button), {
		name: "plus",
		size: 17,
		stroke: 1.8
	});
	reset(button);
	var div_1 = sibling(button, 2);
	var button_1 = sibling(div_1, 2);
	Icon(child(button_1), {
		name: "minus",
		size: 17,
		stroke: 1.8
	});
	reset(button_1);
	reset(div);
	template_effect(() => set_class(div, 1, `zoomctl zoom-${variant() ?? ""}`));
	delegated("keydown", button, (e) => key(e, .965));
	delegated("pointerdown", button, () => hold(.965));
	delegated("pointerup", button, stop);
	event("pointerleave", button, stop);
	event("pointercancel", button, stop);
	delegated("keydown", div_1, (e) => {
		if (e.key === "ArrowUp") key({
			key: "Enter",
			preventDefault() {}
		}, .9);
		if (e.key === "ArrowDown") key({
			key: "Enter",
			preventDefault() {}
		}, 1.1);
	});
	delegated("pointerdown", div_1, jogDown);
	delegated("pointermove", div_1, jogMove);
	delegated("pointerup", div_1, jogUp);
	event("pointercancel", div_1, jogUp);
	delegated("keydown", button_1, (e) => key(e, 1.036));
	delegated("pointerdown", button_1, () => hold(1.036));
	delegated("pointerup", button_1, stop);
	event("pointerleave", button_1, stop);
	event("pointercancel", button_1, stop);
	append($$anchor, div);
	pop();
}
delegate([
	"keydown",
	"pointerdown",
	"pointerup",
	"pointermove"
]);
//#endregion
//#region src/App.svelte
var root = /* @__PURE__ */ from_html(`<button type="button"><!><span class="rb-l"> </span></button>`);
var root_1 = /* @__PURE__ */ from_html(`<canvas id="gl"></canvas> <canvas id="sky"></canvas> <!> <div id="left-col"><!> <!></div> <!> <div id="rail-wrap"><div id="railpanel"><div><!></div> <div><!></div> <div><!></div> <div><!></div></div> <nav id="rail" aria-label="Panels"><!> <div class="rail-gap"></div> <!></nav></div> <!> <!> <!> <!> <!> <!> <button id="resetBtn" style="display:none" aria-hidden="true" tabindex="-1"></button>`, 1);
function App($$anchor, $$props) {
	push($$props, true);
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
		}
	];
	let panel = /* @__PURE__ */ state(null);
	user_effect(() => {
		document.body.classList.toggle("rail-open", !!get(panel));
	});
	function pick(k) {
		set(panel, get(panel) === k ? null : k, true);
	}
	function esc(e) {
		if (e.key === "Escape" && get(panel)) set(panel, null);
	}
	var fragment = root_1();
	event("keydown", $window, esc);
	var node = sibling(first_child(fragment), 4);
	PoiBar(node, { variant: "top" });
	var div = sibling(node, 2);
	var node_1 = child(div);
	TopPanel(node_1, {});
	SearchBox(sibling(node_1, 2), {});
	reset(div);
	var node_3 = sibling(div, 2);
	InfoHost(node_3, {});
	var div_1 = sibling(node_3, 2);
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
	MwMap(child(div_5), { collapsible: false });
	reset(div_5);
	var div_6 = sibling(div_5, 2);
	let classes_4;
	LivePanel(child(div_6), { collapsible: false });
	reset(div_6);
	reset(div_2);
	var nav = sibling(div_2, 2);
	var node_8 = child(nav);
	each(node_8, 17, () => RAIL, (r) => r.k, ($$anchor, r) => {
		var button = root();
		let classes_5;
		var node_9 = child(button);
		Icon(node_9, {
			get name() {
				return get(r).icon;
			},
			size: 19
		});
		var span = sibling(node_9);
		var text = child(span, true);
		reset(span);
		reset(button);
		template_effect(() => {
			classes_5 = set_class(button, 1, "rb", null, classes_5, { on: get(panel) === get(r).k });
			set_attribute(button, "aria-pressed", get(panel) === get(r).k);
			set_attribute(button, "title", get(r).label);
			set_text(text, get(r).label);
		});
		delegated("click", button, () => pick(get(r).k));
		append($$anchor, button);
	});
	ZoomControl(sibling(node_8, 4), { variant: "rail" });
	reset(nav);
	reset(div_1);
	var node_11 = sibling(div_1, 2);
	ZoomControl(node_11, { variant: "float" });
	var node_12 = sibling(node_11, 2);
	NavConsole(node_12, {});
	var node_13 = sibling(node_12, 2);
	PmPanel(node_13, {});
	var node_14 = sibling(node_13, 2);
	TimeBars(node_14, {});
	var node_15 = sibling(node_14, 2);
	TourPanel(node_15, {});
	MobileNav(sibling(node_15, 2), {});
	next(2);
	template_effect(() => {
		classes = set_class(div_2, 1, "", null, classes, { open: !!get(panel) });
		classes_1 = set_class(div_3, 1, "rp-pane", null, classes_1, { on: get(panel) === "layers" });
		classes_2 = set_class(div_4, 1, "rp-pane", null, classes_2, { on: get(panel) === "legend" });
		classes_3 = set_class(div_5, 1, "rp-pane", null, classes_3, { on: get(panel) === "map" });
		classes_4 = set_class(div_6, 1, "rp-pane", null, classes_4, { on: get(panel) === "live" });
	});
	append($$anchor, fragment);
	pop();
}
delegate(["click"]);
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
function boot() {
	runEngine();
	try {
		restore();
	} catch (e) {}
}
var getJSON = (u) => fetch(u).then((r) => {
	if (!r.ok) throw new Error(u + " → HTTP " + r.status);
	return r.json();
});
if (window.__DATA__) boot();
else Promise.all([getJSON("data/data.json"), getJSON("data/catalog.json")]).then(([d, c]) => {
	window.__DATA__ = d;
	window.__CATALOG__ = c;
	boot();
}).catch((e) => {
	document.body.innerHTML = "<p style=\"color:#e9edfa;font-family:monospace;padding:2em\">Error loading data: " + e + "</p>";
});
//#endregion
