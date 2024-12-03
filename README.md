# Numbers Station Embeddable Widget

## Demo

You can play with he demo here: https://embeddable-testbed.vercel.app/

## Usage

### Basic Integration
To embed the widget, include the following script (ideally in the app head):
```html
<script src=`${PUBLIC_WIDGET_URL}/loader.js` data-account=`${ACCOUNT_NAME}`></script>
```
where 
- `ACCOUNT_NAME` should be your account name on [app.numbersstation.ai](https://app.numbersstation.ai/)
- `PUBLIC_WIDGET_URL` should be the url where the widget is hosted.

The widget should now appear in the bottom-left of the screen.

### API
To use the api, include the following script as well:
```html
<script src=`${PUBLIC_WIDGET_URL}/widgetApi.js`></script>
```
Then to use the api
```ts
widgetApi().then((api) => {
  api.setChatId(chatId);
});
```

## API 

- `setChatId(chatId : string)` Navigates to the chat with the provided chat id. Only chats belonging to the account can be passed in.
- `hide()`: Hides the widget
- `show()`: Shows the widget
- `toggle()`: Toggles widget visibility
