# 2.3-SE-Cakey
Course: Introduction to Software Engineering

## About us
| ID       | Name       | Account                                                   |
|----------|------------|-----------------------------------------------------------|
| 19127078 | Thanh Truc | [nguyendothanhtruc](https://github.com/nguyendothanhtruc) |
| 19127097 | Phuong Anh | [nnpanh](https://github.com/nnpanh)                       |
| 19127097 | Duc Hieu   | [duchieuvn](https://github.com/duchieuvn)                 |
| 19127082 | Tat Truong | [TruongNguyen0104](https://github.com/TruongNguyen0104)   |
| 19127511 | Hong Phuc  | [phineasla](https://github.com/phineasla)                 |

## Monorepo migration
1. Clone all repositories you want to merge (for example `repo-a`). Then create new repository you want to merge into (let's call it `monorepo`).
1. Install `git-filter-repo`: 
    - For Windows user: install as python package `pip3 install git-filter-repo`.
    - For other OS please refer [here](https://github.com/newren/git-filter-repo/blob/main/INSTALL.md).
```
cd path/to/repo-a
git filter-repo --to-subdirectory-filter <subdirectory-name> # your repo-a will now become repo-a/<subdirectory-name>.
cd path/to/monorepo
git remote add repo-a /path/to/repo-a
git fetch repo-a --tags
git merge --allow-unrelated-histories repo-a/main # or whichever branch you want to merge
git remote remove project-a
```

Reference: [How do you merge two Git repositories?](https://stackoverflow.com/a/10548919/12405558)
