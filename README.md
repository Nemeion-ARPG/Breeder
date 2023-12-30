# Nemeion Breeder

## Requirements

- [VS Code](https://code.visualstudio.com)
    - Extensions
        - Dev Containers
        - Volar (Vue Plugin)
        - GitHub CoPilot
- [Docker](https://www.docker.com/get-started/)

## Running & Testing

Connect via "Open folder in container..." command. This will run the project in a "Dev Container".

Then, run the command

```
yarn dev
```

Now you should be able to open http://localhost:8080 in your browser to see the project.

As you make changes, the dev server should automatically update with your changes in real-time.

## Styling

This project uses [Bootstrap](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/components.html), so refer to that documentation for customization.

Otherwise, use standard HTML and CSS to style to your hearts content.

Anything within the `<style scoped>` blocks of the components will be applied to only HTML within that component's template.

Use `assets/base.css` to define top-level constant things such as fonts and colors, and then `assets/main.css` to define baseline styling across the entire web page.

## Deploying Changes

This project will automatically build the website and deploy any time changes are pushed to the `main` branch. No need to manually run build commands.
