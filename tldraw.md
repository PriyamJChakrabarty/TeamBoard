Quick start

Copy markdown
Have five minutes? Run this command in your terminal to explore tldraw starter kits:

npm create tldraw@latest

Copy
Have a little more time? Let's try out the tldraw SDK in a React project.

If you're new to React, we recommend using a Vite template as a starter. We'll assume your project is already running locally.

Getting started
First, install the tldraw package from npm:

npm install tldraw

Copy
Next, in your React project, import the Tldraw component and tldraw's CSS styles. Then render the Tldraw component inside a full screen container:

import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'

export default function App() {
	return (
		<div style={{ position: 'fixed', inset: 0 }}>
			<Tldraw />
		</div>
	)
}

Copy
That's pretty much it! At this point, you should have a complete working single-user canvas. You can draw, write, add images and video, zoom, pan, copy and paste, undo and redo—everything you'd expect from a canvas.

You'll be starting from our default shapes, tools, and user interface, but you can customize all of these things for your project if you wish. For now, let's show off a few more features.

Local persistence
Let's add local persistence by passing a persistenceKey prop to the Tldraw component:

export default function App() {
	return (
		<div style={{ position: 'fixed', inset: 0 }}>
			<Tldraw persistenceKey="example" />
		</div>
	)
}

Copy
Using a persistenceKey will use your browser's storage to ensure that your project can survive a browser refresh. It will also synchronize the project between other instances that share the same persistenceKey—including in other browser tabs! Give it a try by opening your app in a second window.

Real-time collaboration
To add support for multiple users collaborating in realtime, you can use the tldraw sync demo library. This library adds real-time collaboration using temporary rooms.

First, install the @tldraw/sync package:

npm install @tldraw/sync

Copy
Next, import the useSyncDemo hook from the @tldraw/sync package. Call it in your component with a unique ID and pass the store that it returns to the Tldraw component:

import { Tldraw } from 'tldraw'
import { useSyncDemo } from '@tldraw/sync'
import 'tldraw/tldraw.css'

export default function App() {
	const store = useSyncDemo({ roomId: 'insert-any-string-here' })

	return (
		<div style={{ position: 'fixed', inset: 0 }}>
			<Tldraw store={store} />
		</div>
	)
}

Copy
Try it out by opening your project in a second incognito window, or else access it from another device. You should see all of tldraw's multiplayer features: live cursors, user names, viewport following, cursor chat, and more.

If you want to go further with real-time collaboration, be sure to check out our guide to the tldraw sync library.

Controlling the canvas
The tldraw editor has a runtime JavaScript API. Everything that can happen in tldraw can be done programmatically through the Editor instance.

For simplicity's sake, let's roll back our persistence and sync code. We can then use the Tldraw component's onMount callback to get access to the Editor instance. We'll use the editor to create a new shape on the canvas, select it, then slowly zoom to it.

import { Editor, Tldraw, toRichText } from 'tldraw'
import 'tldraw/tldraw.css'

export default function App() {
	const handleMount = (editor: Editor) => {
		editor.createShape({
			type: 'text',
			x: 200,
			y: 200,
			props: {
				richText: toRichText('Hello world!'),
			},
		})

		editor.selectAll()

		editor.zoomToSelection({
			animation: { duration: 5000 },
		})
	}

	return (
		<div style={{ position: 'fixed', inset: 0 }}>
			<Tldraw onMount={handleMount} />
		</div>
	)
}

Copy
The Editor is tldraw's main interface for controlling the canvas. Be sure to check out the Editor API documentation for more information on what you can do with it, as well as our guide on using the editor.


Shapes

Copy markdown
In tldraw, a shape is something that can exist on the page, like an arrow, an image, or some text. This article provides an overview of shapes and how to create custom ones.

Shape basics
Shapes are JSON records stored in the editor's store. Each shape has base properties (position, rotation, opacity) plus a props object for shape-specific data. See Shapes for the full shape system architecture.

The Tldraw component includes default shapes like geo, text, arrow, and draw. The only core shape (always present) is the group.

ShapeUtil
Each shape type has a ShapeUtil class that defines its behavior: how it renders, its geometry for hit testing, and how it responds to interactions. See Shapes for details on ShapeUtil methods, lifecycle hooks, and configuration.

Custom shapes
You can create your own shapes by defining a shape type and a ShapeUtil class.

For a working example, see our custom shapes example.

Defining the shape type
Register your shape's props using TypeScript module augmentation:

const CARD_TYPE = 'card'

declare module 'tldraw' {
	export interface TLGlobalShapePropsMap {
		[CARD_TYPE]: { w: number; h: number }
	}
}

type CardShape = TLShape<typeof CARD_TYPE>

Copy
Creating a ShapeUtil
Implement the required methods: getDefaultProps, getGeometry, component, and indicator:

import { HTMLContainer, Rectangle2d, ShapeUtil } from 'tldraw'

class CardShapeUtil extends ShapeUtil<CardShape> {
	static override type = CARD_TYPE

	getDefaultProps(): CardShape['props'] {
		return { w: 100, h: 100 }
	}

	getGeometry(shape: CardShape) {
		return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: true,
		})
	}

	component(shape: CardShape) {
		return <HTMLContainer>Hello</HTMLContainer>
	}

	getIndicatorPath(shape: CardShape) {
		const path = new Path2D()
		path.rect(0, 0, shape.props.w, shape.props.h)
		return path
	}
}

Copy
See Geometry for available geometry classes.

Registering your shape
Pass your ShapeUtil to the Tldraw component:

export default function () {
	return (
		<div style={{ position: 'fixed', inset: 0 }}>
			<Tldraw
				shapeUtils={[CardShapeUtil]}
				onMount={(editor) => {
					editor.createShape({ type: 'card' })
				}}
			/>
		</div>
	)
}

Copy
Extending shapes
BaseBoxShapeUtil - Extend this for standard rectangular shape behavior
ShapeUtil.configure - Customize built-in shapes without subclassing


