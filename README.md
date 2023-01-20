# Cortado

Cortado is a process mining tool dedicated for interactive/incremental process disocvery.
The [website of Cortado](https://cortado.fit.fraunhofer.de) contains various information on Cortado, such as a functionality overview, screenshots, and a list of publications on algorithms implemented in Cortado. 

## Repository Structure 

All source code is located in `src/`.
Cortado's architecture is divided into a Python-based backend (`src/backend`) and a frontend based on web-technologies (`src/frontend`).

## Setup

### Install Frontend Dependencies
* Install Node.js latest LTS Version: 18.13.0 (https://nodejs.org/en/download/)
* Install all packages required by the frontend
  * Navigate to `src/frontend/` 
  * Execute `npm install` (this command installs all dependencies listed in `package.json`)

### Install Backend Dependencies
* Install Python 3.10.x (https://www.python.org/downloads/). Make sure to install a 64-BIT version.
* Optional (recommended): Install Graphviz (required by PM4Py) and add it to your PATH, see https://graphviz.org/download/ and https://pm4py.fit.fraunhofer.de/static/assets/api/2.3.0/install.html
* Optional (recommended): Create a virtual environment (https://docs.python.org/3/library/venv.html) and activate it
* Install all packages required by the backend
  * Navigate to `src/backend/` 
  * Execute `pip install -r requirements.txt`

## Execute Cortado from Code
### Start Backend
* Navigate to `src/backend/`
* Execute `python main.py`

### Start Frontend
* Navigate to `src/frontend/`
* Execute `npm start` to run Cortado's frontend
* Open your browser on http://localhost:4444/


## Build Cortado&mdash;Standalone Application

To build executables from the source code, both the backend and frontend have to be converted.
We use PyInstaller (https://pyinstaller.org/) to bundle all backend related files into a single executable.
We use Electron (https://www.electronjs.org/) to generate an executable  of the Frontend. 

In `build_scripts/` there are scripts for each major OS to build Cortado.
* Windows `build_cortado_windows.ps1`
* MacOS `build_cortado_macos.sh`
* Linux `build_cortado_linux.sh`

Note that the operating systems must match the script, otherwise the build will fail. 
Thus, if you are building Cortado for Windows, you must run the corresponding script on a Windows machine.

## Citing Cortado

If you are using or referencing Cortado in scientific papers, please cite Cortado as follows.

> Schuster, D., van Zelst, S.J., van der Aalst, W.M.P. (2021). Cortado—An Interactive Tool for Data-Driven Process Discovery and Modeling. In: Application and Theory of Petri Nets and Concurrency. PETRI NETS 2021. Lecture Notes in Computer Science, vol 12734. Springer, Cham. https://doi.org/10.1007/978-3-030-76983-3_23

Download citation 
[.BIB](https://citation-needed.springer.com/v2/references/10.1007/978-3-030-76983-3_23?format=bibtex&flavour=citation)&nbsp;
[.RIS](https://citation-needed.springer.com/v2/references/10.1007/978-3-030-76983-3_23?format=refman&flavour=citation)&nbsp;
[.ENW](https://citation-needed.springer.com/v2/references/10.1007/978-3-030-76983-3_23?format=endnote&flavour=citation)

DOI
[10.1007/978-3-030-76983-3_23](https://doi.org/10.1007/978-3-030-76983-3_23)

