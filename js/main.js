document.addEventListener("DOMContentLoaded", () => {
    (() => {
        const input = document.getElementById("search-text");
        const button = document.getElementById("search-button");
        const result = document.getElementById("search-result");

        const wikiFetch = async (inputValue) => {
            // wikipediaからのデータをJSON形式に変換
            const fetchValue = fetch(`https://ja.wikipedia.org/w/api.php?format=json&action=query&origin=*&list=search&srlimit=20&srsearch=${inputValue}`, {
                method: "GET"
            })
                .then((value) => {
                    return value.json();
                })
                .catch(() => {
                    alert("wikipediaへのアクセスに失敗しました。");
                });

            // 非同期処理を実行
            const valueJson = await fetchValue;
            // 必要な情報が入っている配列を取得
            const valueTargets = valueJson.query.search;

            if (!valueTargets.length) {
                alert("検索したワードはヒットしませんでした。")
            } else {
                const elemWrap = document.createElement("div");

                for (const elem of valueTargets) {
                    // a要素を作ってリンク先にページIDを設定する
                    const elemBlock = document.createElement("a");
                    elemBlock.setAttribute("target", "_blank");
                    elemBlock.setAttribute("rel", "noopener noreferrer");
                    const elemId = elem.pageid;
                    elemBlock.setAttribute("href", `http://jp.wikipedia.org/?curid=${elemId}`);

                    // h3要素を作ってタイトルを設定する
                    const elemH3 = document.createElement("h3");
                    elemH3.textContent = elem.title;

                    // p要素を作って更新日を設定する
                    const elemP = document.createElement("p");
                    const elemDate = elem.timestamp;
                    const elemDateSlice = elemDate.slice(0, 10).replace(/-/g, ".");
                    elemP.textContent = "最終更新日：" + elemDateSlice;

                    // 作成した要素を順番に組み合わせていく
                    elemBlock.appendChild(elemH3);
                    elemWrap.appendChild(elemBlock);
                    elemWrap.appendChild(elemP);
                    result.appendChild(elemWrap);
                }
            }
        };

        const wikiData = () => {
            result.innerHTML = "";
            // Input要素に入力されたテキストを取得
            const inputValue = input.value;
            wikiFetch(inputValue);
        };

        button.addEventListener("click", wikiData, false);
    })();

    // みんなの検索ワード
    function loadWords() {
        d3.csv("https://docs.google.com/spreadsheets/d/1B4cmXtKt1gLW4odadW6PnFTQsNpeyAhOe7T88OGyNCA/export?format=csv&range=A3:D", function (error, data) {
            if (error) {
                console.error(error);
                return;
            }
            data.reverse();
            const maxNum = 20;
            const sliced = data.slice(0, maxNum);
            function escapeHTML(text) {
                return text ? text.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
            }
            var text = "";
            // 最新の検索ワードを20件表示する
            for (var i = 0; i < sliced.length; i++) {
                var timestamp = escapeHTML(data[i]["Timestamp"]);
                var word = escapeHTML(data[i]["Word"]);
                text += "<p>" + timestamp + "<strong>" + word + "</strong></p>";
            }
            d3.select("#words").html(text);
        });
    }

    // 最初に1回読み込み
    loadWords();

    // 10秒ごとに更新
    setInterval(loadWords, 10000);
});