Tools

Copy markdown
In tldraw, a tool is a top-level state in our state chart. The select tool, draw tool, and arrow tool are all examples of tools—each defines how the editor responds to user input while that tool is active.

A diagram showing the state chart of tldraw. The top row of states (apart from the Root state) are annotated as tools.
The first level of states in the state chart are known as tools.
For a full guide to the tool system, including state hierarchy, event handling, child states, tool lock, creating custom tools, and overriding defaults, see the Tools page.

Default and custom tools
The <Tldraw> component includes default tools like select, hand, draw, and arrow. The core @tldraw/editor package has no built-in tools—if you use <TldrawEditor> directly, you provide your own.

You can create custom tools by extending StateNode and passing them to the tools prop:

import { StateNode, TLPointerEventInfo, Tldraw } from 'tldraw'

class StampTool extends StateNode {
	static override id = 'stamp'

	onPointerDown(info: TLPointerEventInfo) {
		// Create a shape at the click position
	}
}

export default function App() {
	return <Tldraw tools={[StampTool]} />
}

Copy
Changing tools
Change the active tool with editor.setCurrentTool:

editor.setCurrentTool('select')
editor.setCurrentTool('hand')
editor.setCurrentTool('draw')

Copy
Learn more
For comprehensive coverage of tools, see these guides:

Tools — Full guide to the tool system: state hierarchy, event handling, child states, tool lock, creating custom tools, and overriding defaults
Events — How the editor dispatches events and how to subscribe to them
Input handling — Pointer tracking, keyboard state, and the editor.inputs API
Ticks — Frame-synchronized updates for animations and continuous interactions
Examples
Custom tool — A simple tool that adds stickers to the canvas
Tool with child states — A tool with multiple states for complex interactions
Screenshot tool — A tool for capturing canvas regions



UI components

Copy markdown
The @tldraw/tldraw package includes a complete React-based UI. It provides the menus, toolbars, panels, and dialogs that users interact with when creating and editing content. The UI is composed of named component slots that you can selectively override or hide, so you can customize the interface while still benefiting from the editor's reactive state management.

The UI connects to the editor through React hooks and context providers. Components automatically update when editor state changes. You can replace individual parts of the interface without reimplementing the logic that connects UI actions to editor operations.

How it works
Component slot architecture
The UI divides the screen into distinct layout zones:

┌─────────────────────────────────────────────────────────┐
│                    Top Panel                             │
├────────────┬──────────────────────────┬─────────────────┤
│   Left     │         Canvas           │     Right       │
│   Panel    │                          │     Panel       │
├────────────┴──────────────────────────┴─────────────────┤
│                   Bottom Panel                           │
└─────────────────────────────────────────────────────────┘

Copy
The top zone contains the main menu, helper buttons (like "Back to content"), the top panel for collaboration features, and the share and style panels. The bottom zone houses navigation controls, the main toolbar with drawing tools, and the help menu. On desktop, the style panel appears in the top-right zone; on mobile it moves to a modal overlay.

Each zone can host multiple components. The toolbar includes the tool selector, tool-specific options, and the tool lock button. These components share context and coordinate through the editor's state.

Context providers and state management
The UI establishes a hierarchy of React context providers that manage different aspects of the interface. At the root, TldrawUiContextProvider coordinates all other providers and merges your overrides. Specialized providers handle translations, tooltips, dialogs, toasts, breakpoints for responsive behavior, and the component registry.

The actions and tools providers transform raw editor methods into UI-friendly actions with labels, icons, and keyboard shortcuts. When you click a toolbar button, the component calls an action from context, which invokes the appropriate editor method. This indirection means the same action can be triggered from multiple places (toolbar, menu, keyboard shortcut) with consistent behavior.

Reactive UI updates
UI components read editor state through hooks like useEditor, useValue, and useReactor. These hooks use the editor's reactive signal system to automatically re-render when relevant state changes. The style panel uses useRelevantStyles to determine which style controls to show based on the current selection—when you select a different shape, the hook detects the change and the panel updates.

This reactive approach means you don't need to manually manage subscriptions or worry about stale state. Components declare their dependencies, and the reactivity system handles the rest.

Key components
Component slots
The UI defines several component slots you can override or hide.

The Toolbar contains the primary tool selector with buttons for each available tool (select, draw, shapes, etc.). On mobile, it hides automatically when editing text to make room for the virtual keyboard.

The TopPanel displays the page name and collaboration indicators when multiplayer features are enabled. It's hidden in single-player mode.

The StylePanel shows style controls for selected shapes: color, fill, stroke, size, opacity. It appears in the top-right on desktop and as a modal on mobile.

The MenuPanel houses the main application menu with actions like export, print, and preferences. It's typically in the top-left corner.

The NavigationPanel provides page navigation, zoom controls, and the minimap toggle. It sits in the bottom-left area.

HelperButtons are context-sensitive buttons that appear based on editor state—"Back to content" when the camera is far from shapes, "Exit pen mode" on touch devices.

ActionsMenu, ContextMenu, and HelpMenu provide access to actions and information through different interaction patterns.

Each slot is optional. Pass null as an override to hide a component entirely, or provide your own React component to replace the default implementation.

Slot props
The UI portion of the components prop is shaped by TLUiComponents. Every key is optional: use null to hide that slot, or pass a React component. When a slot has a documented props type in the table below, import that type from tldraw and type your replacement as React.ComponentType<…> (or implement the matching props). When the props column says none, the SDK does not declare extra props for that slot beyond what a plain ComponentType allows.

