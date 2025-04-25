fetch('data.xlsx')  // Načte soubor Excelu 'data.xlsx' z URL nebo serveru.
  .then(response => response.arrayBuffer())  // Převede odpověď (data) na ArrayBuffer, což je binární formát.
  .then(data => {  // Pokud je odpověď úspěšná, provede následující kód:
    const workbook = XLSX.read(data, { type: 'array' });  // Načte binární data jako Excel soubor (workbook).
    const sheet = workbook.Sheets[workbook.SheetNames[0]];  // Získá první list z pracovního sešitu.
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });  // Převede list na JSON, kde první řádek jsou názvy sloupců.

    const table = document.createElement('table');  // Vytvoří nový element pro tabulku.
    table.className = "min-w-full border border-gray-300 rounded-xl";  // Přidá CSS třídy pro stylování tabulky.

    json.forEach((row, rowIndex) => {  // Prochází každý řádek v JSON datech:
      const tr = document.createElement('tr');  // Vytvoří nový řádek tabulky.
      row.forEach((cell, cellIndex) => {  // Prochází každou buňku v řádku:
        const td = rowIndex === 0 ? document.createElement('th') : document.createElement('td');  // Pokud je řádek první, vytvoří buňku <th> (hlavičku), jinak <td> (běžnou buňku).
        td.textContent = cell ?? "";  // Nastaví obsah buňky na hodnotu z JSON nebo prázdnou hodnotu pokud je buňka prázdná.
        td.className = "border px-4 py-2";  // Přidá CSS třídy pro stylování buňky.
        if (rowIndex !== 0) td.contentEditable = "true";  // Pokud není první řádek (hlavička), umožní editaci buňky.

        td.addEventListener('input', (event) => {  // Přidá posluchač události pro změnu v buňce (když uživatel upraví hodnotu):
          json[rowIndex][cellIndex] = event.target.textContent;  // Uloží změněný obsah buňky do JSON dat.
        });

        tr.appendChild(td);  // Přidá buňku do řádku.
      });
      table.appendChild(tr);  // Přidá řádek do tabulky.
    });

    document.getElementById('excel-table').appendChild(table);  // Přidá tabulku do HTML elementu s ID 'excel-table'.

    const searchInput = document.getElementById('search-input');  // Získá HTML element pro vyhledávání.
    searchInput.addEventListener('input', function() {  // Přidá posluchač události pro vstup do vyhledávacího pole (každé zadání):
      const searchTerm = searchInput.value.toLowerCase();  // Získá hodnotu z vyhledávacího pole a převede ji na malá písmena.
      const rows = table.getElementsByTagName('tr');  // Získá všechny řádky tabulky.

      Array.from(rows).forEach(row => {  // Prochází všechny řádky:
        let rowMatch = false;  // Flag pro označení, zda je řádek shodný s hledaným výrazem.
        const cells = row.getElementsByTagName('td');  // Získá všechny buňky v řádku.
        const header = row.getElementsByTagName('th');  // Získá všechny buňky hlavičky řádku.

        Array.from(cells).forEach(cell => {  // Prochází všechny buňky v řádku:
          if (cell.textContent.toLowerCase().includes(searchTerm)) {  // Pokud obsah buňky obsahuje hledaný výraz:
            rowMatch = true;  // Nastaví flag na true.
            cell.classList.add('highlight');  // Přidá třídu pro zvýraznění buňky.
          } else {
            cell.classList.remove('highlight');  // Odstraní třídu pro zvýraznění.
          }
        });

        if (header.length) rowMatch = true;  // Pokud má řádek hlavičku, vždy jej zobrazí (zajistí, že hlavička je vždy viditelná).
        row.style.display = rowMatch ? '' : 'none';  // Zobrazí nebo skryje řádek, pokud je shodný s hledaným výrazem.
      });
    });

    document.getElementById('save-btn').addEventListener('click', () => {  // Po kliknutí na tlačítko pro uložení:
      fetch('/upload', {  // Odesílá požadavek na server pro uložení změn:
        method: 'POST',
        body: JSON.stringify(json),  // Posílá upravená data ve formátu JSON.
        headers: { 'Content-Type': 'application/json' }
      })
      .then(response => response.blob())  // Pokud server vrátí odpověď, přetvoří ji na blob (soubor).
      .then(blob => {  // Po přijetí souboru:
        const url = window.URL.createObjectURL(blob);  // Vytvoří dočasné URL pro stažení souboru.
        const a = document.createElement('a');  // Vytvoří nový element <a> pro stažení.
        a.href = url;  // Nastaví URL pro stažení.
        a.download = 'updated_data.xlsx';  // Nastaví název souboru.
        document.body.appendChild(a);  // Přidá odkaz do těla dokumentu.
        a.click();  // Automaticky klikne na odkaz pro stažení souboru.
        window.URL.revokeObjectURL(url);  // Uvolní dočasné URL.
      })
      .catch(error => console.error('Error:', error));  // Pokud dojde k chybě při odesílání dat na server.
    });
  })
  .catch(err => {  // Pokud se nepodaří načíst Excel soubor:
    document.getElementById('excel-table').innerText = 'Error loading Excel file.';  // Zobrazí chybovou zprávu.
    console.error(err);  // Vypíše chybu do konzole.
  });

