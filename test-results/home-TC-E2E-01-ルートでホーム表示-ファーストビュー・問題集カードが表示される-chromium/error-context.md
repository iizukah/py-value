# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "EXER" [ref=e4] [cursor=pointer]:
        - /url: /
      - navigation "メインメニュー" [ref=e5]:
        - link "問題一覧" [ref=e6] [cursor=pointer]:
          - /url: /py-value
        - link "お気に入り" [ref=e7] [cursor=pointer]:
          - /url: /py-value/favorites
        - link "履歴" [ref=e8] [cursor=pointer]:
          - /url: /py-value/history
        - link "管理" [ref=e9] [cursor=pointer]:
          - /url: /admin
  - main [ref=e10]:
    - region "ファーストビュー" [ref=e11]:
      - heading "EXER" [level=1] [ref=e12]
      - paragraph [ref=e13]: Exercise the Mind, Master the Skill.
      - link "GET STARTED" [ref=e15] [cursor=pointer]:
        - /url: /py-value
  - contentinfo [ref=e16]: SYSTEM ONLINE|EXER FRAMEWORK
  - alert [ref=e17]
```