Slot	Props (import from tldraw)
ContextMenu	TLUiContextMenuProps
ActionsMenu	TLUiActionsMenuProps
HelpMenu	TLUiHelpMenuProps
ZoomMenu	TLUiZoomMenuProps
MainMenu	TLUiMainMenuProps
Minimap	none
StylePanel	TLUiStylePanelProps
PageMenu	none
NavigationPanel	none
Toolbar	none
RichTextToolbar	TLUiRichTextToolbarProps
ImageToolbar	none
VideoToolbar	none
KeyboardShortcutsDialog	TLUiKeyboardShortcutsDialogProps
QuickActions	TLUiQuickActionsProps
HelperButtons	TLUiHelperButtonsProps
DebugPanel	none
DebugMenu	none
MenuPanel	none
TopPanel	none
SharePanel	none
CursorChatBubble	none
Dialogs	none
Toasts	none
A11y	none
FollowingIndicator	none
PeopleMenu	none (default component: optional children via DefaultPeopleMenuProps)
PeopleMenuAvatar	TLUiPeopleMenuAvatarProps
PeopleMenuFacePile	TLUiPeopleMenuFacePileProps
PeopleMenuItem	TLUiPeopleMenuItemProps
UserPresenceEditor	none
This table is an index; the authoritative list and types remain TLUiComponents in the API reference and in the package typings.

UI hooks
Components access editor functionality through specialized hooks.

useEditor returns the editor instance, providing direct access to all editor methods and state.

useActions returns a collection of UI actions (copy, paste, delete) with their labels, icons, and keyboard shortcuts. Each action is a function you can call from your custom UI.

useTools returns the available tools with their metadata. The toolbar uses this to render tool buttons.

useRelevantStyles determines which styles are relevant to the current selection and returns their values. It powers the style panel.

useBreakpoint returns a numeric breakpoint index (0-7) that maps to the PORTRAIT_BREAKPOINT enum. Compare against values like PORTRAIT_BREAKPOINT.MOBILE or PORTRAIT_BREAKPOINT.TABLET_SM to adapt layout for different screen sizes.

These hooks encapsulate common UI patterns and keep your custom components in sync with editor state.

Hiding the UI
You can hide the default tldraw user interface entirely using the hideUi prop. This turns off both the visuals and the keyboard shortcuts.

import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'

export default function App() {
	return (
		<div style={{ position: 'fixed', inset: 0 }}>
			<Tldraw hideUi />
		</div>
	)
}

Copy
When the UI is hidden, you can't select tools using keyboard shortcuts. You can still control the editor programmatically through Editor methods. Open the console and try:

editor.setCurrentTool('draw')

Copy
All of tldraw's user interface works by controlling the editor via its methods. If you hide the user interface, you can still use these same methods to control the editor. See the custom user interface example for this in action.

Extension points
Overriding components
Override individual components by passing them to the components prop:

import { Tldraw, useEditor, useTools } from 'tldraw'
import 'tldraw/tldraw.css'

function CustomToolbar() {
	const editor = useEditor()
	const tools = useTools()

	return (
		<div className="my-toolbar">
			{Object.values(tools).map((tool) => (
				<button key={tool.id} onClick={() => editor.setCurrentTool(tool.id)}>
					{tool.label}
				</button>
			))}
		</div>
	)
}

export default function App() {
	return (
		<div style={{ position: 'fixed', inset: 0 }}>
			<Tldraw
				components={{
					Toolbar: CustomToolbar,
				}}
			/>
		</div>
	)
}

Copy
The useTools hook returns an object mapping tool IDs to TLUiToolItem objects. Each tool item contains metadata like id, label, icon, and kbd (keyboard shortcut).

Hiding components
Pass null to hide a component entirely. This is useful for focused experiences that don't need the full default UI:

<Tldraw
	components={{
		HelpMenu: null,
		DebugMenu: null,
		SharePanel: null,
	}}
/>

Copy
See the UI components hidden example for a complete list of hideable components.

Overrides
Control tldraw's menu content with the overrides prop. This prop accepts a TLUiOverrides object, which has methods for actions and tools, and a translations property.

Actions
The user interface has a set of shared actions used in the menus and keyboard shortcuts. Override these by providing an actions method that receives the editor, the default actions, and a helpers object, then returns a mutated actions object.

import { Tldraw, TLUiOverrides } from 'tldraw'
import 'tldraw/tldraw.css'

const myOverrides: TLUiOverrides = {
	actions(editor, actions, helpers) {
		// Delete an action (remember to also delete any menu items that reference it)
		delete actions['insert-embed']

		// Create a new action or replace an existing one
		actions['my-new-action'] = {
			id: 'my-new-action',
			label: 'My new action',
			readonlyOk: true,
			kbd: 'cmd+shift+u,ctrl+shift+u',
			onSelect(source) {
				window.alert('My new action just happened!')
			},
		}
		return actions
	},
}

export default function App() {
	return (
		<div style={{ position: 'fixed', inset: 0 }}>
			<Tldraw overrides={myOverrides} />
		</div>
	)
}

Copy
The actions object is a map of TLUiActionItems, keyed by their id. See the action overrides example for more.

Tools
Override tools the same way you override actions. Provide a tools method that accepts the editor, the default tools object, and a helpers object, then returns a mutated version.

const myOverrides: TLUiOverrides = {
	tools(editor, tools, helpers) {
		// Create a tool item in the UI's context
		tools.card = {
			id: 'card',
			icon: 'color',
			label: 'tools.card',
			kbd: 'c',
			onSelect: () => {
				editor.setCurrentTool('card')
			},
		}
		return tools
	},
}

Copy
The tools object is a map of TLUiToolItems, keyed by their id. See the add tool to toolbar example for a complete implementation.

Translations
The translations property accepts a table of new translations. If you add a tool with label: 'tools.card', you need to provide an English translation for that key:

const myOverrides: TLUiOverrides = {
	translations: {
		en: {
			'tools.card': 'Card',
		},
	},
}

Copy
See internationalization for more about tldraw's translation system.

UI events
The Tldraw component has an onUiEvent prop that fires when users interact with the UI:

import { Tldraw, TLUiEventHandler } from 'tldraw'
import 'tldraw/tldraw.css'

