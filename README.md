# AD.FOLIO Commerce Design Skill / 有料电商平面设计 Skill

[简体中文](#简体中文) · [English](#english)

![Editable product launch poster / 可编辑新品海报](examples/coffee-launch.svg)

## 简体中文

把 AD.FOLIO 网站的电商设计流程整理成一个可在 Codex 中使用的 Skill。给它商品图、用途和文案，它可以帮助选版式、组织卖点、做可编辑的设计，并核对导出的成品。支持商品主图、活动海报、商品详情页、店铺横幅，以及五页商品介绍套系。

- **内容**：12 套免费模板和 66 套 STUDIO 模板的双语索引、10 类新作风格、画布与排版指南、图片格式和交付检查、可运行的原创 SVG 示例。
- **安装**：把整个仓库目录复制到项目的 `.agents/skills/adfolio-commerce-design/`，确认其中有 `SKILL.md`。重新打开项目后，用 `$adfolio-commerce-design` 调用。[Codex 技能文档](https://learn.chatgpt.com/docs/build-skills)
- **示例指令**：`用 $adfolio-commerce-design 为这款冷萃咖啡做一张上新海报，用复古票据风格，输出可编辑 SVG。价格先留待确认。`

如需手动运行本地示例，在仓库目录使用 Node.js 18 或更新版本：

```sh
node scripts/render-svg.mjs examples/coffee-launch.json coffee-launch.svg
```

生成的 SVG 可在浏览器中预览。也可以复制示例 JSON，按自己的商品填写信息，并用 `image` 指定相对于 JSON 的本地 PNG 或 JPG。需要发布用的 PNG 或 JPG 时，按交付指南将设计转换为图片并检查画面。

这个仓库包含方法、模板索引和独立原创示例。网站的付费模板文件、站点配置和商品素材保留在原项目中。你可以把本仓库作为独立项目发布到 GitHub。

## English

An agent skill that turns the AD.FOLIO workflow into practical e-commerce graphic design. Give it a product image, a placement, and some copy. It can choose a layout, build an editable design, and check the final exports. It covers product cards, campaign posters, product detail pages, store banners, and coordinated five-page listing sets.

- **Included:** a bilingual index of 12 free designs and 66 STUDIO designs, ten new style directions, layout and export guidance, and a runnable original SVG example.
- **Install:** copy the entire repository folder to `.agents/skills/adfolio-commerce-design/` in your Codex project, with `SKILL.md` inside it. Reopen the project and invoke `$adfolio-commerce-design`. [Codex skills documentation](https://learn.chatgpt.com/docs/build-skills)
- **Example prompt:** `Use $adfolio-commerce-design to make a retro ticket-style launch poster for this cold brew. Deliver editable SVG and leave the price as a placeholder.`

To run the example manually, use Node.js 18 or later from the repository root:

```sh
node scripts/render-svg.mjs examples/coffee-launch.json coffee-launch.svg
```

Open the SVG in a browser to preview it. To work with your own product, copy the example JSON and optionally set `image` to a local PNG or JPG path relative to that JSON. For a PNG or JPG deliverable, rasterize the design and verify the result using the export guide.

This repository contains the workflow, design index, and a separate original example. The website's paid template files, deployment configuration, and product assets stay in the original project. You can publish this repository as an independent GitHub project.

## References / 参考

- [Layout and style guide / 版式与风格指南](references/layouts-and-styles.md)
- [Export and QA / 导出与交付检查](references/export-and-qa.md)
- [Bilingual design catalog / 双语模板目录](references/catalog.md)