document.getElementById("copyButton").addEventListener("click", () => {  // Kliknutí na tlačítko pro kopírování "@":
  const table = document.querySelector("table");  // Získá tabulku.
  if (!table) return;  // Pokud není tabulka, nic se nestane.

  const cellsWithAt = [];  // Vytvoří prázdné pole pro uložení hodnot obsahujících "@":

  for (let row of table.rows) {  // Prochází všechny řádky tabulky:
    for (let cell of row.cells) {  // Prochází všechny buňky v řádku:
      const text = cell.textContent.trim();  // Získá text buňky a ořízne mezery.
      if (text.includes("@")) cellsWithAt.push(text);  // Pokud buňka obsahuje "@", přidá ji do pole.
    }
  }

  if (cellsWithAt.length === 0) { alert("⚠️ Nebyly nalezeny žádné buňky s '@'."); return; }  // Pokud žádné buňky neobsahují "@", zobrazí varování.
  const clipboardText = cellsWithAt.join(" ");  // Spojí všechny buňky obsahující "@" do jednoho řetězce, oddělené mezerami.
  navigator.clipboard.writeText(clipboardText)  // Zkopíruje text do schránky.
    .then(() => alert("✅ Všechny emaily byly zkopírovány."))  // Potvrdí úspěch.
    .catch(err => alert("❌ Chyba při kopírování."));  // Pokud dojde k chybě při kopírování, zobrazí chybu.
});

// Ovládání levého dropdown
const dropdownTitle = document.getElementById("dropdownTitle");
const dropdown = document.getElementById("dropdownOptions");
dropdownTitle.addEventListener("click", () => {
  if (dropdown.classList.contains("hidden")) {  // Pokud je dropdown skrytý:
    dropdown.classList.remove("hidden"); dropdown.classList.remove("animate-dropdown-out");
    dropdown.classList.add("animate-dropdown-in");  // Přidá animaci pro zobrazení.
  } else {
    dropdown.classList.remove("animate-dropdown-in"); dropdown.classList.add("animate-dropdown-out");  // Přidá animaci pro skrytí.
    setTimeout(() => dropdown.classList.add("hidden"), 300);  // Počkejte na dokončení animace před skrytím.
  }
});

// Ovládání pravého dropdown
const dropdownTitleRight = document.getElementById("dropdownTitleRight");
const dropdownRight = document.getElementById("dropdownOptionsRight");
dropdownTitleRight.addEventListener("click", () => {
  if (dropdownRight.classList.contains("hidden")) {  // Pokud je pravý dropdown skrytý:
    dropdownRight.classList.remove("hidden"); dropdownRight.classList.remove("animate-dropdown-out");
    dropdownRight.classList.add("animate-dropdown-in");  // Přidá animaci pro zobrazení.
  } else {
    dropdownRight.classList.remove("animate-dropdown-in"); dropdownRight.classList.add("animate-dropdown-out");  // Přidá animaci pro skrytí.
    setTimeout(() => dropdownRight.classList.add("hidden"), 300);  // Počkejte na dokončení animace před skrytím.
  }
});



  
  
  
  
  
  
  
  