export default function App() {
	const handleUiEvent: TLUiEventHandler = (name, data) => {
		console.log('UI event:', name, data)
	}

	return (
		<div style={{ position: 'fixed', inset: 0 }}>
			<Tldraw onUiEvent={handleUiEvent} />
		</div>
	)
}

Copy
The callback receives the event name as a string and an object with information about the event's source (e.g. menu or context-menu) and other data specific to each event, such as the direction in an align-shapes event.

Note that onUiEvent only fires for UI interactions. Calling Editor.alignShapes directly won't trigger this callback. See the UI events example for more.


The `@tldraw/tldraw` package exports a set of UI primitive components that you can use when building custom interfaces. These components match the look and feel of tldraw's default UI and integrate with the editor's theming, translations, and accessibility features.

Use these primitives when you want your custom UI to feel like a natural part of tldraw rather than something bolted on.

## Buttons

The button system consists of `TldrawUiButton` and its companion components for icons, labels, and state indicators.

### TldrawUiButton

The base button component with several visual variants:

```tsx
import { TldrawUiButton, TldrawUiButtonLabel } from 'tldraw'

function MyButtons() {
	return (
		<>
			<TldrawUiButton type="normal" onClick={() => console.log('clicked')}>
				<TldrawUiButtonLabel>Normal</TldrawUiButtonLabel>
			</TldrawUiButton>

			<TldrawUiButton type="primary" onClick={() => console.log('clicked')}>
				<TldrawUiButtonLabel>Primary</TldrawUiButtonLabel>
			</TldrawUiButton>

			<TldrawUiButton type="danger" onClick={() => console.log('clicked')}>
				<TldrawUiButtonLabel>Danger</TldrawUiButtonLabel>
			</TldrawUiButton>

			<TldrawUiButton type="icon" onClick={() => console.log('clicked')}>
				<TldrawUiButtonIcon icon="plus" />
			</TldrawUiButton>
		</>
	)
}
```

The `type` prop controls the button's appearance:

| Type      | Description                              |
| --------- | ---------------------------------------- |
| `normal`  | Standard button for general actions      |
| `primary` | Emphasized button for primary actions    |
| `danger`  | Red button for destructive actions       |
| `low`     | Subtle button with minimal visual weight |
| `icon`    | Square button sized for a single icon    |
| `tool`    | Tool button style used in the toolbar    |
| `menu`    | Button style used inside menus           |
| `help`    | Style used for help/info buttons         |

Use `isActive` to indicate a selected or active state:

```tsx
<TldrawUiButton type="tool" isActive={true}>
	<TldrawUiButtonIcon icon="draw" />
</TldrawUiButton>
```

### Button sub-components

Build up button contents using these components:

```tsx
import {
	TldrawUiButton,
	TldrawUiButtonIcon,
	TldrawUiButtonLabel,
	TldrawUiButtonCheck,
	TldrawUiButtonSpinner,
} from 'tldraw'

// Icon button
<TldrawUiButton type="icon">
	<TldrawUiButtonIcon icon="trash" />
</TldrawUiButton>

// Button with icon and label
<TldrawUiButton type="menu">
	<TldrawUiButtonIcon icon="plus" />
	<TldrawUiButtonLabel>Add item</TldrawUiButtonLabel>
</TldrawUiButton>

// Button with checkmark (for toggles in menus)
<TldrawUiButton type="menu">
	<TldrawUiButtonCheck checked={true} />
	<TldrawUiButtonLabel>Show grid</TldrawUiButtonLabel>
</TldrawUiButton>

// Button with loading spinner
<TldrawUiButton type="normal" disabled>
	<TldrawUiButtonSpinner />
	<TldrawUiButtonLabel>Loading...</TldrawUiButtonLabel>
</TldrawUiButton>
```

## Icons

`TldrawUiIcon` renders icons from tldraw's icon set. Icons are SVG-based and inherit the current text color.

```tsx
import { TldrawUiIcon } from 'tldraw'

<TldrawUiIcon icon="draw" label="Draw tool" />
<TldrawUiIcon icon="arrow-left" label="Go back" small />
<TldrawUiIcon icon="check" label="Complete" color="green" />
```

The `label` prop is required for accessibility—it becomes the icon's `aria-label`. Use `small` for a smaller icon size.

You can also pass a custom React element instead of an icon name:

```tsx
<TldrawUiIcon icon={<div className="my-custom-icon">★</div>} label="Favorite" />
```

## Menu primitives

When adding items to tldraw's menus, use these components to match the default menu styling and behavior.

### TldrawUiMenuItem

The main component for menu items. It automatically adapts its rendering based on which menu it's in (dropdown, context menu, toolbar, etc.):

```tsx
import { TldrawUiMenuItem, TldrawUiMenuGroup } from 'tldraw'
;<TldrawUiMenuGroup id="my-actions">
	<TldrawUiMenuItem
		id="my-action"
		label="Do something"
		icon="plus"
		kbd="cmd+shift+d"
		onSelect={() => {
			console.log('action triggered')
		}}
	/>
</TldrawUiMenuGroup>
```

Props:

| Prop         | Description                                            |
| ------------ | ------------------------------------------------------ |
| `id`         | Unique identifier for the menu item                    |
| `label`      | Display text (supports translation keys)               |
| `icon`       | Icon to display (on right in menus)                    |
| `iconLeft`   | Icon to display on the left side                       |
| `kbd`        | Keyboard shortcut to display                           |
| `onSelect`   | Called when the item is clicked                        |
| `disabled`   | Whether the item is disabled                           |
| `readonlyOk` | If true, item is shown even in readonly mode           |
| `isSelected` | Whether the item shows as selected (for toolbar items) |
| `spinner`    | Show a loading spinner                                 |
| `noClose`    | Prevent the menu from closing when clicked             |

### TldrawUiMenuGroup

Groups related menu items together. In dropdown menus, groups are separated by dividers:

