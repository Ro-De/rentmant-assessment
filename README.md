# 🪴 Rentman Assessment

This project was generated using [**Angular CLI**](https://github.com/angular/angular-cli) version **20.3.4**.  
It is a standalone Angular application styled with **TailwindCSS**, designed to display and interact with hierarchical folder/item data.

---

## 🚀 Development Server

To start a local development server, run:

```bash
ng serve
```

Then open your browser at **[http://localhost:4200/](http://localhost:4200/)**.  
The app will automatically reload whenever you modify any source files.

---

## 🧱 Code Scaffolding

Use Angular CLI’s built-in schematics to generate components, directives, pipes, and more.

To create a new component:
```bash
ng generate component component-name
```

To view all available schematics:
```bash
ng generate --help
```

---

## 🏗️ Building

To build the project for production:
```bash
ng build
```

The compiled output will be located in the **`dist/`** directory.  
Production builds are optimized for **speed and performance**.

---

## 🧪 Running Unit Tests

Run the unit tests using [**Karma**](https://karma-runner.github.io):

```bash
ng test
```

Unit tests ensure that your services, resolvers, and components behave as expected.

---

## 📚 Additional Resources

For more information about the Angular CLI, visit:  
👉 [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli)

---

## 🧩 Project Notes & Development Phases

### **Phase 1: Initial Setup**

1. Create GitHub repository.
2. Initialize Angular project:

   ```bash
   ng new rentman-assessment --routing=false --style=css --standalone
   cd rentman-assessment
   ```

3. Push initial setup to GitHub:

   ```bash
   git branch -M main
   git push -u origin main
   ```

4. Create initial interfaces and models.
5. Add `TreeNode` model for hierarchical folder/item structure.

---

### **Phase 2: Implementation**

1. Implement basic data loading and log data to the console to verify correctness.
2. Develop core tree logic for folder-item hierarchy.
3. Incrementally implement and refine features based on console results.
4. **Partial implementation** of selection management (individual and folder selection logic).
5. **Partial implementation** of node expansion/collapse functionality.
6. **Partial implementation** of observable streams for state management.
7. Validate that all tree operations and resolver logic behave as expected.

---

### **Phase 3: Core Service & UI Integration**

1. **DataService** completed with full state management using **RxJS BehaviorSubject**.
2. Implemented data transformation from API response to `TreeNode` hierarchy.
3. Built tree construction logic with proper parent-child relationships.
4. **Completed selection management features** and integrated with UI:
   - Individual item selection
   - Folder selection (automatically selects all children)
   - Indeterminate state for folders with partial selections
   - Clear all selections functionality
5. **Completed node expansion/collapse** functionality and linked to component.
6. **Completed observable streams** for reactive state updates and connected to UI:
   - `treeData$` - hierarchical tree structure
   - `selectedIds$` - array of selected item IDs
   - `loading$` - loading state indicator
7. Added error handling and loading states.
8. Implemented helper methods for tree traversal and state manipulation.
9. Full UI integration with TailwindCSS styling and Angular components.

---

### ✅ Summary

This project demonstrates:

- Modular Angular standalone components
- TailwindCSS integration
- Data service and resolver interaction
- Reactive tree rendering logic
- Test-driven development practices (unit testing with Karma)
- Clear project structure for maintainability