```tsx
<TldrawUiMenuGroup id="clipboard">
	<TldrawUiMenuItem id="cut" label="Cut" kbd="cmd+x" onSelect={handleCut} />
	<TldrawUiMenuItem id="copy" label="Copy" kbd="cmd+c" onSelect={handleCopy} />
	<TldrawUiMenuItem id="paste" label="Paste" kbd="cmd+v" onSelect={handlePaste} />
</TldrawUiMenuGroup>
```

### TldrawUiMenuSubmenu

Creates a nested submenu:

```tsx
import { TldrawUiMenuSubmenu } from 'tldraw'
;<TldrawUiMenuSubmenu id="export" label="Export as...">
	<TldrawUiMenuGroup id="formats">
		<TldrawUiMenuItem id="png" label="PNG" onSelect={exportPng} />
		<TldrawUiMenuItem id="svg" label="SVG" onSelect={exportSvg} />
		<TldrawUiMenuItem id="json" label="JSON" onSelect={exportJson} />
	</TldrawUiMenuGroup>
</TldrawUiMenuSubmenu>
```

### TldrawUiMenuCheckboxItem

A menu item with a checkbox:

```tsx
import { TldrawUiMenuCheckboxItem } from 'tldraw'
;<TldrawUiMenuCheckboxItem
	id="snap-to-grid"
	label="Snap to grid"
	checked={snapEnabled}
	onSelect={() => {
		setSnapEnabled(!snapEnabled)
	}}
/>
```

The `onSelect` callback receives a `source` parameter indicating where the action was triggered from (e.g., 'context-menu', 'menu'). You can ignore it if you don't need to differentiate between sources.

## Dialogs

Build modal dialogs using tldraw's dialog primitives. These components handle accessibility, focus management, and styling.

```tsx
import {
	TldrawUiDialogHeader,
	TldrawUiDialogTitle,
	TldrawUiDialogCloseButton,
	TldrawUiDialogBody,
	TldrawUiDialogFooter,
	TldrawUiButton,
	TldrawUiButtonLabel,
	useDialogs,
} from 'tldraw'

function MyDialog({ onClose }: { onClose(): void }) {
	return (
		<>
			<TldrawUiDialogHeader>
				<TldrawUiDialogTitle>Confirm deletion</TldrawUiDialogTitle>
				<TldrawUiDialogCloseButton />
			</TldrawUiDialogHeader>
			<TldrawUiDialogBody style={{ maxWidth: 350 }}>
				Are you sure you want to delete this item? This action cannot be undone.
			</TldrawUiDialogBody>
			<TldrawUiDialogFooter className="tlui-dialog__footer__actions">
				<TldrawUiButton type="normal" onClick={onClose}>
					<TldrawUiButtonLabel>Cancel</TldrawUiButtonLabel>
				</TldrawUiButton>
				<TldrawUiButton
					type="danger"
					onClick={() => {
						deleteItem()
						onClose()
					}}
				>
					<TldrawUiButtonLabel>Delete</TldrawUiButtonLabel>
				</TldrawUiButton>
			</TldrawUiDialogFooter>
		</>
	)
}

// Show the dialog using the useDialogs hook
function MyComponent() {
	const { addDialog } = useDialogs()

	return <button onClick={() => addDialog({ component: MyDialog })}>Delete item</button>
}
```

The `onClose` function is passed to your dialog component automatically. Call it to dismiss the dialog.

## Input

`TldrawUiInput` is a styled text input with built-in handling for Enter (confirm) and Escape (cancel):

```tsx
import { TldrawUiInput } from 'tldraw'
;<TldrawUiInput
	label="Name"
	defaultValue="Untitled"
	onComplete={(value) => {
		// Called when user presses Enter
		saveName(value)
	}}
	onCancel={(value) => {
		// Called when user presses Escape
		// Value is reset to initial value
	}}
	onValueChange={(value) => {
		// Called on every keystroke
	}}
	autoSelect // Select all text on focus
	autoFocus
/>
```

Add icons to the input using `iconLeft` (left side) or `icon` (right side):

```tsx
<TldrawUiInput iconLeft="search" placeholder="Search shapes..." onValueChange={setSearchQuery} />
<TldrawUiInput icon="check" placeholder="Confirmed value" />
```

## Layout

Layout primitives help organize UI controls with proper spacing and orientation-aware tooltips.

```tsx
import { TldrawUiRow, TldrawUiColumn, TldrawUiGrid } from 'tldraw'

// Horizontal row of buttons
<TldrawUiRow>
	<TldrawUiButton type="icon"><TldrawUiButtonIcon icon="align-left" /></TldrawUiButton>
	<TldrawUiButton type="icon"><TldrawUiButtonIcon icon="align-center" /></TldrawUiButton>
	<TldrawUiButton type="icon"><TldrawUiButtonIcon icon="align-right" /></TldrawUiButton>
</TldrawUiRow>

// Vertical column
<TldrawUiColumn>
	<TldrawUiButton type="menu"><TldrawUiButtonLabel>Option 1</TldrawUiButtonLabel></TldrawUiButton>
	<TldrawUiButton type="menu"><TldrawUiButtonLabel>Option 2</TldrawUiButtonLabel></TldrawUiButton>
</TldrawUiColumn>

// 4-column grid (useful for color pickers, shape selectors, etc.)
<TldrawUiGrid>
	{colors.map(color => (
		<TldrawUiButton key={color} type="icon" onClick={() => setColor(color)}>
			<div style={{ background: color, width: 16, height: 16 }} />
		</TldrawUiButton>
	))}
</TldrawUiGrid>
```

These components automatically set up a `tooltipSide` context—tooltips appear below items in rows and to the right of items in columns, and nested components inherit this positioning.

## Other primitives

### TldrawUiKbd

Displays a keyboard shortcut:

```tsx
import { TldrawUiKbd } from 'tldraw'
;<TldrawUiKbd>cmd+shift+d</TldrawUiKbd>
```

### TldrawUiSlider

A slider control. The slider uses discrete steps rather than a continuous range:

```tsx
import { TldrawUiSlider } from 'tldraw'
;<TldrawUiSlider
	title="Opacity"
	label="style-panel.opacity"
	value={5}
	steps={10}
	onValueChange={(value) => console.log(value)}
/>
```

Props:

| Prop            | Description                                     |
| --------------- | ----------------------------------------------- |
| `title`         | Tooltip title text                              |
| `label`         | Translation key for the label                   |
| `value`         | Current value (0 to steps), or null             |
| `steps`         | Maximum value (the slider goes from 0 to steps) |
| `min`           | Optional minimum value (defaults to 0)          |
| `onValueChange` | Called with the new value when it changes       |

### TldrawUiPopover

A popover that appears next to a trigger element:

```tsx
import { TldrawUiPopover, TldrawUiPopoverTrigger, TldrawUiPopoverContent } from 'tldraw'
;<TldrawUiPopover id="my-popover">
	<TldrawUiPopoverTrigger>
		<TldrawUiButton type="icon">
			<TldrawUiButtonIcon icon="dots-vertical" />
		</TldrawUiButton>
	</TldrawUiPopoverTrigger>
	<TldrawUiPopoverContent side="bottom">
		<div style={{ padding: 8 }}>Popover content here</div>
	</TldrawUiPopoverContent>
</TldrawUiPopover>
```

The `id` prop is required and used to track the popover's open state. The `side` prop on `TldrawUiPopoverContent` controls which side of the trigger the popover appears on.

### TldrawUiDropdownMenu

A dropdown menu built on Radix UI:

```tsx
import {
	TldrawUiDropdownMenuRoot,
	TldrawUiDropdownMenuTrigger,
	TldrawUiDropdownMenuContent,
	TldrawUiDropdownMenuItem,
	TldrawUiDropdownMenuGroup,
	TldrawUiButton,
	TldrawUiButtonLabel,
} from 'tldraw'
;<TldrawUiDropdownMenuRoot id="my-dropdown">
	<TldrawUiDropdownMenuTrigger>
		<TldrawUiButton type="normal">
			<TldrawUiButtonLabel>Options</TldrawUiButtonLabel>
		</TldrawUiButton>
	</TldrawUiDropdownMenuTrigger>
	<TldrawUiDropdownMenuContent>
		<TldrawUiDropdownMenuGroup>
			<TldrawUiDropdownMenuItem>
				<TldrawUiButton type="menu" onClick={handleEdit}>
					<TldrawUiButtonLabel>Edit</TldrawUiButtonLabel>
				</TldrawUiButton>
			</TldrawUiDropdownMenuItem>
			<TldrawUiDropdownMenuItem>
				<TldrawUiButton type="menu" onClick={handleDuplicate}>
					<TldrawUiButtonLabel>Duplicate</TldrawUiButtonLabel>
				</TldrawUiButton>
			</TldrawUiDropdownMenuItem>
			<TldrawUiDropdownMenuItem>
				<TldrawUiButton type="menu" onClick={handleDelete}>
					<TldrawUiButtonLabel>Delete</TldrawUiButtonLabel>
				</TldrawUiButton>
			</TldrawUiDropdownMenuItem>
		</TldrawUiDropdownMenuGroup>
	</TldrawUiDropdownMenuContent>
</TldrawUiDropdownMenuRoot>
```

The `id` prop is required on `TldrawUiDropdownMenuRoot`. Each `TldrawUiDropdownMenuItem` wraps a child element (typically a button) and handles the dropdown behavior.

## Related examples

- **[Custom menus](/examples/ui/custom-menus)** — Add items to tldraw's menus using menu primitives
- **[Toasts and dialogs](/examples/ui/toasts-and-dialogs)** — Show toasts and custom dialogs
- **[Custom UI](/examples/ui/custom-ui)** — Build a completely custom interface



The [`Editor`](/reference/editor/Editor) class is the main way of controlling tldraw's editor. You can use it to manage the editor's internal state, make changes to the document, or respond to changes that have occurred.

By design, the [`Editor`](/reference/editor/Editor)'s surface area is very large. Almost everything is available through it. Need to create some shapes? Use [`Editor.createShapes`](/reference/editor/Editor#createShapes). Need to delete them? Use [`Editor.deleteShapes`](/reference/editor/Editor#deleteShapes). Need a sorted array of every shape on the current page? Use [`Editor.getCurrentPageShapesSorted`](/reference/editor/Editor#getCurrentPageShapesSorted).

## Accessing the editor

You can access the editor in two ways:

### The onMount callback

The [`Tldraw`](/reference/tldraw/Tldraw) component's `onMount` callback provides the editor as the first argument.

```tsx
function App() {
	return (
		<Tldraw
			onMount={(editor) => {
				// your editor code here
			}}
		/>
	)
}
```

### The useEditor hook

The [`useEditor`](/reference/editor/useEditor) hook returns the editor instance. It must be called from within the JSX of the [`Tldraw`](/reference/tldraw/Tldraw) component.

```tsx
function InsideOfContext() {
	const editor = useEditor()
	// your editor code here
	return null
}

function App() {
	return (
		<Tldraw>
			<InsideOfContext />
		</Tldraw>
	)
}
```

> If you're using the subcomponents as shown in [this example](/examples/configuration/exploded), the editor instance is provided by the [`TldrawEditor`](/reference/editor/TldrawEditor) component.

## Reactive state

The editor's state is reactive. Methods like [`Editor.getSelectedShapeIds`](/reference/editor/Editor#getSelectedShapeIds) or [`Editor.getCurrentPageShapes`](/reference/editor/Editor#getCurrentPageShapes) return values that automatically update when the underlying data changes. You can use these values directly in React components with the `track` wrapper or [`useValue`](/reference/state-react/useValue) hook.

```tsx
import { track, useEditor } from 'tldraw'

export const SelectedShapeIdsCount = track(() => {
	const editor = useEditor()
	return <div>{editor.getSelectedShapeIds().length}</div>
})
```

See the [Signals](/sdk-features/signals) article for more on tldraw's reactive state system.

## Batching changes

Each change to the editor happens within a transaction. You can batch multiple changes into a single transaction using the [`Editor.run`](/reference/editor/Editor#run) method. Batching improves performance and reduces overhead for persisting or distributing changes.

```ts
editor.run(() => {
	editor.createShapes(myShapes)
	editor.sendToBack(myShapes)
	editor.selectNone()
})
```

The `run` method also accepts options to control history and locked shape behavior:

```ts
// Make changes without affecting undo/redo history
editor.run(
	() => {
		editor.createShapes(myShapes)
	},
	{ history: 'ignore' }
)

// Make changes to locked shapes
editor.run(
	() => {
		editor.updateShapes(myLockedShapes)
	},
	{ ignoreShapeLock: true }
)
```

## Capabilities

The editor provides methods and properties organized around these areas:

### Data

- **[Signals](/sdk-features/signals)** — Reactive state primitives
- **[Store](/sdk-features/store)** — The reactive database holding all records
- **[Shapes](/sdk-features/shapes)** — Create, read, update, and delete shapes
- **[Bindings](/sdk-features/bindings)** — Relationships between shapes
- **[Pages](/sdk-features/pages)** — Manage document pages
- **[Assets](/sdk-features/assets)** — Images, videos, and other media

### Interaction

- **[Tools](/sdk-features/tools)** — The state machine that handles user input
- **[Selection](/sdk-features/selection)** — Manage which shapes are selected
- **[Input handling](/sdk-features/input-handling)** — Pointer and keyboard state
- **[Events](/sdk-features/events)** — Subscribe to user interactions and state changes

### View

- **[Camera](/sdk-features/camera)** — Control viewport position and zoom
- **[Coordinates](/sdk-features/coordinates)** — Convert between screen and page space

### State management

- **[Instance state](/sdk-features/instance-state)** — Per-editor settings like current tool and focus
- **[Visibility](/sdk-features/visibility)** — Control which shapes are shown
- **[History](/sdk-features/history)** — Undo, redo, and history management
- **[Side effects](/sdk-features/side-effects)** — React to record lifecycle changes

### Configuration

- **[User preferences](/sdk-features/user-preferences)** — Cross-instance settings like dark mode
- **[Readonly mode](/sdk-features/readonly)** — Disable editing
- **[Locked shapes](/sdk-features/locked-shapes)** — Prevent changes to specific shapes

### Output

- **[Image export](/sdk-features/image-export)** — Export to SVG, PNG, and other formats

---

See the [`Editor`](/reference/editor/Editor) API reference for the complete list of methods and properties.


The `Tldraw` component provides the tldraw editor as a regular React component. You can put this component anywhere in your React project. In this example, we make the component take up the height and width of the container.

By default, the component does not persist between refreshes or sync locally between tabs. To keep your work after a refresh, check the [persistence key example](https://tldraw.dev/examples/persistence-key).

```tsx
// App.tsx

import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'

export default function BasicExample() {
	return (
		<div className="editor">
			<Tldraw
				onMount={(editor) => {
					editor.selectAll()
				}}
			/>
		</div>
	)
}
```


Starter kits provide example implementations of common canvas-based use cases. Use them to prototype ideas or as the foundation for new projects. The source code is yours to hack on.

---

## Create with tldraw

You can access starter kits using the `npm create tldraw@latest` command:

```bash
npm create tldraw@latest
```

Or by using a template repository on [GitHub](https://github.com/orgs/tldraw/repositories).

---

## Available kits

### [Workflow](/starter-kits/workflow)

Build visual tools where users drag, connect and execute nodes to build automation pipelines within a canvas interface. Set up your first workflow builder in minutes, then customize nodes and behaviors for your specific use case. Drag-and-drop nodes, automatic connection routing, and execution management out of the box.

<StarterKitBento
	type="workflow"
	href="/starter-kits/workflow"
	img={{ src: '/images/starter-kits/workflow.png', alt: 'Workflow Starter Kit' }}
/>

Try the [Workflow starter kit](/starter-kits/workflow).

### [Chat](/starter-kits/chat)

Canvas for sketching, annotation, and markup before sending to AI.

<StarterKitBento
	type="chat"
	href="/starter-kits/chat"
	img={{ src: '/images/starter-kits/chat.png', alt: 'Chat Starter Kit' }}
/>

Try the [Chat starter kit](/starter-kits/chat).

### [Agent](/starter-kits/agent)

Enabling AI agents to interpret and interact with canvas drawings and elements.

<StarterKitBento
	type="agent"
	href="/starter-kits/agent"
	img={{ src: '/images/starter-kits/agent.png', alt: 'Agent Starter Kit' }}
/>

### [Image pipeline](/starter-kits/image-pipeline)

Visual node-based builder for AI image generation pipelines. Chain prompts, models, and processing steps to create complex image workflows with real-time preview.

<StarterKitBento
	type="image-pipeline"
	href="/starter-kits/image-pipeline"
	img={{ src: '/images/starter-kits/pipeline.png', alt: 'Image Pipeline Starter Kit' }}
/>

Try the [Image pipeline starter kit](/starter-kits/image-pipeline).

### [Branching chat](/starter-kits/branching-chat)

Visual branching conversation interface that lets you create interactive chat trees with AI integration.

<StarterKitBento
	type="branching"
	href="/starter-kits/branching-chat"
	img={{ src: '/images/starter-kits/branching.png', alt: 'Branching Starter Kit' }}
/>

Try the [Branching chat starter kit](/starter-kits/branching-chat).

### [Multiplayer](/starter-kits/multiplayer)

Self-hosted tldraw with real-time multiplayer collaboration powered by tldraw sync and Cloudflare Durable Objects.

<StarterKitBento
	type="multiplayer"
	href="/starter-kits/multiplayer"
	img={{ src: '/images/starter-kits/multi.png', alt: 'Multiplayer Starter Kit' }}
/>

Try the [Multiplayer starter kit](/starter-kits/multiplayer).

### [Shader](/starter-kits/shader)

Integrate WebGL shaders with tldraw, creating dynamic backgrounds that respond to canvas interactions.

<StarterKitBento
	type="shader"
	href="/starter-kits/shader"
	img={{ src: '/images/starter-kits/shader.png', alt: 'Shader Starter Kit' }}
/>

---

## Why build with starter kits

<CheckItem>Complete starter code built around the tldraw SDK</CheckItem>
<CheckItem>Ready for real-time collaboration</CheckItem>
<CheckItem>Custom shape systems and tool implementations</CheckItem>

<br />

<div className="flex flex-col gap-4">
	<Feature icon="bolt" title="Ship features in weeks, not months">
    Skip the months of research and implementation. Each kit provides tested solutions for complex canvas interactions.
</Feature>

    <Feature icon="cube" title="Production-ready from day one">
    Start further, prototype faster. Get extra features, patterns, and components relevant to your use-case.

  </Feature>

    <Feature icon="wrench" title="Built for customization">
    Use as a reference or the foundation for something new. The starter kit code is MIT licensed and free to hack with.

  </Feature>

    <Feature icon="shield" title="Validated by engineering teams">
    Built around common use cases. Every component uses the SDK's extensible APIs. Add custom shapes, tools, and behaviors on top.

  </Feature>

  </div>

---

Starter kits use the same [license](/community/license) as the tldraw SDK.



Starter kits provide example implementations of common canvas-based use cases. Use them to prototype ideas or as the foundation for new projects. The source code is yours to hack on.

---

## Create with tldraw

You can access starter kits using the `npm create tldraw@latest` command:

```bash
npm create tldraw@latest
```

Or by using a template repository on [GitHub](https://github.com/orgs/tldraw/repositories).

---

## Available kits

### [Workflow](/starter-kits/workflow)

Build visual tools where users drag, connect and execute nodes to build automation pipelines within a canvas interface. Set up your first workflow builder in minutes, then customize nodes and behaviors for your specific use case. Drag-and-drop nodes, automatic connection routing, and execution management out of the box.

<StarterKitBento
	type="workflow"
	href="/starter-kits/workflow"
	img={{ src: '/images/starter-kits/workflow.png', alt: 'Workflow Starter Kit' }}
/>

Try the [Workflow starter kit](/starter-kits/workflow).

### [Chat](/starter-kits/chat)

Canvas for sketching, annotation, and markup before sending to AI.

<StarterKitBento
	type="chat"
	href="/starter-kits/chat"
	img={{ src: '/images/starter-kits/chat.png', alt: 'Chat Starter Kit' }}
/>

Try the [Chat starter kit](/starter-kits/chat).

### [Agent](/starter-kits/agent)

Enabling AI agents to interpret and interact with canvas drawings and elements.

<StarterKitBento
	type="agent"
	href="/starter-kits/agent"
	img={{ src: '/images/starter-kits/agent.png', alt: 'Agent Starter Kit' }}
/>

### [Image pipeline](/starter-kits/image-pipeline)

Visual node-based builder for AI image generation pipelines. Chain prompts, models, and processing steps to create complex image workflows with real-time preview.

<StarterKitBento
	type="image-pipeline"
	href="/starter-kits/image-pipeline"
	img={{ src: '/images/starter-kits/pipeline.png', alt: 'Image Pipeline Starter Kit' }}
/>

Try the [Image pipeline starter kit](/starter-kits/image-pipeline).

### [Branching chat](/starter-kits/branching-chat)

Visual branching conversation interface that lets you create interactive chat trees with AI integration.

<StarterKitBento
	type="branching"
	href="/starter-kits/branching-chat"
	img={{ src: '/images/starter-kits/branching.png', alt: 'Branching Starter Kit' }}
/>

Try the [Branching chat starter kit](/starter-kits/branching-chat).

### [Multiplayer](/starter-kits/multiplayer)

Self-hosted tldraw with real-time multiplayer collaboration powered by tldraw sync and Cloudflare Durable Objects.

<StarterKitBento
	type="multiplayer"
	href="/starter-kits/multiplayer"
	img={{ src: '/images/starter-kits/multi.png', alt: 'Multiplayer Starter Kit' }}
/>

Try the [Multiplayer starter kit](/starter-kits/multiplayer).

### [Shader](/starter-kits/shader)

Integrate WebGL shaders with tldraw, creating dynamic backgrounds that respond to canvas interactions.

<StarterKitBento
	type="shader"
	href="/starter-kits/shader"
	img={{ src: '/images/starter-kits/shader.png', alt: 'Shader Starter Kit' }}
/>

---

## Why build with starter kits

<CheckItem>Complete starter code built around the tldraw SDK</CheckItem>
<CheckItem>Ready for real-time collaboration</CheckItem>
<CheckItem>Custom shape systems and tool implementations</CheckItem>

<br />

<div className="flex flex-col gap-4">
	<Feature icon="bolt" title="Ship features in weeks, not months">
    Skip the months of research and implementation. Each kit provides tested solutions for complex canvas interactions.
</Feature>

    <Feature icon="cube" title="Production-ready from day one">
    Start further, prototype faster. Get extra features, patterns, and components relevant to your use-case.

  </Feature>

    <Feature icon="wrench" title="Built for customization">
    Use as a reference or the foundation for something new. The starter kit code is MIT licensed and free to hack with.

  </Feature>

    <Feature icon="shield" title="Validated by engineering teams">
    Built around common use cases. Every component uses the SDK's extensible APIs. Add custom shapes, tools, and behaviors on top.

  </Feature>

  </div>

---

Starter kits use the same [license](/community/license) as the tldraw SDK.